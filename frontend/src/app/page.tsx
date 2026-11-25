"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, Receipt, Users } from "lucide-react";
import { CreateTripModal } from "@/components/CreateTripModal";
import { Header } from "@/components/Header";
import { TripListSkeleton } from "@/components/Skeletons";
import { api, ApiError } from "@/lib/api";
import { formatCents } from "@/lib/format";
import type { TripRead } from "@/types/api";

export default function HomePage() {
  const [trips, setTrips] = useState<TripRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listTrips();
      setTrips(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to reach the RED – Trip Splitter API. Ensure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .listTrips()
      .then((data) => {
        if (!cancelled) {
          setTrips(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Unable to reach the RED – Trip Splitter API. Ensure FastAPI is running on port 8000."
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
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-alabaster">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <TripListSkeleton />
        ) : error ? (
          <div
            role="alert"
            className="bg-parchment border border-hairline rounded-2xl p-6 space-y-4 max-w-xl mx-auto"
          >
            <h1 className="font-editorial text-xl font-bold text-walnut">
              Backend Connection Needed
            </h1>
            <p className="text-sm text-taupe">{error}</p>
            <button
              type="button"
              onClick={() => void loadTrips()}
              className="min-h-[44px] px-5 rounded-xl bg-amber-glow hover:bg-amber-hover text-amber-ink font-semibold text-sm transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Editorial Hero Bento Banner */}
            <section className="bg-parchment border border-hairline rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-sage">
                  Zero-Sum Settlement Engine
                </p>
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-walnut">
                  Settle every trip in the fewest possible moves.
                </h1>
                <p className="text-sm text-taupe leading-relaxed">
                  Exact integer-cent splits, minimum peer-to-peer transfers, and low-awkwardness
                  Nudge messages—without spreadsheet chaos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="min-h-[44px] px-5 rounded-xl bg-amber-glow hover:bg-amber-hover text-amber-ink font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>New Trip</span>
              </button>
            </section>

            {/* Bento Trip Grid */}
            <section aria-labelledby="trips-grid-heading" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2
                  id="trips-grid-heading"
                  className="font-editorial text-lg font-bold text-walnut"
                >
                  Active Trips ({trips.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {trips.map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="group bg-parchment border border-hairline hover:border-sage rounded-2xl p-6 flex flex-col justify-between gap-6 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-editorial text-lg font-bold text-walnut group-hover:text-sage transition-colors">
                          {trip.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sage-tint text-sage shrink-0">
                          {trip.currency}
                          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                      </div>
                      {trip.description && (
                        <p className="text-sm text-taupe line-clamp-2">{trip.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-hairline">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-medium text-taupe flex items-center gap-1">
                          <Users className="w-3 h-3" aria-hidden="true" />
                          Members
                        </span>
                        <p className="font-mono font-semibold text-sm text-walnut tabular-currency">
                          {trip.member_count}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-medium text-taupe flex items-center gap-1">
                          <Receipt className="w-3 h-3" aria-hidden="true" />
                          Expenses
                        </span>
                        <p className="font-mono font-semibold text-sm text-walnut tabular-currency">
                          {trip.expense_count}
                        </p>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-[11px] font-medium text-taupe block">
                          Total Spend
                        </span>
                        <p className="font-mono font-semibold text-sm text-walnut tabular-currency">
                          {formatCents(trip.total_spend_cents, trip.currency)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <CreateTripModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(newTrip) => {
          setTrips((prev) => [...prev, newTrip]);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
