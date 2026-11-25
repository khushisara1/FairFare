"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";

interface DeleteTripModalProps {
  open: boolean;
  tripId: number;
  tripName: string;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteTripModal({
  open,
  tripId,
  tripName,
  onClose,
  onDeleted,
}: DeleteTripModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleConfirmDelete() {
    setDeleting(true);
    setError(null);
    try {
      await api.deleteTrip(tripId);

      // Clear any saved localStorage identity associated with this trip ID
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i += 1) {
          const key = window.localStorage.key(i);
          if (
            key &&
            (key.includes(`trip_${tripId}`) ||
              key.includes(`trip-${tripId}`) ||
              key.includes(`tripId:${tripId}`) ||
              key.endsWith(`_${tripId}`))
          ) {
            keysToRemove.push(key);
          }
        }
        for (const key of keysToRemove) {
          window.localStorage.removeItem(key);
        }
      } catch {
        // Ignore storage errors if localStorage is unavailable
      }

      onDeleted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete trip.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-walnut/40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-trip-title"
      aria-describedby="delete-trip-description"
    >
      <div className="bg-parchment border border-hairline rounded-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-debtor-bg text-[#B84A39] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2
              id="delete-trip-title"
              className="font-editorial text-xl font-bold text-walnut"
            >
              Delete Trip
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            aria-label="Close delete confirmation"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-taupe hover:text-walnut hover:bg-sage-tint transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p id="delete-trip-description" className="text-sm text-taupe leading-relaxed">
          Are you sure you want to delete{" "}
          <strong className="text-walnut font-semibold">{tripName}</strong>? All
          members, expenses, and balances for this trip will be permanently removed.
        </p>

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
            disabled={deleting}
            className="min-h-[44px] min-w-[44px] px-4 rounded-xl border border-hairline bg-alabaster hover:bg-sage-tint text-sm font-medium text-walnut transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleConfirmDelete()}
            disabled={deleting}
            className="min-h-[44px] min-w-[44px] px-5 rounded-xl bg-[#B84A39] hover:bg-[#9D3B2C] text-white font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
