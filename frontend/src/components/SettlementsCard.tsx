"use client";

import { ArrowRight, Check, MessageCircle, MessageSquareText } from "lucide-react";
import { formatCents } from "@/lib/format";
import { useGuestProfile } from "@/components/Navbar";
import type { SettlementTransfer } from "@/types/api";

interface SettlementsCardProps {
  tripName: string;
  currency: string;
  settlements: SettlementTransfer[];
  memberCount: number;
  onSelectNudge: (transfer: SettlementTransfer) => void;
}

export function SettlementsCard({
  tripName,
  currency,
  settlements,
  memberCount,
  onSelectNudge,
}: SettlementsCardProps) {
  const guestProfile = useGuestProfile();
  const maxPossible = Math.max(0, memberCount - 1);

  function buildWhatsAppUrl(transfer: SettlementTransfer): string {
    const amountStr = formatCents(transfer.amount_cents, currency);
    const tripUrl = typeof window !== "undefined" ? window.location.href : "";
    const upiNote =
      guestProfile.upiId &&
      (!guestProfile.name ||
        transfer.to_member_name.toLowerCase().includes(guestProfile.name.toLowerCase()))
        ? ` (UPI: ${guestProfile.upiId})`
        : "";
    const text = `Hey ${transfer.from_member_name}! Quick settle-up for ${tripName}: you owe ${transfer.to_member_name} ${amountStr}${upiNote}. View the breakdown here: ${tripUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

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

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectNudge(transfer)}
                  className="min-h-[44px] px-3.5 rounded-xl bg-parchment border border-hairline hover:border-sage hover:bg-sage-tint text-walnut text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquareText className="w-4 h-4 text-sage" aria-hidden="true" />
                  <span>Nudge</span>
                </button>
                <a
                  href={buildWhatsAppUrl(transfer)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Send WhatsApp reminder to ${transfer.from_member_name}`}
                  className="min-h-[44px] px-3.5 rounded-xl bg-sage text-parchment hover:opacity-95 text-xs font-semibold inline-flex items-center gap-1.5 transition-opacity"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Send via WhatsApp</span>
                  <span className="sm:hidden">WhatsApp</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
