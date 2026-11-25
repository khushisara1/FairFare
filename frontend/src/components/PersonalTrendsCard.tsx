"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { TrendingUp } from "lucide-react";
import { useGuestProfile } from "@/components/Navbar";
import { api } from "@/lib/api";
import { formatCents, formatSignedCents } from "@/lib/format";
import type { UserSummaryResponse } from "@/types/api";

export function PersonalTrendsCard() {
  const { data: session, status } = useSession();
  const guestProfile = useGuestProfile();
  const [summary, setSummary] = useState<UserSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const email = session?.user?.email ?? undefined;
  const guestName = !email && guestProfile.name ? guestProfile.name : undefined;

  useEffect(() => {
    if (status === "loading") return;
    if (!email && !guestName) {
      Promise.resolve().then(() => {
        setSummary(null);
        setLoading(false);
      });
      return;
    }

    let cancelled = false;
    Promise.resolve()
      .then(() => {
        setLoading(true);
        return api.getMySummary({ email, guestName });
      })
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSummary(null);
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
  }, [email, guestName, status]);

  if (status === "loading" || loading) {
    return (
      <section
        aria-label="Loading personal spending trends"
        className="bg-parchment border border-hairline rounded-2xl p-6 space-y-4"
      >
        <div className="h-5 w-44 rounded bg-sage-tint animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-alabaster border border-hairline space-y-2">
              <div className="h-3 w-24 rounded bg-sage-tint animate-pulse" />
              <div className="h-6 w-28 rounded bg-sage-tint animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!email && !guestName) {
    return null;
  }

  const net = summary?.net_balance_change_cents ?? 0;
  const currency = summary?.currency ?? "USD";
  const netBadge =
    net > 0
      ? { label: "Owed to you", cls: "bg-creditor-bg text-creditor-fg" }
      : net < 0
      ? { label: "You owe", cls: "bg-debtor-bg text-debtor-fg" }
      : { label: "Settled", cls: "bg-settled-bg text-settled-fg" };

  return (
    <section
      aria-labelledby="personal-trends-heading"
      className="bg-parchment border border-hairline rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sage" aria-hidden="true" />
          <h2 id="personal-trends-heading" className="font-editorial text-lg font-bold text-walnut">
            Personal Spending Trends
          </h2>
        </div>
        <span className="text-xs text-taupe">
          {summary?.trip_count ?? 0} {(summary?.trip_count ?? 0) === 1 ? "trip" : "trips"} matched
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-alabaster border border-hairline space-y-1">
          <span className="text-xs font-medium text-taupe block">Total You Paid</span>
          <p className="font-mono font-semibold text-lg text-walnut tabular-currency">
            {formatCents(summary?.total_paid_cents ?? 0, currency)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-alabaster border border-hairline space-y-1">
          <span className="text-xs font-medium text-taupe block">Your Total Share</span>
          <p className="font-mono font-semibold text-lg text-walnut tabular-currency">
            {formatCents(summary?.total_share_cents ?? 0, currency)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-alabaster border border-hairline space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-taupe">Net Balance Change</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${netBadge.cls}`}>
              {netBadge.label}
            </span>
          </div>
          <p
            className={`font-mono font-semibold text-lg tabular-currency ${
              net > 0 ? "text-creditor-fg" : net < 0 ? "text-debtor-fg" : "text-settled-fg"
            }`}
          >
            {formatSignedCents(net, currency)}
          </p>
        </div>
      </div>
    </section>
  );
}
