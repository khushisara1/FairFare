export type SplitMode = "equal" | "subset" | "custom";

export type NudgeTone = "casual" | "playful" | "direct";

export type BalanceStatus = "creditor" | "debtor" | "settled";

export interface TripCreate {
  name: string;
  currency: string;
  description?: string | null;
}

export interface TripRead {
  id: number;
  name: string;
  currency: string;
  description: string | null;
  created_at: string;
  member_count: number;
  expense_count: number;
  total_spend_cents: number;
}

export interface MemberCreate {
  name: string;
}

export interface MemberRead {
  id: number;
  trip_id: number;
  user_id?: number | null;
  name: string;
  created_at: string;
}

export interface UserRead {
  id: number;
  email: string;
  name: string;
  avatar_url?: string | null;
  created_at: string;
}

export interface UserSummaryResponse {
  total_paid_cents: number;
  total_share_cents: number;
  net_balance_change_cents: number;
  trip_count: number;
  currency: string;
}

export interface CustomSplitInput {
  member_id: number;
  share_cents: number;
}

export interface ExpenseCreate {
  title: string;
  amount_cents: number;
  category: string;
  payer_id: number;
  split_mode: SplitMode;
  participant_ids?: number[] | null;
  custom_splits?: CustomSplitInput[] | null;
}

export interface ExpenseSplitRead {
  member_id: number;
  member_name: string;
  share_cents: number;
}

export interface ExpenseRead {
  id: number;
  trip_id: number;
  payer_id: number;
  payer_name: string;
  title: string;
  amount_cents: number;
  category: string;
  split_mode: SplitMode;
  created_at: string;
  splits: ExpenseSplitRead[];
}

export interface BalanceSummary {
  member_id: number;
  member_name: string;
  total_paid_cents: number;
  total_owed_cents: number;
  net_balance_cents: number;
  status: BalanceStatus;
}

export interface SettlementTransfer {
  from_member_id: number;
  from_member_name: string;
  to_member_id: number;
  to_member_name: string;
  amount_cents: number;
}

export interface CategoryInsight {
  category: string;
  total_cents: number;
  expense_count: number;
  percentage: number;
}

export interface PayerInsight {
  member_id: number;
  member_name: string;
  total_paid_cents: number;
  expense_count: number;
}

export interface TripInsights {
  trip_id: number;
  total_spend_cents: number;
  expense_count: number;
  per_person_average_cents: number;
  top_categories: CategoryInsight[];
  highest_payer: PayerInsight | null;
  most_frequent_payer: PayerInsight | null;
}

export interface NudgeRequest {
  from_member_id: number;
  to_member_id: number;
  amount_cents: number;
  tone: NudgeTone;
}

export interface NudgeResponse {
  trip_name: string;
  from_member_name: string;
  to_member_name: string;
  amount_cents: number;
  tone: NudgeTone;
  message: string;
}

export interface TripDetailResponse {
  trip: TripRead;
  members: MemberRead[];
  expenses: ExpenseRead[];
  balances: BalanceSummary[];
  settlements: SettlementTransfer[];
  insights: TripInsights;
  zero_sum_verified: boolean;
}
