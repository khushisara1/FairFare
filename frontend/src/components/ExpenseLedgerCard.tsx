"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatCents, formatShortDate } from "@/lib/format";
import type { ExpenseRead } from "@/types/api";

interface ExpenseLedgerCardProps {
  tripId: number;
  currency: string;
  expenses: ExpenseRead[];
  currentMemberId?: number | null;
  onDeleted: () => void;
}

const SPLIT_MODE_LABEL: Record<ExpenseRead["split_mode"], string> = {
  equal: "Equal",
  subset: "Subset",
  custom: "Custom",
};

export function ExpenseLedgerCard({
  tripId,
  currency,
  expenses,
  currentMemberId,
  onDeleted,
}: ExpenseLedgerCardProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "mine">("all");
  const [error, setError] = useState<string | null>(null);

  const visibleExpenses =
    filterMode === "mine" && currentMemberId != null
      ? expenses.filter(
          (exp) =>
            exp.payer_id === currentMemberId ||
            exp.splits.some((sp) => sp.member_id === currentMemberId)
        )
      : expenses;

  async function handleDelete(expenseId: number) {
    setDeletingId(expenseId);
    setError(null);
    try {
      await api.deleteExpense(tripId, expenseId);
      onDeleted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete expense.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section
      aria-labelledby="ledger-heading"
      className="bg-parchment border border-hairline rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <h2 id="ledger-heading" className="font-editorial text-lg font-bold text-walnut">
            Recent Expense Ledger
          </h2>
          <p className="text-xs text-taupe">
            {visibleExpenses.length} {visibleExpenses.length === 1 ? "expense" : "expenses"}{" "}
            {filterMode === "mine" && currentMemberId != null ? "involving you" : "recorded"}
          </p>
        </div>

        <div
          role="group"
          aria-label="Filter expenses"
          className="inline-flex p-1 rounded-xl bg-alabaster border border-hairline"
        >
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === "all"
                ? "bg-sage text-parchment"
                : "text-taupe hover:text-walnut"
            }`}
          >
            All
          </button>
          <button
            type="button"
            disabled={currentMemberId == null}
            title={
              currentMemberId == null
                ? "Sign in or select your name above to filter your expenses"
                : "Show only expenses you paid or split"
            }
            onClick={() => setFilterMode("mine")}
            className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-45 ${
              filterMode === "mine"
                ? "bg-sage text-parchment"
                : "text-taupe hover:text-walnut"
            }`}
          >
            My Expenses
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-warning-bg text-warning-fg text-xs font-medium">
          {error}
        </div>
      )}

      {visibleExpenses.length === 0 ? (
        <div className="p-8 rounded-xl bg-alabaster border border-hairline text-center space-y-1">
          <p className="text-sm font-medium text-walnut">
            {filterMode === "mine" ? "No expenses involving you yet" : "No expenses logged yet"}
          </p>
          <p className="text-xs text-taupe">
            {filterMode === "mine"
              ? "Switch back to All or add a new expense."
              : "Click “+ Add Expense” above to log your first shared cost."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
          {visibleExpenses.map((exp) => (
            <li
              key={exp.id}
              className="p-3.5 rounded-xl bg-alabaster border border-hairline flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-walnut truncate">
                    {exp.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-sage-tint text-sage">
                    {exp.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-parchment border border-hairline text-taupe">
                    {SPLIT_MODE_LABEL[exp.split_mode]} ({exp.splits.length})
                  </span>
                </div>
                <p className="text-xs text-taupe">
                  Paid by <span className="font-medium text-walnut">{exp.payer_name}</span> ·{" "}
                  {formatShortDate(exp.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono font-semibold text-sm text-walnut tabular-currency">
                  {formatCents(exp.amount_cents, currency)}
                </span>
                <button
                  type="button"
                  disabled={deletingId === exp.id}
                  onClick={() => handleDelete(exp.id)}
                  aria-label={`Delete expense ${exp.title}`}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-taupe hover:text-debtor-fg hover:bg-debtor-bg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
