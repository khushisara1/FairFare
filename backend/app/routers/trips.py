"""FastAPI endpoints for trips, members, expenses, balances, settlements, insights, and nudges."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.database import get_session
from app.models import Expense, ExpenseSplit, Member, Trip
from app.schemas import (
    BalanceSummary,
    ExpenseCreate,
    ExpenseRead,
    ExpenseSplitRead,
    MemberCreate,
    MemberRead,
    NudgeRequest,
    NudgeResponse,
    SettlementTransfer,
    TripCreate,
    TripDetailResponse,
    TripInsights,
    TripRead,
)
from app.services.insights import compute_trip_insights
from app.services.nudge import generate_nudge_message
from app.services.settlement import calculate_balances, simplify_settlements
from app.services.splitter import calculate_splits

router = APIRouter(prefix="/api/trips", tags=["trips"])


def _get_trip_or_404(session: Session, trip_id: int) -> Trip:
    trip = session.get(Trip, trip_id)
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
    return trip


def _load_trip_state(session: Session, trip_id: int):
    trip = _get_trip_or_404(session, trip_id)
    members = session.scalars(
        select(Member).where(Member.trip_id == trip_id).order_by(Member.id.asc())
    ).all()
    expenses = session.scalars(
        select(Expense)
        .where(Expense.trip_id == trip_id)
        .options(selectinload(Expense.splits))
        .order_by(Expense.created_at.desc(), Expense.id.desc())
    ).all()
    all_splits = [sp for exp in expenses for sp in exp.splits]
    return trip, members, expenses, all_splits


def _serialize_expense(expense: Expense, member_names: dict[int, str]) -> ExpenseRead:
    return ExpenseRead(
        id=expense.id,
        trip_id=expense.trip_id,
        payer_id=expense.payer_id,
        payer_name=member_names.get(expense.payer_id, "Unknown"),
        title=expense.title,
        amount_cents=expense.amount_cents,
        category=expense.category,
        split_mode=expense.split_mode,
        created_at=expense.created_at,
        splits=[
            ExpenseSplitRead(
                member_id=sp.member_id,
                member_name=member_names.get(sp.member_id, "Unknown"),
                share_cents=sp.share_cents,
            )
            for sp in sorted(expense.splits, key=lambda s: s.member_id)
        ],
    )


@router.get("", response_model=list[TripRead])
def list_trips(session: Session = Depends(get_session)) -> list[TripRead]:
    """List all trips with member count, expense count, and total spend."""
    trips = session.scalars(select(Trip).order_by(Trip.id.asc())).all()
    results: list[TripRead] = []
    for trip in trips:
        members = session.scalars(select(Member).where(Member.trip_id == trip.id)).all()
        expenses = session.scalars(select(Expense).where(Expense.trip_id == trip.id)).all()
        results.append(
            TripRead(
                id=trip.id,
                name=trip.name,
                currency=trip.currency,
                description=trip.description,
                created_at=trip.created_at,
                member_count=len(members),
                expense_count=len(expenses),
                total_spend_cents=sum(e.amount_cents for e in expenses),
            )
        )
    return results


@router.post("", response_model=TripRead, status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripCreate, session: Session = Depends(get_session)) -> TripRead:
    """Create a new trip."""
    trip = Trip(
        name=payload.name.strip(),
        currency=payload.currency.upper(),
        description=payload.description.strip() if payload.description else None,
    )
    session.add(trip)
    session.commit()
    session.refresh(trip)
    return TripRead(
        id=trip.id,
        name=trip.name,
        currency=trip.currency,
        description=trip.description,
        created_at=trip.created_at,
        member_count=0,
        expense_count=0,
        total_spend_cents=0,
    )


@router.get("/{trip_id}", response_model=TripDetailResponse)
def get_trip_detail(trip_id: int, session: Session = Depends(get_session)) -> TripDetailResponse:
    """Fetch complete trip state: members, expenses, zero-sum balances, settlements, and insights."""
    trip, members, expenses, all_splits = _load_trip_state(session, trip_id)
    member_names = {m.id: m.name for m in members}
    balances = calculate_balances(members, expenses, all_splits)
    settlements = simplify_settlements(balances)
    insights = compute_trip_insights(session, trip_id)

    return TripDetailResponse(
        trip=TripRead(
            id=trip.id,
            name=trip.name,
            currency=trip.currency,
            description=trip.description,
            created_at=trip.created_at,
            member_count=len(members),
            expense_count=len(expenses),
            total_spend_cents=insights.total_spend_cents,
        ),
        members=[
            MemberRead(
                id=m.id,
                trip_id=m.trip_id,
                user_id=m.user_id,
                name=m.name,
                created_at=m.created_at,
            )
            for m in members
        ],
        expenses=[_serialize_expense(exp, member_names) for exp in expenses],
        balances=balances,
        settlements=settlements,
        insights=insights,
        zero_sum_verified=(sum(b.net_balance_cents for b in balances) == 0),
    )


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: int, session: Session = Depends(get_session)) -> None:
    """Delete a trip and cascade-delete all associated members, expenses, and splits."""
    trip = _get_trip_or_404(session, trip_id)
    session.delete(trip)
    session.commit()


@router.post("/{trip_id}/members", response_model=MemberRead, status_code=status.HTTP_201_CREATED)
def add_member(
    trip_id: int, payload: MemberCreate, session: Session = Depends(get_session)
) -> MemberRead:
    """Add a new member to a trip, rejecting duplicate names in the same trip."""
    _get_trip_or_404(session, trip_id)
    member = Member(trip_id=trip_id, name=payload.name.strip())
    session.add(member)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Member '{member.name}' already exists in this trip.",
        ) from exc
    session.refresh(member)
    return MemberRead(
        id=member.id,
        trip_id=member.trip_id,
        user_id=member.user_id,
        name=member.name,
        created_at=member.created_at,
    )


@router.post("/{trip_id}/expenses", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
def add_expense(
    trip_id: int, payload: ExpenseCreate, session: Session = Depends(get_session)
) -> ExpenseRead:
    """Log an expense with remainder-safe equal, subset, or custom splits in one transaction."""
    _get_trip_or_404(session, trip_id)
    members = session.scalars(select(Member).where(Member.trip_id == trip_id)).all()
    member_names = {m.id: m.name for m in members}
    trip_member_ids = set(member_names.keys())

    if payload.payer_id not in trip_member_ids:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Payer {payload.payer_id} does not belong to this trip.",
        )

    try:
        share_map = calculate_splits(
            amount_cents=payload.amount_cents,
            split_mode=payload.split_mode,
            trip_member_ids=trip_member_ids,
            participant_ids=payload.participant_ids,
            custom_splits=payload.custom_splits,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    expense = Expense(
        trip_id=trip_id,
        payer_id=payload.payer_id,
        title=payload.title.strip(),
        amount_cents=payload.amount_cents,
        category=payload.category.strip(),
        split_mode=payload.split_mode,
    )
    session.add(expense)
    session.flush()

    for member_id, share_cents in share_map.items():
        session.add(
            ExpenseSplit(
                expense_id=expense.id,
                member_id=member_id,
                share_cents=share_cents,
            )
        )

    session.commit()
    session.refresh(expense)
    loaded = session.scalars(
        select(Expense).where(Expense.id == expense.id).options(selectinload(Expense.splits))
    ).one()
    return _serialize_expense(loaded, member_names)


@router.delete("/{trip_id}/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    trip_id: int, expense_id: int, session: Session = Depends(get_session)
) -> None:
    """Delete an expense and its associated splits."""
    expense = session.scalars(
        select(Expense).where(Expense.id == expense_id, Expense.trip_id == trip_id)
    ).first()
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found.")
    session.delete(expense)
    session.commit()


@router.get("/{trip_id}/balances", response_model=list[BalanceSummary])
def get_balances(trip_id: int, session: Session = Depends(get_session)) -> list[BalanceSummary]:
    """Get zero-sum net balances for a trip."""
    _, members, expenses, all_splits = _load_trip_state(session, trip_id)
    return calculate_balances(members, expenses, all_splits)


@router.get("/{trip_id}/settlements", response_model=list[SettlementTransfer])
def get_settlements(
    trip_id: int, session: Session = Depends(get_session)
) -> list[SettlementTransfer]:
    """Get minimum-payment (<= N-1) settlement transfers for a trip."""
    _, members, expenses, all_splits = _load_trip_state(session, trip_id)
    balances = calculate_balances(members, expenses, all_splits)
    return simplify_settlements(balances)


@router.get("/{trip_id}/insights", response_model=TripInsights)
def get_insights(trip_id: int, session: Session = Depends(get_session)) -> TripInsights:
    """Get spending category breakdown and top/frequent payers for a trip."""
    _get_trip_or_404(session, trip_id)
    return compute_trip_insights(session, trip_id)


@router.post("/{trip_id}/nudge", response_model=NudgeResponse)
def create_nudge(
    trip_id: int, payload: NudgeRequest, session: Session = Depends(get_session)
) -> NudgeResponse:
    """Generate a low-awkwardness Nudge message for a debtor-to-creditor transfer."""
    trip = _get_trip_or_404(session, trip_id)
    from_member = session.scalars(
        select(Member).where(Member.id == payload.from_member_id, Member.trip_id == trip_id)
    ).first()
    to_member = session.scalars(
        select(Member).where(Member.id == payload.to_member_id, Member.trip_id == trip_id)
    ).first()

    if from_member is None or to_member is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Both debtor and creditor must belong to this trip.",
        )

    return generate_nudge_message(
        trip_name=trip.name,
        currency=trip.currency,
        from_member_name=from_member.name,
        to_member_name=to_member.name,
        amount_cents=payload.amount_cents,
        tone=payload.tone,
    )
