"""Phase 4 edge-case math QA — extends existing Phase 2 tests with additional boundary scenarios."""

import pytest

from app.models import Expense, ExpenseSplit, Member, SplitMode
from app.schemas import CustomSplitInput
from app.services.settlement import calculate_balances, simplify_settlements
from app.services.splitter import calculate_splits, distribute_equal_cents


# ---------------------------------------------------------------------------
# 1. Odd-cent 3-way splits — every distribution variant
# ---------------------------------------------------------------------------

def test_odd_cent_3_way_no_cent_lost():
    """$10.01 split 3 ways: sum must == 1001 cents, no cent created or destroyed."""
    shares = distribute_equal_cents(1001, [1, 2, 3])
    assert sum(shares.values()) == 1001
    vals = sorted(shares.values())
    # Two members get 334, one gets 333  (or one gets 334 and two get 333)
    assert vals[-1] - vals[0] <= 1, "Odd-cent distribution must differ by at most 1 cent"


def test_odd_cent_2_way_prime_amount():
    """$0.01 split 2 ways: one person pays 1¢, the other 0¢ — total preserved."""
    shares = distribute_equal_cents(1, [10, 20])
    assert sum(shares.values()) == 1
    assert sorted(shares.values()) == [0, 1]


def test_large_prime_amount_equal_split():
    """$333.37 split 7 ways — deterministic, zero-drift."""
    amount = 33337
    member_ids = list(range(1, 8))
    shares = distribute_equal_cents(amount, member_ids)
    assert sum(shares.values()) == amount
    vals = sorted(shares.values())
    assert vals[-1] - vals[0] <= 1


# ---------------------------------------------------------------------------
# 2. 1-person subset split
# ---------------------------------------------------------------------------

def test_single_person_subset_full_amount():
    """Subset split with 1 participant: that person owes the entire amount."""
    shares = calculate_splits(
        amount_cents=5000,
        split_mode=SplitMode.SUBSET,
        trip_member_ids={1, 2, 3},
        participant_ids=[2],
    )
    assert shares == {2: 5000}
    assert sum(shares.values()) == 5000


def test_subset_excludes_non_participants():
    """Members NOT in participant_ids must have no share."""
    shares = calculate_splits(
        amount_cents=3000,
        split_mode=SplitMode.SUBSET,
        trip_member_ids={1, 2, 3, 4, 5},
        participant_ids=[1, 3],
    )
    assert 2 not in shares
    assert 4 not in shares
    assert 5 not in shares
    assert sum(shares.values()) == 3000


# ---------------------------------------------------------------------------
# 3. Zero-balance exclusion — settled members produce no transfers
# ---------------------------------------------------------------------------

def test_zero_balance_members_produce_no_transfers():
    """When a member's paid == owed exactly, they must not appear in any transfer."""
    members = [Member(id=i, trip_id=1, name=f"P{i}") for i in range(1, 4)]
    # P1 pays $10 for everyone; P2 pays $10 only for P3; P3 pays nothing
    # P2's net: paid 1000, owes 1000 (P1's share) → settled
    expenses = [
        Expense(id=1, trip_id=1, payer_id=1, title="X", amount_cents=3000, category="Food"),
        Expense(id=2, trip_id=1, payer_id=2, title="Y", amount_cents=1000, category="Food"),
    ]
    splits = [
        ExpenseSplit(expense_id=1, member_id=1, share_cents=1000),
        ExpenseSplit(expense_id=1, member_id=2, share_cents=1000),
        ExpenseSplit(expense_id=1, member_id=3, share_cents=1000),
        ExpenseSplit(expense_id=2, member_id=3, share_cents=1000),
    ]
    balances = calculate_balances(members, expenses, splits)
    zero_balance_members = {b.member_id for b in balances if b.status == "settled"}
    transfers = simplify_settlements(balances)
    transfer_member_ids = {t.from_member_id for t in transfers} | {t.to_member_id for t in transfers}
    # Settled members should not appear in any transfer
    assert zero_balance_members.isdisjoint(transfer_member_ids), (
        f"Settled members {zero_balance_members} appear in transfers involving {transfer_member_ids}"
    )
    assert sum(b.net_balance_cents for b in balances) == 0


