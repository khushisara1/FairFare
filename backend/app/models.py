"""SQLAlchemy 2.0 relational tables for Trips, Members, Expenses, and ExpenseSplits."""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import CheckConstraint, DateTime, Enum as SAEnum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SplitMode(str, Enum):
    """Supported expense split modes."""

    EQUAL = "equal"
    SUBSET = "subset"
    CUSTOM = "custom"


class User(Base):
    """Authenticated user linked optionally to trip member slots."""

    __tablename__ = "user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    memberships: Mapped[list["Member"]] = relationship(back_populates="user")


class Trip(Base):
    """A group trip containing members and shared expenses."""

    __tablename__ = "trip"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    members: Mapped[list["Member"]] = relationship(
        back_populates="trip", cascade="all, delete-orphan"
    )
    expenses: Mapped[list["Expense"]] = relationship(
        back_populates="trip", cascade="all, delete-orphan"
    )


class Member(Base):
    """A participant belonging to a single trip."""

    __tablename__ = "member"
    __table_args__ = (UniqueConstraint("trip_id", "name", name="uq_member_trip_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trip.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    trip: Mapped["Trip"] = relationship(back_populates="members")
    user: Mapped[Optional["User"]] = relationship(back_populates="memberships")
    paid_expenses: Mapped[list["Expense"]] = relationship(back_populates="payer")
    splits: Mapped[list["ExpenseSplit"]] = relationship(back_populates="member")


class Expense(Base):
    """A single trip expense stored strictly in integer cents/paise."""

    __tablename__ = "expense"
    __table_args__ = (CheckConstraint("amount_cents > 0", name="ck_expense_amount_positive"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trip.id", ondelete="CASCADE"), index=True)
    payer_id: Mapped[int] = mapped_column(ForeignKey("member.id", ondelete="RESTRICT"), index=True)
    title: Mapped[str] = mapped_column(String(160))
    amount_cents: Mapped[int] = mapped_column(Integer)
    category: Mapped[str] = mapped_column(String(60), index=True)
    split_mode: Mapped[SplitMode] = mapped_column(
        SAEnum(SplitMode, native_enum=False), default=SplitMode.EQUAL
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    trip: Mapped["Trip"] = relationship(back_populates="expenses")
    payer: Mapped["Member"] = relationship(back_populates="paid_expenses")
    splits: Mapped[list["ExpenseSplit"]] = relationship(
        back_populates="expense", cascade="all, delete-orphan"
    )


class ExpenseSplit(Base):
    """Per-member share of an expense in integer cents/paise."""

    __tablename__ = "expensesplit"
    __table_args__ = (
        UniqueConstraint("expense_id", "member_id", name="uq_split_expense_member"),
        CheckConstraint("share_cents >= 0", name="ck_split_share_non_negative"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    expense_id: Mapped[int] = mapped_column(ForeignKey("expense.id", ondelete="CASCADE"), index=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("member.id", ondelete="CASCADE"), index=True)
    share_cents: Mapped[int] = mapped_column(Integer)

    expense: Mapped["Expense"] = relationship(back_populates="splits")
    member: Mapped["Member"] = relationship(back_populates="splits")
