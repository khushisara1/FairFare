"""API handler integration tests including the 90-minute live gate scenario (4 people, 3 expenses)."""

from contextlib import contextmanager

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.main import health_check
from app.models import SplitMode
from app.routers.trips import (
    add_expense,
    add_member,
    create_nudge,
    create_trip,
    delete_expense,
    get_trip_detail,
)
from app.schemas import (
    CustomSplitInput,
    ExpenseCreate,
    MemberCreate,
    NudgeRequest,
    NudgeTone,
    TripCreate,
)


@contextmanager
def isolated_session():
    """Provide an isolated in-memory SQLite session with foreign keys enabled."""
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(test_engine, "connect")
    def _fk_on(dbapi_conn, _record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(
        bind=test_engine, autoflush=False, autocommit=False, expire_on_commit=False
    )
    with TestingSessionLocal() as session:
        yield session


def test_health_endpoint():
    res = health_check()
    assert res["status"] == "ok"
    assert res["service"] == "red-trip-splitter"


def test_90_minute_gate_4_people_3_expenses():
    with isolated_session() as session:
        # 1. Create fresh trip
        trip = create_trip(
            TripCreate(
                name="Gate Demo Weekend",
                currency="USD",
                description="4-person, 3-expense gate",
            ),
            session=session,
        )
        trip_id = trip.id

        # 2. Add 4 synthetic members
        member_ids = {}
        for name in ["Alex Reed", "Blake Park", "Casey Lin", "Drew Moss"]:
            member = add_member(trip_id, MemberCreate(name=name), session=session)
            member_ids[name] = member.id

        # Duplicate member must raise 409
        with pytest.raises(HTTPException) as exc_info:
            add_member(trip_id, MemberCreate(name="Alex Reed"), session=session)
        assert exc_info.value.status_code == 409

        # 3. Log 3 expenses: Equal ($100.01 odd cents), Subset ($40.00 for 2), Custom ($60.00 unequal)
        add_expense(
            trip_id,
            ExpenseCreate(
                title="Cabin Night",
                amount_cents=10001,
                category="Lodging",
                payer_id=member_ids["Alex Reed"],
                split_mode=SplitMode.EQUAL,
            ),
            session=session,
        )

        add_expense(
            trip_id,
            ExpenseCreate(
                title="Kayak Rental",
                amount_cents=4000,
                category="Activities",
                payer_id=member_ids["Blake Park"],
                split_mode=SplitMode.SUBSET,
                participant_ids=[member_ids["Blake Park"], member_ids["Casey Lin"]],
            ),
            session=session,
        )

        exp3 = add_expense(
            trip_id,
            ExpenseCreate(
                title="Group Dinner",
                amount_cents=6000,
                category="Dining",
                payer_id=member_ids["Casey Lin"],
                split_mode=SplitMode.CUSTOM,
                custom_splits=[
                    CustomSplitInput(member_id=member_ids["Alex Reed"], share_cents=1000),
                    CustomSplitInput(member_id=member_ids["Blake Park"], share_cents=1500),
                    CustomSplitInput(member_id=member_ids["Casey Lin"], share_cents=1500),
                    CustomSplitInput(member_id=member_ids["Drew Moss"], share_cents=2000),
                ],
            ),
            session=session,
        )

        # Invalid custom split must raise 422
        with pytest.raises(HTTPException) as bad_exc:
            add_expense(
                trip_id,
                ExpenseCreate(
                    title="Bad Split",
                    amount_cents=1000,
                    category="Dining",
                    payer_id=member_ids["Alex Reed"],
                    split_mode=SplitMode.CUSTOM,
                    custom_splits=[
                        CustomSplitInput(member_id=member_ids["Alex Reed"], share_cents=900)
                    ],
                ),
                session=session,
            )
        assert bad_exc.value.status_code == 422

        # 4. Verify full trip detail: zero-sum, <= N-1 transfers, insights
        detail = get_trip_detail(trip_id, session=session)
        assert detail.zero_sum_verified is True
        assert sum(b.net_balance_cents for b in detail.balances) == 0
        assert len(detail.settlements) <= 3
        assert detail.insights.total_spend_cents == 20001
        assert detail.insights.highest_payer.member_name == "Alex Reed"

        # 5. Verify Nudge endpoint on first settlement transfer
        first_transfer = detail.settlements[0]
        nudge = create_nudge(
            trip_id,
            NudgeRequest(
                from_member_id=first_transfer.from_member_id,
                to_member_id=first_transfer.to_member_id,
                amount_cents=first_transfer.amount_cents,
                tone=NudgeTone.PLAYFUL,
            ),
            session=session,
        )
        assert "Gate Demo Weekend" in nudge.message

        # 6. Verify expense deletion updates balances cleanly
        delete_expense(trip_id, exp3.id, session=session)
        after_del = get_trip_detail(trip_id, session=session)
        assert after_del.insights.total_spend_cents == 14001
        assert sum(b.net_balance_cents for b in after_del.balances) == 0
