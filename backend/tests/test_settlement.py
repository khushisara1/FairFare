"""Unit tests for remainder-safe splitting, zero-sum balances, and greedy <= N-1 settlements."""

import pytest

from app.models import Expense, ExpenseSplit, Member, SplitMode
from app.schemas import CustomSplitInput
from app.services.settlement import calculate_balances, simplify_settlements
from app.services.splitter import calculate_splits, distribute_equal_cents


def test_odd_cent_equal_split_deterministic():
    shares = distribute_equal_cents(1000, [30, 10, 20])
    assert shares == {10: 334, 20: 333, 30: 333}
    assert sum(shares.values()) == 1000


def test_tiny_odd_cent_split():
    shares = distribute_equal_cents(5, [1, 2, 3])
    assert shares == {1: 2, 2: 2, 3: 1}
    assert sum(shares.values()) == 5


def test_subset_split_only_charges_selected_members():
    shares = calculate_splits(
        amount_cents=1001,
        split_mode=SplitMode.SUBSET,
        trip_member_ids={1, 2, 3, 4},
        participant_ids=[4, 2],
    )
    assert shares == {2: 501, 4: 500}
    assert sum(shares.values()) == 1001


def test_custom_split_validation_and_mismatch_rejection():
    valid = calculate_splits(
        amount_cents=2500,
        split_mode=SplitMode.CUSTOM,
        trip_member_ids={1, 2, 3},
        custom_splits=[
            CustomSplitInput(member_id=1, share_cents=1500),
            CustomSplitInput(member_id=2, share_cents=1000),
        ],
    )
    assert valid == {1: 1500, 2: 1000}

    with pytest.raises(ValueError, match="difference is 100 cents"):
        calculate_splits(
            amount_cents=2500,
            split_mode=SplitMode.CUSTOM,
            trip_member_ids={1, 2},
            custom_splits=[
                CustomSplitInput(member_id=1, share_cents=1400),
                CustomSplitInput(member_id=2, share_cents=1000),
            ],
        )


def test_circular_debt_cancels_to_zero_transfers():
    members = [Member(id=1, trip_id=1, name="A"), Member(id=2, trip_id=1, name="B"), Member(id=3, trip_id=1, name="C")]
    expenses = [
        Expense(id=1, trip_id=1, payer_id=1, title="E1", amount_cents=1000, category="Dining"),
        Expense(id=2, trip_id=1, payer_id=2, title="E2", amount_cents=1000, category="Dining"),
        Expense(id=3, trip_id=1, payer_id=3, title="E3", amount_cents=1000, category="Dining"),
    ]
    splits = [
        ExpenseSplit(expense_id=1, member_id=2, share_cents=1000),
        ExpenseSplit(expense_id=2, member_id=3, share_cents=1000),
        ExpenseSplit(expense_id=3, member_id=1, share_cents=1000),
    ]
    balances = calculate_balances(members, expenses, splits)
    assert sum(b.net_balance_cents for b in balances) == 0
    assert all(b.status == "settled" for b in balances)
    assert simplify_settlements(balances) == []


def test_greedy_simplification_at_most_n_minus_1_transfers():
    members = [Member(id=i, trip_id=1, name=f"M{i}") for i in range(1, 6)]
    expenses = [
        Expense(id=1, trip_id=1, payer_id=1, title="Lodging", amount_cents=10000, category="Lodging"),
        Expense(id=2, trip_id=1, payer_id=2, title="Food", amount_cents=3500, category="Dining"),
    ]
    splits = [
        ExpenseSplit(expense_id=1, member_id=1, share_cents=2000),
        ExpenseSplit(expense_id=1, member_id=2, share_cents=2000),
        ExpenseSplit(expense_id=1, member_id=3, share_cents=2000),
        ExpenseSplit(expense_id=1, member_id=4, share_cents=2000),
        ExpenseSplit(expense_id=1, member_id=5, share_cents=2000),
        ExpenseSplit(expense_id=2, member_id=1, share_cents=700),
        ExpenseSplit(expense_id=2, member_id=2, share_cents=700),
        ExpenseSplit(expense_id=2, member_id=3, share_cents=700),
        ExpenseSplit(expense_id=2, member_id=4, share_cents=700),
        ExpenseSplit(expense_id=2, member_id=5, share_cents=700),
    ]
    balances = calculate_balances(members, expenses, splits)
    assert sum(b.net_balance_cents for b in balances) == 0
    transfers = simplify_settlements(balances)
    assert len(transfers) <= len(members) - 1
    assert sum(t.amount_cents for t in transfers) == sum(
        b.net_balance_cents for b in balances if b.net_balance_cents > 0
    )
