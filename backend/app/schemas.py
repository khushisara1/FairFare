"""Contract-first Pydantic v2 schemas for API requests and responses."""

from datetime import datetime
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.models import SplitMode


class TripCreate(BaseModel):
    """Payload to create a new trip."""

    name: str = Field(min_length=1, max_length=120)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    description: Optional[str] = Field(default=None, max_length=500)


class TripRead(BaseModel):
    """Serialized trip metadata."""

    id: int
    name: str
    currency: str
    description: Optional[str] = None
    created_at: datetime
    member_count: int = 0
    expense_count: int = 0
    total_spend_cents: int = 0


class MemberCreate(BaseModel):
    """Payload to add a member to a trip."""

    name: str = Field(min_length=1, max_length=80)


class MemberRead(BaseModel):
    """Serialized trip member."""

    id: int
    trip_id: int
    name: str
    created_at: datetime


class CustomSplitInput(BaseModel):
    """Exact integer-cent share for a member in a custom split."""

    member_id: int
    share_cents: int = Field(ge=0)


class ExpenseCreate(BaseModel):
    """Payload to log a new expense with equal, subset, or custom split."""

    title: str = Field(min_length=1, max_length=160)
    amount_cents: int = Field(gt=0)
    category: str = Field(min_length=1, max_length=60)
    payer_id: int
    split_mode: SplitMode = SplitMode.EQUAL
    participant_ids: Optional[list[int]] = None
    custom_splits: Optional[list[CustomSplitInput]] = None


class ExpenseSplitRead(BaseModel):
    """Serialized per-member share of an expense."""

    member_id: int
    member_name: str
    share_cents: int


class ExpenseRead(BaseModel):
    """Serialized expense with resolved payer and split breakdown."""

    id: int
    trip_id: int
    payer_id: int
    payer_name: str
    title: str
    amount_cents: int
    category: str
    split_mode: SplitMode
    created_at: datetime
    splits: list[ExpenseSplitRead]


class BalanceSummary(BaseModel):
    """Zero-sum net balance summary for a trip member."""

    member_id: int
    member_name: str
    total_paid_cents: int
    total_owed_cents: int
    net_balance_cents: int
    status: Literal["creditor", "debtor", "settled"]


class SettlementTransfer(BaseModel):
    """A single simplified peer-to-peer payment."""

    from_member_id: int
    from_member_name: str
    to_member_id: int
    to_member_name: str
    amount_cents: int


class CategoryInsight(BaseModel):
    """Spending breakdown for a single expense category."""

    category: str
    total_cents: int
    expense_count: int
    percentage: float


class PayerInsight(BaseModel):
    """Aggregated payer metrics for a trip."""

    member_id: int
    member_name: str
    total_paid_cents: int
    expense_count: int


class TripInsights(BaseModel):
    """Spending insights for a trip."""

    trip_id: int
    total_spend_cents: int
    expense_count: int
    per_person_average_cents: int
    top_categories: list[CategoryInsight]
    highest_payer: Optional[PayerInsight] = None
    most_frequent_payer: Optional[PayerInsight] = None


class NudgeTone(str, Enum):
    """Tone presets for low-awkwardness Nudge messages."""

    CASUAL = "casual"
    PLAYFUL = "playful"
    DIRECT = "direct"


class NudgeRequest(BaseModel):
    """Request to generate a copyable Nudge message for a transfer."""

    from_member_id: int
    to_member_id: int
    amount_cents: int = Field(gt=0)
    tone: NudgeTone = NudgeTone.CASUAL


class NudgeResponse(BaseModel):
    """Generated low-awkwardness Nudge message."""

    trip_name: str
    from_member_name: str
    to_member_name: str
    amount_cents: int
    tone: NudgeTone
    message: str


class TripDetailResponse(BaseModel):
    """Complete trip payload combining members, expenses, balances, settlements, and insights."""

    trip: TripRead
    members: list[MemberRead]
    expenses: list[ExpenseRead]
    balances: list[BalanceSummary]
    settlements: list[SettlementTransfer]
    insights: TripInsights
    zero_sum_verified: bool
