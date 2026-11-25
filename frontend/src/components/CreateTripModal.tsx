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
const QUICK_CURRENCIES = ["USD", "INR", "EUR", "GBP"];

interface TripTemplate {
  id: string;
  label: string;
  defaultName: string;
  description: string;
  currency: string;
}

const TEMPLATES: TripTemplate[] = [
  {
    id: "roadtrip",
    label: "Roadtrip",
    defaultName: "Weekend Roadtrip",
    description: "Fuel, tolls, snacks, and cabin stays",
    currency: "USD",
  },
  {
    id: "flatmates",
    label: "Flatmates",
    defaultName: "Apartment Expenses",
    description: "Rent, groceries, Wi-Fi, and utilities",
    currency: "INR",
  },
  {
    id: "event",
    label: "Event",
    defaultName: "Group Celebration",
    description: "Venue, tickets, food, and shared gifts",
    currency: "USD",
  },
  {
    id: "custom",
    label: "Custom",
    defaultName: "",
    description: "",
    currency: "USD",
  },
];

export function CreateTripModal({ open, onClose, onCreated }: CreateTripModalProps) {
  const [templateId, setTemplateId] = useState<string>("custom");
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function applyTemplate(tpl: TripTemplate) {
    setTemplateId(tpl.id);
    if (tpl.defaultName) setName(tpl.defaultName);
    setDescription(tpl.description);
    setCurrency(tpl.currency);
  }

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
          {/* Multi-Purpose Templates */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-2">
              Mode / Template
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {TEMPLATES.map((tpl) => {
                const active = templateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className={`min-h-[44px] px-2 rounded-xl text-xs font-semibold border transition-colors ${
                      active
                        ? "bg-sage text-parchment border-sage"
                        : "bg-alabaster text-walnut border-hairline hover:bg-sage-tint"
                    }`}
                  >
                    {tpl.label}
                  </button>
                );
              })}
            </div>
          </div>

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
            <div className="flex items-center gap-2 mb-2">
              {QUICK_CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold border transition-colors ${
                    currency === c
                      ? "bg-sage-tint text-sage border-sage"
                      : "bg-alabaster text-taupe border-hairline hover:text-walnut"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
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
