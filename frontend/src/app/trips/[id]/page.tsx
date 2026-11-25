"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Copy, MessageCircle, Plus, Share2, Trash2, UserCheck } from "lucide-react";
import { BalancesCard } from "@/components/BalancesCard";
import { DeleteTripModal } from "@/components/DeleteTripModal";
import { ExpenseLedgerCard } from "@/components/ExpenseLedgerCard";
import { ExpenseModal } from "@/components/ExpenseModal";
import { Navbar, useGuestProfile } from "@/components/Navbar";
import { InsightsCard } from "@/components/InsightsCard";
import { NudgeModal } from "@/components/NudgeModal";
import { SettlementsCard } from "@/components/SettlementsCard";
import { TripDetailSkeleton } from "@/components/Skeletons";
import { api, ApiError } from "@/lib/api";
import { formatCents } from "@/lib/format";
import type { SettlementTransfer, TripDetailResponse } from "@/types/api";

function TripDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tripId = Number(params.id);
  const { data: session } = useSession();
  const guestProfile = useGuestProfile();

  const [detail, setDetail] = useState<TripDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [nudgeTransfer, setNudgeTransfer] = useState<SettlementTransfer | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(() => {
    if (typeof window === "undefined" || !Number.isFinite(tripId)) return null;
    try {
      const saved = window.localStorage.getItem(`fairfare_identity_${tripId}`);
      if (!saved) return null;
      const parsed = Number(saved);
      return Number.isFinite(parsed) ? parsed : null;
    } catch {
      return null;
    }
  });

  function handleSelectIdentity(memberId: number) {
    const next = selectedMemberId === memberId ? null : memberId;
    setSelectedMemberId(next);
    try {
      if (next === null) {
        window.localStorage.removeItem(`fairfare_identity_${tripId}`);
      } else {
        window.localStorage.setItem(`fairfare_identity_${tripId}`, String(next));
      }
    } catch {
      // Ignore storage errors
    }
  }

  async function handleCopyTripLink() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  }

  function getInviteWhatsAppUrl(tripName: string): string {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Join our "${tripName}" trip on FairFare – Trip Splitter! Tap your name to see balances or add expenses: ${url}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

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
      <Navbar backHref="/" backLabel="All Trips" />

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

              {/* Actions: Share / Invite + Single Primary Amber Glow CTA */}
              <div className="flex items-center gap-3 shrink-0 relative">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShareOpen((prev) => !prev)}
                    aria-expanded={shareOpen}
                    className="min-h-[44px] px-4 rounded-xl border border-hairline bg-alabaster hover:bg-sage-tint text-walnut text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-sage" aria-hidden="true" />
                    <span>Share / Invite</span>
                  </button>

                  {shareOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-parchment border border-hairline rounded-2xl p-2 space-y-1 z-30 shadow-sm">
                      <button
                        type="button"
                        onClick={() => void handleCopyTripLink()}
                        className="w-full min-h-[44px] px-3 rounded-xl text-left text-sm font-medium text-walnut hover:bg-sage-tint inline-flex items-center gap-2.5 transition-colors"
                      >
                        {linkCopied ? (
                          <Check className="w-4 h-4 text-creditor-fg shrink-0" aria-hidden="true" />
                        ) : (
                          <Copy className="w-4 h-4 text-sage shrink-0" aria-hidden="true" />
                        )}
                        <span>{linkCopied ? "Link Copied!" : "Copy Trip Link"}</span>
                      </button>

                      <a
                        href={getInviteWhatsAppUrl(detail.trip.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShareOpen(false)}
                        className="w-full min-h-[44px] px-3 rounded-xl text-left text-sm font-medium text-walnut hover:bg-sage-tint inline-flex items-center gap-2.5 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 text-sage shrink-0" aria-hidden="true" />
                        <span>Invite via WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(true)}
                  className="min-h-[44px] px-5 rounded-xl bg-amber-glow hover:bg-amber-hover text-amber-ink font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Add Expense</span>
                </button>
              </div>
            </section>

            {/* Zero-Friction "Who are you?" Member Pill Bar */}
            {detail.members.length > 0 && (
              <section
                aria-label="Select your member identity"
                className="bg-parchment border border-hairline rounded-2xl px-5 py-3.5 flex flex-wrap items-center gap-3"
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-taupe shrink-0">
                  <UserCheck className="w-4 h-4 text-sage" aria-hidden="true" />
                  <span>Who are you?</span>
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {detail.members.map((member) => {
                    const isSelected = selectedMemberId === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSelectIdentity(member.id)}
                        className={`min-h-[44px] px-3.5 rounded-full text-xs font-semibold transition-colors ${
                          isSelected
                            ? "bg-sage text-parchment"
                            : "bg-alabaster border border-hairline text-walnut hover:bg-sage-tint"
                        }`}
                      >
                        {member.name}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

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
                  tripName={detail.trip.name}
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
                  currentMemberId={
                    selectedMemberId ??
                    (() => {
                      const activeName = (session?.user?.name || guestProfile.name || "").trim().toLowerCase();
                      if (!activeName) return null;
                      const first = activeName.split(" ")[0];
                      return (
                        detail.members.find((m) => {
                          const mn = m.name.trim().toLowerCase();
                          return mn === activeName || mn === first;
                        })?.id ?? null
                      );
                    })()
                  }
                  onDeleted={() => void loadDetail(true)}
                />
              </div>
            </div>

            {/* Subtle Trip Deletion Footer — tucked away from primary Amber CTA */}
            <div className="pt-4 border-t border-hairline flex items-center justify-between gap-4">
              <p className="text-xs text-taupe">
                Finished with this trip? Removing it permanently deletes all expenses and balances.
              </p>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="min-h-[44px] min-w-[44px] px-4 rounded-xl border border-[#B84A39]/30 text-[#B84A39] hover:bg-debtor-bg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Delete Trip</span>
              </button>
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
          defaultPayerId={
            selectedMemberId ??
            (() => {
              const activeName = (session?.user?.name || guestProfile.name || "").trim().toLowerCase();
              if (!activeName || detail.members.length === 0) return null;
              const first = activeName.split(" ")[0];
              return (
                detail.members.find((m) => {
                  const mn = m.name.trim().toLowerCase();
                  return mn === activeName || mn === first;
                })?.id ?? null
              );
            })()
          }
          onClose={() => setExpenseModalOpen(false)}
          onSaved={() => {
            setExpenseModalOpen(false);
            void loadDetail(true);
          }}
        />
      )}

      {detail && deleteModalOpen && (
        <DeleteTripModal
          open={deleteModalOpen}
          tripId={detail.trip.id}
          tripName={detail.trip.name}
          onClose={() => setDeleteModalOpen(false)}
          onDeleted={() => {
            setDeleteModalOpen(false);
            router.push("/");
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
          <Navbar backHref="/" backLabel="All Trips" />
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
