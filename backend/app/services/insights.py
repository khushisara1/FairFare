"""Trip spending insights aggregation service."""

from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Expense, Member
from app.schemas import CategoryInsight, PayerInsight, TripInsights


def compute_trip_insights(session: Session, trip_id: int) -> TripInsights:
    """Compute category totals, per-person average, highest payer, and most frequent payer."""
    members = session.scalars(select(Member).where(Member.trip_id == trip_id)).all()
    expenses = session.scalars(select(Expense).where(Expense.trip_id == trip_id)).all()

    total_spend_cents = sum(exp.amount_cents for exp in expenses)
    expense_count = len(expenses)
    member_count = len(members)
    per_person_average_cents = (
        total_spend_cents // member_count if member_count > 0 else 0
    )

    category_totals: dict[str, int] = defaultdict(int)
    category_counts: dict[str, int] = defaultdict(int)
    payer_totals: dict[int, int] = defaultdict(int)
    payer_counts: dict[int, int] = defaultdict(int)

    for exp in expenses:
        category_totals[exp.category] += exp.amount_cents
        category_counts[exp.category] += 1
        payer_totals[exp.payer_id] += exp.amount_cents
        payer_counts[exp.payer_id] += 1

    top_categories: list[CategoryInsight] = []
    for category, cat_total in sorted(
        category_totals.items(),
        key=lambda item: (-item[1], -category_counts[item[0]], item[0]),
    ):
        percentage = (
            round((cat_total / total_spend_cents) * 100, 1)
            if total_spend_cents > 0
            else 0.0
        )
        top_categories.append(
            CategoryInsight(
                category=category,
                total_cents=cat_total,
                expense_count=category_counts[category],
                percentage=percentage,
            )
        )

    member_names = {m.id: m.name for m in members}
    payer_insights = [
        PayerInsight(
            member_id=mid,
            member_name=member_names.get(mid, "Unknown"),
            total_paid_cents=payer_totals[mid],
            expense_count=payer_counts[mid],
        )
        for mid in payer_totals
    ]

    highest_payer = (
        max(
            payer_insights,
            key=lambda p: (p.total_paid_cents, p.expense_count, -p.member_id),
        )
        if payer_insights
        else None
    )
    most_frequent_payer = (
        max(
            payer_insights,
            key=lambda p: (p.expense_count, p.total_paid_cents, -p.member_id),
        )
        if payer_insights
        else None
    )

    return TripInsights(
        trip_id=trip_id,
        total_spend_cents=total_spend_cents,
        expense_count=expense_count,
        per_person_average_cents=per_person_average_cents,
        top_categories=top_categories,
        highest_payer=highest_payer,
        most_frequent_payer=most_frequent_payer,
    )
