"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { BalancesCard } from "@/components/BalancesCard";
import { ExpenseLedgerCard } from "@/components/ExpenseLedgerCard";
import { ExpenseModal } from "@/components/ExpenseModal";
import { Header } from "@/components/Header";
import { InsightsCard } from "@/components/InsightsCard";
import { NudgeModal } from "@/components/NudgeModal";
import { SettlementsCard } from "@/components/SettlementsCard";
import { TripDetailSkeleton } from "@/components/Skeletons";
import { api, ApiError } from "@/lib/api";
import { formatCents } from "@/lib/format";
import type { SettlementTransfer, TripDetailResponse } from "@/types/api";

function TripDetailContent() {
  const params = useParams<{ id: string }>();
  const tripId = Number(params.id);

  const [detail, setDetail] = useState<TripDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [nudgeTransfer, setNudgeTransfer] = useState<SettlementTransfer | null>(null);

  const loadDetail = useCallback(
    async (silent = false) => {
      if (!Number.isFinite(tripId)) {
        setError("Invalid trip ID.");
        setLoading(false);
        return;
      }
      if (!silent) setLoading(true);
      setError(null);
      try {
        const data = await api.getTripDetail(tripId);
        setDetail(data);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Could not load trip details."
        );
      } finally {
        setLoading(false);
      }
    },
    [tripId]
  );

  useEffect(() => {
    if (!Number.isFinite(tripId)) {
      return;
    }
    let cancelled = false;
    api
      .getTripDetail(tripId)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Could not load trip details."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  return (
    <div className="min-h-screen flex flex-col bg-alabaster">
      <Header backHref="/" backLabel="All Trips" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <TripDetailSkeleton />
        ) : error || !detail ? (
          <div
            role="alert"
            className="bg-parchment border border-hairline rounded-2xl p-6 space-y-4 max-w-xl mx-auto"
          >
            <h1 className="font-editorial text-xl font-bold text-walnut">
              Unable to Load Trip
            </h1>
            <p className="text-sm text-taupe">{error ?? "Trip not found."}</p>
            <button
              type="button"
              onClick={() => void loadDetail(false)}
              className="min-h-[44px] px-5 rounded-xl bg-amber-glow hover:bg-amber-hover text-amber-ink font-semibold text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Editorial Trip Header Banner */}
            <section className="bg-parchment border border-hairline rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sage-tint text-sage">
                    {detail.trip.currency}
                  </span>
                  <span className="text-xs font-medium text-taupe">
                    {detail.members.length} members · {detail.expenses.length} expenses ·{" "}
                    <span className="font-mono tabular-currency font-semibold text-walnut">
                      {formatCents(detail.trip.total_spend_cents, detail.trip.currency)}
                    </span>{" "}
                    total
                  </span>
                </div>
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-walnut">
                  {detail.trip.name}
                </h1>
                {detail.trip.description && (
                  <p className="text-sm text-taupe max-w-2xl">{detail.trip.description}</p>
                )}
              </div>

              {/* Single Primary Amber Glow CTA in Viewport */}
              <button
                type="button"
                onClick={() => setExpenseModalOpen(true)}
                className="min-h-[44px] px-5 rounded-xl bg-amber-glow hover:bg-amber-hover text-amber-ink font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Add Expense</span>
              </button>
            </section>

            {/* Minimalist Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
              <div className="lg:col-span-7">
                <BalancesCard
                  tripId={detail.trip.id}
                  currency={detail.trip.currency}
                  balances={detail.balances}
                  zeroSumVerified={detail.zero_sum_verified}
                  onMemberAdded={() => void loadDetail(true)}
                />
              </div>

              <div className="lg:col-span-5">
                <SettlementsCard
                  currency={detail.trip.currency}
                  settlements={detail.settlements}
                  memberCount={detail.members.length}
                  onSelectNudge={(transfer) => setNudgeTransfer(transfer)}
                />
              </div>

              <div className="lg:col-span-5">
                <InsightsCard
                  currency={detail.trip.currency}
                  insights={detail.insights}
                />
              </div>

              <div className="lg:col-span-7">
                <ExpenseLedgerCard
                  tripId={detail.trip.id}
                  currency={detail.trip.currency}
                  expenses={detail.expenses}
                  onDeleted={() => void loadDetail(true)}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {detail && expenseModalOpen && (
        <ExpenseModal
          open={expenseModalOpen}
          tripId={detail.trip.id}
          currency={detail.trip.currency}
          members={detail.members}
          onClose={() => setExpenseModalOpen(false)}
          onSaved={() => {
            setExpenseModalOpen(false);
            void loadDetail(true);
          }}
        />
      )}

      {detail && nudgeTransfer && (
        <NudgeModal
          open={true}
          tripId={detail.trip.id}
          currency={detail.trip.currency}
          transfer={nudgeTransfer}
          onClose={() => setNudgeTransfer(null)}
        />
      )}
    </div>
  );
}

export default function TripDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-alabaster">
          <Header backHref="/" backLabel="All Trips" />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
            <TripDetailSkeleton />
          </main>
        </div>
      }
    >
      <TripDetailContent />
    </Suspense>
  );
}
