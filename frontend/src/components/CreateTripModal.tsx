"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { TripRead } from "@/types/api";

interface CreateTripModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (trip: TripRead) => void;
}

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD"];

export function CreateTripModal({ open, onClose, onCreated }: CreateTripModalProps) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a trip name.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const trip = await api.createTrip({
        name: name.trim(),
        currency,
        description: description.trim() || null,
      });
      setName("");
      setDescription("");
      setCurrency("USD");
      onCreated(trip);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create trip.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-walnut/40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-trip-title"
    >
      <div className="bg-parchment border border-hairline rounded-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 id="create-trip-title" className="font-editorial text-xl font-bold text-walnut">
            Start a New Trip
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-taupe hover:text-walnut hover:bg-sage-tint transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="trip-name" className="block text-sm font-medium text-walnut mb-1.5">
              Trip Name
            </label>
            <input
              id="trip-name"
              type="text"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tahoe Cabin Weekend"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-alabaster border border-hairline text-walnut placeholder:text-taupe/70 text-sm"
            />
          </div>

          <div>
            <label htmlFor="trip-currency" className="block text-sm font-medium text-walnut mb-1.5">
              Currency
            </label>
            <select
              id="trip-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-alabaster border border-hairline text-walnut text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="trip-description"
              className="block text-sm font-medium text-walnut mb-1.5"
            >
              Description <span className="text-taupe font-normal">(optional)</span>
            </label>
            <input
              id="trip-description"
              type="text"
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short note about the group or destination"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-alabaster border border-hairline text-walnut placeholder:text-taupe/70 text-sm"
            />
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
              {submitting ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
