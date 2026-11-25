"use client";

import { ArrowRight, Check, MessageSquareText } from "lucide-react";
import { formatCents } from "@/lib/format";
import type { SettlementTransfer } from "@/types/api";

interface SettlementsCardProps {
  currency: string;
  settlements: SettlementTransfer[];
  memberCount: number;
  onSelectNudge: (transfer: SettlementTransfer) => void;
}

export function SettlementsCard({
  currency,
  settlements,
  memberCount,
  onSelectNudge,
}: SettlementsCardProps) {
  const maxPossible = Math.max(0, memberCount - 1);

  return (
    <section
      aria-labelledby="settlements-heading"
      className="bg-parchment border border-hairline rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 id="settlements-heading" className="font-editorial text-lg font-bold text-walnut">
            Simplified Settle-Up
          </h2>
          <p className="text-xs text-taupe">
            {settlements.length} {settlements.length === 1 ? "payment" : "payments"} needed
            {memberCount > 1 ? ` (max ${maxPossible} for ${memberCount} people)` : ""}
          </p>
        </div>
      </div>

      {settlements.length === 0 ? (
        <div className="p-6 rounded-xl bg-creditor-bg/60 border border-hairline text-center space-y-2">
          <div className="w-9 h-9 rounded-full bg-creditor-bg text-creditor-fg inline-flex items-center justify-center mx-auto">
            <Check className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-creditor-fg">All settled up</p>
          <p className="text-xs text-taupe">
            No peer-to-peer transfers are needed right now.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {settlements.map((transfer) => (
            <li
              key={`${transfer.from_member_id}-${transfer.to_member_id}`}
              className="p-4 rounded-xl bg-alabaster border border-hairline flex items-center justify-between gap-3"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-walnut flex-wrap">
                  <span className="truncate">{transfer.from_member_name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sage shrink-0" aria-hidden="true" />
                  <span className="truncate">{transfer.to_member_name}</span>
                </div>
                <p className="font-mono font-semibold text-base text-walnut tabular-currency">
                  {formatCents(transfer.amount_cents, currency)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectNudge(transfer)}
                className="min-h-[44px] px-3.5 rounded-xl bg-parchment border border-hairline hover:border-sage hover:bg-sage-tint text-walnut text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
              >
                <MessageSquareText className="w-4 h-4 text-sage" aria-hidden="true" />
                <span>Nudge</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
