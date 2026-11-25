"""FastAPI endpoints for user sync, member claiming, and personal spending summary."""

from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import Expense, ExpenseSplit, Member, Trip, User
from app.schemas import (
    MemberRead,
    UserClaimMemberRequest,
    UserRead,
    UserSummaryResponse,
    UserSyncRequest,
)

router = APIRouter(prefix="/api/users", tags=["users"])


def _upsert_user(
    session: Session, email: str, name: str, avatar_url: Optional[str] = None
) -> User:
    normalized_email = email.strip().lower()
    user = session.scalar(select(User).where(func.lower(User.email) == normalized_email))
    if user is None:
        user = User(
            email=normalized_email,
            name=name.strip(),
            avatar_url=avatar_url,
        )
        session.add(user)
        session.flush()
    else:
        if name.strip():
            user.name = name.strip()
        if avatar_url is not None:
            user.avatar_url = avatar_url

    # Link any unlinked member slots matching this user's email or display name
    first_name = user.name.split()[0].lower() if user.name.strip() else ""
    unlinked_members = session.scalars(select(Member).where(Member.user_id.is_(None))).all()
    for member in unlinked_members:
        member_lower = member.name.strip().lower()
        if member_lower == user.name.strip().lower() or (
            first_name and member_lower == first_name
        ):
            member.user_id = user.id

    session.commit()
    session.refresh(user)
    return user


@router.post("/sync", response_model=UserRead)
def sync_user(
    payload: UserSyncRequest, session: Session = Depends(get_session)
) -> UserRead:
    """Upsert an authenticated user and link matching trip member slots."""
    user = _upsert_user(session, payload.email, payload.name, payload.avatar_url)
    return UserRead(
        id=user.id,
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
    )


@router.post("/claim-member", response_model=MemberRead)
def claim_member(
    payload: UserClaimMemberRequest, session: Session = Depends(get_session)
) -> MemberRead:
    """Explicitly link a member slot to an authenticated user."""
    normalized_email = payload.email.strip().lower()
    user = session.scalar(select(User).where(func.lower(User.email) == normalized_email))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    member = session.get(Member, payload.member_id)
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    member.user_id = user.id
    session.commit()
    session.refresh(member)
    return MemberRead(
        id=member.id,
        trip_id=member.trip_id,
        user_id=member.user_id,
        name=member.name,
        created_at=member.created_at,
    )


@router.get("/me/summary", response_model=UserSummaryResponse)
def get_my_summary(
    email: Optional[str] = Query(default=None),
    guest_name: Optional[str] = Query(default=None),
    x_user_email: Optional[str] = Header(default=None, alias="X-User-Email"),
    session: Session = Depends(get_session),
) -> UserSummaryResponse:
    """Return integer-cent totals (paid, share, net balance change) across the user's trips."""
    header_email = x_user_email if isinstance(x_user_email, str) else None
    query_email = email if isinstance(email, str) else None
    query_guest = guest_name if isinstance(guest_name, str) else None
    resolved_email = (header_email or query_email or "").strip().lower()
    matched_members: list[Member] = []

    if resolved_email:
        user = session.scalar(select(User).where(func.lower(User.email) == resolved_email))
        if user is not None:
            matched_members = list(
                session.scalars(select(Member).where(Member.user_id == user.id)).all()
            )
            if not matched_members and user.name.strip():
                first = user.name.strip().split()[0].lower()
                all_members = session.scalars(select(Member)).all()
                matched_members = [
                    m
                    for m in all_members
                    if m.name.strip().lower() in {user.name.strip().lower(), first}
                ]
    elif query_guest and query_guest.strip():
        target = query_guest.strip().lower()
        first = target.split()[0]
        all_members = session.scalars(select(Member)).all()
        matched_members = [
            m for m in all_members if m.name.strip().lower() in {target, first}
        ]

    if not matched_members:
        return UserSummaryResponse(
            total_paid_cents=0,
            total_share_cents=0,
            net_balance_change_cents=0,
            trip_count=0,
            currency="USD",
        )

    member_ids = [m.id for m in matched_members]
    trip_ids = {m.trip_id for m in matched_members}

    total_paid_cents = int(
        session.scalar(
            select(func.coalesce(func.sum(Expense.amount_cents), 0)).where(
                Expense.payer_id.in_(member_ids)
            )
        )
        or 0
    )
    total_share_cents = int(
        session.scalar(
            select(func.coalesce(func.sum(ExpenseSplit.share_cents), 0)).where(
                ExpenseSplit.member_id.in_(member_ids)
            )
        )
        or 0
    )

    first_trip = session.get(Trip, next(iter(trip_ids)))
    currency = first_trip.currency if first_trip else "USD"

    return UserSummaryResponse(
        total_paid_cents=total_paid_cents,
        total_share_cents=total_share_cents,
        net_balance_change_cents=total_paid_cents - total_share_cents,
        trip_count=len(trip_ids),
        currency=currency,
    )
