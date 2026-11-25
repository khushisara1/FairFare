"use client";

import { useState } from "react";
import { CheckCircle2, UserPlus } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatCents, formatSignedCents } from "@/lib/format";
import type { BalanceSummary } from "@/types/api";

interface BalancesCardProps {
  tripId: number;
  currency: string;
  balances: BalanceSummary[];
  zeroSumVerified: boolean;
  onMemberAdded: () => void;
}

const STATUS_BADGE: Record<
  BalanceSummary["status"],
  { label: string; className: string }
> = {
  creditor: {
    label: "Is owed",
    className: "bg-creditor-bg text-creditor-fg",
  },
  debtor: {
    label: "Owes",
    className: "bg-debtor-bg text-debtor-fg",
  },
  settled: {
    label: "Settled",
    className: "bg-settled-bg text-settled-fg",
  },
};

export function BalancesCard({
  tripId,
  currency,
  balances,
  zeroSumVerified,
  onMemberAdded,
}: BalancesCardProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!memberName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.addMember(tripId, { name: memberName.trim() });
      setMemberName("");
      setShowAdd(false);
      onMemberAdded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add member.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="balances-heading"
      className="bg-parchment border border-hairline rounded-2xl p-6 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 id="balances-heading" className="font-editorial text-lg font-bold text-walnut">
            Net Balances
          </h2>
          <p className="text-xs text-taupe">
            Paid minus fair share across all trip expenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          {zeroSumVerified && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-creditor-bg text-creditor-fg">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Zero-sum verified
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setShowAdd((prev) => !prev);
              setError(null);
            }}
            className="min-h-[44px] px-3 rounded-xl border border-hairline bg-alabaster hover:bg-sage-tint text-walnut text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4 text-sage" aria-hidden="true" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAddMember}
          className="p-3.5 rounded-xl bg-alabaster border border-hairline space-y-2.5"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <label htmlFor="new-member-name" className="sr-only">
              Member name
            </label>
            <input
              id="new-member-name"
              type="text"
              required
              maxLength={80}
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Enter traveler name (e.g., Jordan)"
              className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-parchment border border-hairline text-sm text-walnut placeholder:text-taupe/70"
            />
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-4 rounded-xl bg-sage text-parchment text-sm font-semibold hover:opacity-95 transition-opacity disabled:opacity-60"
            >
              {submitting ? "Adding..." : "Save"}
            </button>
          </div>
          {error && (
            <p role="alert" className="text-xs font-medium text-debtor-fg">
              {error}
            </p>
          )}
        </form>
      )}

      {balances.length === 0 ? (
        <div className="p-6 rounded-xl bg-alabaster border border-hairline text-center space-y-1">
          <p className="text-sm font-medium text-walnut">No travelers added yet</p>
          <p className="text-xs text-taupe">
            Add at least 2 members to start splitting expenses.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {balances.map((item) => {
            const badge = STATUS_BADGE[item.status];
            const amountColor =
              item.status === "creditor"
                ? "text-creditor-fg"
                : item.status === "debtor"
                  ? "text-debtor-fg"
                  : "text-settled-fg";

            return (
              <li
                key={item.member_id}
                className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-alabaster border border-hairline"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-walnut truncate">
                      {item.member_name}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-taupe mt-0.5 font-mono tabular-currency">
                    Paid {formatCents(item.total_paid_cents, currency)} · Share{" "}
                    {formatCents(item.total_owed_cents, currency)}
                  </p>
                </div>

                <span
                  className={`font-mono font-semibold text-base tabular-currency shrink-0 ${amountColor}`}
                >
                  {formatSignedCents(item.net_balance_cents, currency)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
