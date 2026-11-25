"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatCents, parseCurrencyInputToCents } from "@/lib/format";
import type { MemberRead, SplitMode } from "@/types/api";

interface ExpenseModalProps {
  open: boolean;
  tripId: number;
  currency: string;
  members: MemberRead[];
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES = [
  "Food & Dining",
  "Lodging",
  "Transport",
  "Activities",
  "Groceries",
  "Other",
];

const SPLIT_TABS: { mode: SplitMode; label: string }[] = [
  { mode: "equal", label: "Equal" },
  { mode: "subset", label: "Select People" },
  { mode: "custom", label: "Custom" },
];

export function ExpenseModal({
  open,
  tripId,
  currency,
  members,
  onClose,
  onSaved,
}: ExpenseModalProps) {
  const [title, setTitle] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [payerId, setPayerId] = useState<number>(members[0]?.id ?? 0);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [selectedIds, setSelectedIds] = useState<number[]>(() =>
    members.map((m) => m.id)
  );
  const [customInputs, setCustomInputs] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    for (const m of members) {
      initial[m.id] = "0.00";
    }
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCents = useMemo(
    () => parseCurrencyInputToCents(amountInput) ?? 0,
    [amountInput]
  );

  const customTotalCents = useMemo(() => {
    let sum = 0;
    for (const m of members) {
      const parsed = parseCurrencyInputToCents(customInputs[m.id] ?? "0");
      if (parsed !== null) {
        sum += parsed;
      }
    }
    return sum;
  }, [customInputs, members]);

  const remainingCents = totalCents - customTotalCents;

  if (!open) return null;

  function toggleParticipant(memberId: number) {
    setSelectedIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (members.length === 0) {
      setError("Add at least one member to the trip first.");
      return;
    }

    const parsedAmount = parseCurrencyInputToCents(amountInput);
    if (parsedAmount === null || parsedAmount <= 0) {
      setError("Enter a valid positive amount (e.g., 42.50).");
      return;
    }

    if (!title.trim()) {
      setError("Enter an expense title.");
      return;
    }

    if (splitMode === "subset" && selectedIds.length === 0) {
      setError("Select at least one person for a subset split.");
      return;
    }

    if (splitMode === "custom" && remainingCents !== 0) {
      setError(`Custom shares must equal ${formatCents(parsedAmount, currency)}.`);
      return;
    }

    setSubmitting(true);
    try {
      await api.addExpense(tripId, {
        title: title.trim(),
        amount_cents: parsedAmount,
        category,
        payer_id: payerId,
        split_mode: splitMode,
        participant_ids: splitMode === "subset" ? selectedIds : undefined,
        custom_splits:
          splitMode === "custom"
            ? members.map((m) => ({
                member_id: m.id,
                share_cents: parseCurrencyInputToCents(customInputs[m.id] ?? "0") ?? 0,
              }))
            : undefined,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save expense.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-walnut/40 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-modal-title"
    >
      <div className="bg-parchment border border-hairline rounded-2xl w-full max-w-lg p-6 space-y-5 my-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="expense-modal-title" className="font-editorial text-xl font-bold text-walnut">
              Add Expense
            </h2>
            <p className="text-xs text-taupe">
              10-second entry · exact integer-cent math
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close expense modal"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-taupe hover:text-walnut hover:bg-sage-tint transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-3">
              <label htmlFor="exp-title" className="block text-sm font-medium text-walnut mb-1.5">
                Description
              </label>
              <input
                id="exp-title"
                type="text"
                required
                maxLength={160}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Cabin Groceries"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-alabaster border border-hairline text-sm text-walnut placeholder:text-taupe/70"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="exp-amount" className="block text-sm font-medium text-walnut mb-1.5">
                Amount ({currency})
              </label>
              <input
                id="exp-amount"
                type="text"
                inputMode="decimal"
                required
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0.00"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-alabaster border border-hairline text-sm font-mono tabular-currency text-walnut placeholder:text-taupe/70"
              />
            </div>
          </div>

          {/* Paid By & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="exp-payer" className="block text-sm font-medium text-walnut mb-1.5">
                Paid By
              </label>
              <select
                id="exp-payer"
                value={payerId}
                onChange={(e) => setPayerId(Number(e.target.value))}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-alabaster border border-hairline text-sm text-walnut"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="exp-category" className="block text-sm font-medium text-walnut mb-1.5">
                Category
              </label>
              <select
                id="exp-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-alabaster border border-hairline text-sm text-walnut"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Progressive Disclosure Split Mode */}
          <div className="space-y-3">
            <span className="block text-sm font-medium text-walnut">Split Mode</span>
            <div
              role="tablist"
              aria-label="Split mode"
              className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-alabaster border border-hairline"
            >
              {SPLIT_TABS.map((tab) => {
                const active = splitMode === tab.mode;
                return (
                  <button
                    key={tab.mode}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSplitMode(tab.mode)}
                    className={`min-h-[44px] px-2 rounded-lg text-xs font-semibold transition-colors ${
                      active
                        ? "bg-sage text-parchment"
                        : "text-taupe hover:text-walnut hover:bg-sage-tint"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {splitMode === "equal" && (
              <p className="text-xs text-taupe bg-alabaster border border-hairline rounded-xl p-3">
                Split equally across all {members.length} members
                {totalCents > 0 && members.length > 0
                  ? ` (~${formatCents(Math.floor(totalCents / members.length), currency)} each)`
                  : ""}
                . Odd cents are distributed deterministically.
              </p>
            )}

            {splitMode === "subset" && (
              <div className="p-3.5 rounded-xl bg-alabaster border border-hairline space-y-2">
                <p className="text-xs font-medium text-taupe">
                  Select who shares this expense ({selectedIds.length} selected):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {members.map((m) => {
                    const checked = selectedIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`min-h-[44px] px-3 rounded-xl border flex items-center gap-2.5 text-sm cursor-pointer transition-colors ${
                          checked
                            ? "bg-sage-tint border-sage text-walnut font-semibold"
                            : "bg-parchment border-hairline text-taupe"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleParticipant(m.id)}
                          className="w-4 h-4 accent-[#4A6B5D]"
                        />
                        <span className="truncate">{m.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {splitMode === "custom" && (
              <div className="p-3.5 rounded-xl bg-alabaster border border-hairline space-y-3">
                <div className="space-y-2">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-3">
                      <label
                        htmlFor={`custom-split-${m.id}`}
                        className="text-sm font-medium text-walnut truncate"
                      >
                        {m.name}
                      </label>
                      <input
                        id={`custom-split-${m.id}`}
                        type="text"
                        inputMode="decimal"
                        value={customInputs[m.id] ?? "0.00"}
                        onChange={(e) =>
                          setCustomInputs((prev) => ({
                            ...prev,
                            [m.id]: e.target.value,
                          }))
                        }
                        className="w-28 min-h-[44px] px-3 rounded-xl bg-parchment border border-hairline text-right font-mono text-sm tabular-currency text-walnut"
                      />
                    </div>
                  ))}
                </div>

                {/* Live Remaining-Cents Validation */}
                {totalCents > 0 && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      remainingCents === 0
                        ? "bg-creditor-bg text-creditor-fg"
                        : "bg-warning-bg text-warning-fg"
                    }`}
                  >
                    {remainingCents === 0 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Exact match: {formatCents(totalCents, currency)} allocated</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>
                          Custom split off by{" "}
                          {formatCents(Math.abs(remainingCents), currency)} (
                          {remainingCents > 0 ? "remaining to assign" : "over-allocated"})
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-warning-bg text-warning-fg text-sm font-medium"
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-xl text-sm font-medium text-taupe hover:text-walnut hover:bg-sage-tint transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-5 rounded-xl bg-amber-glow hover:bg-amber-hover text-amber-ink font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