# ---------------------------------------------------------------------------
# 4. Custom split mismatch rejection
# ---------------------------------------------------------------------------

def test_custom_split_over_allocated_raises():
    """Custom splits summing MORE than amount_cents must raise ValueError."""
    with pytest.raises(ValueError, match="difference"):
        calculate_splits(
            amount_cents=1000,
            split_mode=SplitMode.CUSTOM,
            trip_member_ids={1, 2},
            custom_splits=[
                CustomSplitInput(member_id=1, share_cents=600),
                CustomSplitInput(member_id=2, share_cents=600),  # 1200 > 1000
            ],
        )


def test_custom_split_under_allocated_raises():
    """Custom splits summing LESS than amount_cents must raise ValueError."""
    with pytest.raises(ValueError, match="difference"):
        calculate_splits(
            amount_cents=1000,
            split_mode=SplitMode.CUSTOM,
            trip_member_ids={1, 2},
            custom_splits=[
                CustomSplitInput(member_id=1, share_cents=400),
                CustomSplitInput(member_id=2, share_cents=400),  # 800 < 1000
            ],
        )


def test_custom_split_zero_share_member_allowed():
    """A member may have a zero-cent share in a custom split (explicitly excluded)."""
    shares = calculate_splits(
        amount_cents=1000,
        split_mode=SplitMode.CUSTOM,
        trip_member_ids={1, 2, 3},
        custom_splits=[
            CustomSplitInput(member_id=1, share_cents=1000),
            CustomSplitInput(member_id=2, share_cents=0),
        ],
    )
    assert sum(shares.values()) == 1000
    assert shares[1] == 1000


# ---------------------------------------------------------------------------
# 5. At-most N-1 transfers — multi-debtor/creditor scenarios
# ---------------------------------------------------------------------------

def test_n_minus_1_guarantee_with_all_different_net_balances():
    """6 people with 6 unique net balances: settlement must use ≤ 5 transfers."""
    members = [Member(id=i, trip_id=1, name=f"M{i}") for i in range(1, 7)]
    # Manually craft net balances that sum to 0
    # Creditors: M1=+5000, M2=+3000; Debtors: M3=-2000, M4=-2500, M5=-2000, M6=-1500
    expenses = [
        Expense(id=1, trip_id=1, payer_id=1, title="A", amount_cents=5000, category="Food"),
        Expense(id=2, trip_id=1, payer_id=2, title="B", amount_cents=3000, category="Food"),
    ]
    splits = [
        ExpenseSplit(expense_id=1, member_id=3, share_cents=2000),
        ExpenseSplit(expense_id=1, member_id=4, share_cents=2000),
        ExpenseSplit(expense_id=1, member_id=5, share_cents=1000),
        ExpenseSplit(expense_id=2, member_id=4, share_cents=500),
        ExpenseSplit(expense_id=2, member_id=5, share_cents=1000),
        ExpenseSplit(expense_id=2, member_id=6, share_cents=1500),
    ]
    balances = calculate_balances(members, expenses, splits)
    assert sum(b.net_balance_cents for b in balances) == 0
    transfers = simplify_settlements(balances)
    assert len(transfers) <= len(members) - 1, (
        f"Expected ≤ {len(members) - 1} transfers, got {len(transfers)}"
    )
    # Verify transferred total equals total creditor sum
    total_credits = sum(b.net_balance_cents for b in balances if b.net_balance_cents > 0)
    assert sum(t.amount_cents for t in transfers) == total_credits


def test_two_person_trip_exactly_one_transfer():
    """2-person trip must settle in exactly 1 transfer or 0 if already balanced."""
    members = [Member(id=1, trip_id=1, name="A"), Member(id=2, trip_id=1, name="B")]
    expenses = [Expense(id=1, trip_id=1, payer_id=1, title="X", amount_cents=2000, category="Food")]
    splits = [
        ExpenseSplit(expense_id=1, member_id=1, share_cents=1000),
        ExpenseSplit(expense_id=1, member_id=2, share_cents=1000),
    ]
    balances = calculate_balances(members, expenses, splits)
    transfers = simplify_settlements(balances)
    assert len(transfers) == 1  # B pays A $10
    assert transfers[0].amount_cents == 1000
