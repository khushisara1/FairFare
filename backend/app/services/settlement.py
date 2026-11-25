"""Zero-sum net balance calculator and greedy <= N-1 minimum-payment simplifier."""

from collections import defaultdict
from collections.abc import Sequence

from app.models import Expense, ExpenseSplit, Member
from app.schemas import BalanceSummary, SettlementTransfer


def calculate_balances(
    members: Sequence[Member],
    expenses: Sequence[Expense],
    splits: Sequence[ExpenseSplit],
) -> list[BalanceSummary]:
    """Compute per-member paid, owed, and net balances, asserting strict zero-sum."""
    paid_by_member: dict[int, int] = defaultdict(int)
    owed_by_member: dict[int, int] = defaultdict(int)

    for exp in expenses:
        paid_by_member[exp.payer_id] += exp.amount_cents

    for sp in splits:
        owed_by_member[sp.member_id] += sp.share_cents

    balances: list[BalanceSummary] = []
    for member in sorted(members, key=lambda m: m.id):
        paid = paid_by_member[member.id]
        owed = owed_by_member[member.id]
        net = paid - owed
        if net > 0:
            status = "creditor"
        elif net < 0:
            status = "debtor"
        else:
            status = "settled"

        balances.append(
            BalanceSummary(
                member_id=member.id,
                member_name=member.name,
                total_paid_cents=paid,
                total_owed_cents=owed,
                net_balance_cents=net,
                status=status,
            )
        )

    net_sum = sum(b.net_balance_cents for b in balances)
    assert net_sum == 0, f"Zero-sum invariant violated: sum(net_balances) == {net_sum}"
    return balances


def simplify_settlements(balances: Sequence[BalanceSummary]) -> list[SettlementTransfer]:
    """Match debtors to creditors greedily to produce at most N-1 transfers."""
    creditors = [
        [b.member_id, b.member_name, b.net_balance_cents]
        for b in balances
        if b.net_balance_cents > 0
    ]
    debtors = [
        [b.member_id, b.member_name, -b.net_balance_cents]
        for b in balances
        if b.net_balance_cents < 0
    ]

    creditors.sort(key=lambda c: (-c[2], c[0]))
    debtors.sort(key=lambda d: (-d[2], d[0]))

    transfers: list[SettlementTransfer] = []
    i = 0
    j = 0

    while i < len(debtors) and j < len(creditors):
        debtor_id, debtor_name, owes = debtors[i]
        creditor_id, creditor_name, owed = creditors[j]

        transfer_cents = min(owes, owed)
        if transfer_cents > 0:
            transfers.append(
                SettlementTransfer(
                    from_member_id=debtor_id,
                    from_member_name=debtor_name,
                    to_member_id=creditor_id,
                    to_member_name=creditor_name,
                    amount_cents=transfer_cents,
                )
            )

        debtors[i][2] -= transfer_cents
        creditors[j][2] -= transfer_cents

        if debtors[i][2] == 0:
            i += 1
        if creditors[j][2] == 0:
            j += 1

    if balances:
        assert len(transfers) <= max(0, len(balances) - 1)
    return transfers
