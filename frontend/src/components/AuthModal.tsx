"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, UserCheck, X } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
}

export function AuthModal({ open, onClose, onContinueAsGuest }: AuthModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const result = await signIn("credentials", {
      redirect: false,
      email: email.trim(),
      name: name.trim() || email.trim().split("@")[0],
      password,
    });
    setSubmitting(false);

    if (result?.error) {
      setError("Could not sign in. Check your email and password.");
      return;
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-walnut/40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-parchment border border-hairline rounded-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="auth-modal-title" className="font-editorial text-xl font-bold text-walnut">
              Sign in to FairFare
            </h2>
            <p className="text-xs text-taupe">
              Sync your trips, personal spending trends, and expense filters.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in modal"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-taupe hover:text-walnut hover:bg-sage-tint transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={() => void signIn("google")}
          className="w-full min-h-[44px] px-4 rounded-xl border border-hairline bg-alabaster hover:bg-sage-tint text-walnut text-sm font-semibold inline-flex items-center justify-center gap-2.5 transition-colors"
        >
          <span
            className="w-5 h-5 rounded-full bg-sage text-parchment text-xs font-bold inline-flex items-center justify-center"
            aria-hidden="true"
          >
            G
          </span>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center">
          <div className="flex-1 border-t border-hairline" />
          <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-taupe">
            Or Email
          </span>
          <div className="flex-1 border-t border-hairline" />
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <div>
            <label htmlFor="auth-name" className="block text-xs font-semibold text-walnut mb-1">
              Display Name
            </label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Alex"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-alabaster border border-hairline text-walnut placeholder:text-taupe/70 text-sm"
            />
          </div>

          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold text-walnut mb-1">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-alabaster border border-hairline text-walnut placeholder:text-taupe/70 text-sm"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-semibold text-walnut mb-1">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 4 characters"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-alabaster border border-hairline text-walnut placeholder:text-taupe/70 text-sm"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-warning-bg text-warning-fg text-xs font-medium"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] px-5 rounded-xl bg-amber-glow hover:bg-amber-hover text-amber-ink font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>{submitting ? "Signing in..." : "Sign in with Email"}</span>
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            onClose();
            onContinueAsGuest();
          }}
          className="w-full min-h-[44px] px-4 rounded-xl text-sm font-medium text-taupe hover:text-walnut hover:bg-sage-tint inline-flex items-center justify-center gap-2 transition-colors"
        >
          <UserCheck className="w-4 h-4 text-sage" aria-hidden="true" />
          <span>Continue as Guest</span>
        </button>
      </div>
    </div>
  );
}
