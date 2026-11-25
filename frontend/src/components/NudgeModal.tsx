"use client";

import { useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatCents } from "@/lib/format";
import type { NudgeTone, SettlementTransfer } from "@/types/api";

interface NudgeModalProps {
  open: boolean;
  tripId: number;
  currency: string;
  transfer: SettlementTransfer | null;
  onClose: () => void;
}

const TONES: { value: NudgeTone; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "playful", label: "Playful" },
  { value: "direct", label: "Direct" },
];

export function NudgeModal({
  open,
  tripId,
  currency,
  transfer,
  onClose,
}: NudgeModalProps) {
  const [tone, setTone] = useState<NudgeTone>("casual");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !transfer) return;
    let cancelled = false;

    api
      .createNudge(tripId, {
        from_member_id: transfer.from_member_id,
        to_member_id: transfer.to_member_id,
        amount_cents: transfer.amount_cents,
        tone,
      })
      .then((res) => {
        if (!cancelled) {
          setMessage(res.message);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not generate Nudge.");
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
  }, [open, tripId, transfer, tone]);

  if (!open || !transfer) return null;

  function handleToneSelect(nextTone: NudgeTone) {
    setTone(nextTone);
    setLoading(true);
    setCopied(false);
    setError(null);
  }

  async function handleCopy() {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard access denied. Copy the message manually.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-walnut/40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nudge-modal-title"
    >
      <div className="bg-parchment border border-hairline rounded-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="nudge-modal-title" className="font-editorial text-xl font-bold text-walnut">
              Send a Friendly Nudge
            </h2>
            <p className="text-xs text-taupe">
              {transfer.from_member_name} → {transfer.to_member_name} (
              <span className="font-mono tabular-currency">
                {formatCents(transfer.amount_cents, currency)}
              </span>
              )
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close nudge modal"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-taupe hover:text-walnut hover:bg-sage-tint transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tone Presets */}
        <div className="space-y-2">
          <span className="block text-xs font-semibold uppercase tracking-wider text-taupe">
            Select Tone
          </span>
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-alabaster border border-hairline">
            {TONES.map((t) => {
              const active = tone === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleToneSelect(t.value)}
                  className={`min-h-[44px] rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? "bg-sage text-parchment"
                      : "text-taupe hover:text-walnut hover:bg-sage-tint"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Preview */}
        {loading ? (
          <div className="p-4 rounded-xl bg-alabaster border border-hairline space-y-2">
            <div className="h-4 w-full rounded bg-sage-tint animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-sage-tint animate-pulse" />
          </div>
        ) : error ? (
          <div role="alert" className="p-3 rounded-xl bg-warning-bg text-warning-fg text-sm">
            {error}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-alabaster border border-hairline text-sm text-walnut leading-relaxed">
            {message}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-xl text-sm font-medium text-taupe hover:text-walnut hover:bg-sage-tint transition-colors"
          >
            Done
          </button>
          <button
            type="button"
            disabled={loading || !message}
            onClick={handleCopy}
            className="min-h-[44px] px-5 rounded-xl bg-amber-glow hover:bg-amber-hover text-amber-ink font-semibold text-sm inline-flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                <span>Copy Message</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
