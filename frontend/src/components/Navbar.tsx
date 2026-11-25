"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowLeft, ChevronDown, Download, LogIn, LogOut, User } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavbarProps {
  /** If provided, renders a breadcrumb back link in the left section */
  backHref?: string;
  backLabel?: string;
  /** Arbitrary slot on the right of the nav bar (e.g. trip-level CTAs) */
  rightSlot?: React.ReactNode;
}

interface GuestProfile {
  name: string;
  upiId: string;
}

const GUEST_PROFILE_KEY = "fairfare_guest_profile";

// ─── BeforeInstallPromptEvent (not in lib.dom yet) ───────────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ─── NavLinks: isolated component that uses usePathname (needs Suspense) ─────

function NavLinks() {
  const pathname = usePathname();
  const isTrip = pathname?.startsWith("/trips/");
  if (isTrip) return null;
  return (
    <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
      <Link
        href="/"
        className={`min-h-[44px] px-3 rounded-lg text-sm font-medium transition-colors inline-flex items-center ${
          pathname === "/" ? "text-sage bg-sage-tint" : "text-taupe hover:text-walnut hover:bg-sage-tint"
        }`}
      >
        Trips
      </Link>
      <Link
        href="/how-it-works"
        className={`min-h-[44px] px-3 rounded-lg text-sm font-medium transition-colors inline-flex items-center ${
          pathname === "/how-it-works" ? "text-sage bg-sage-tint" : "text-taupe hover:text-walnut hover:bg-sage-tint"
        }`}
      >
        How It Works
      </Link>
    </nav>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

export function Navbar({ backHref, backLabel = "All Trips", rightSlot }: NavbarProps) {
  const { data: session } = useSession();

  // ── Guest Profile & Auth Modal state ─────────────────────────────────────
  const [profile, setProfile] = useState<GuestProfile>({ name: "", upiId: "" });
  const [profileOpen, setProfileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftUpi, setDraftUpi] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

  // ── PWA install prompt state ─────────────────────────────────────────────
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const installRef = useRef<HTMLDivElement>(null);

  // ── Load persisted profile on mount ─────────────────────────────────────
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const raw = localStorage.getItem(GUEST_PROFILE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as GuestProfile;
          setProfile(parsed);
          setDraftName(parsed.name);
          setDraftUpi(parsed.upiId);
        }
      } catch {
        // ignore
      }
    });
  }, []);

  // ── Capture PWA install prompt ───────────────────────────────────────────
  useEffect(() => {
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  // ── Close popovers on outside click ─────────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (installRef.current && !installRef.current.contains(e.target as Node)) {
        setInstallOpen(false);
      }
    }
    if (profileOpen || installOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen, installOpen]);

  // ── Save guest profile ───────────────────────────────────────────────────
  function handleSaveProfile() {
    const next: GuestProfile = { name: draftName.trim(), upiId: draftUpi.trim() };
    setProfile(next);
    try {
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("fairfare:profile-updated"));
    } catch {
      // ignore
    }
    setProfileOpen(false);
  }

  // ── Clear guest profile ──────────────────────────────────────────────────
  function handleClearProfile() {
    const empty: GuestProfile = { name: "", upiId: "" };
    setProfile(empty);
    setDraftName("");
    setDraftUpi("");
    try {
      localStorage.removeItem(GUEST_PROFILE_KEY);
      window.dispatchEvent(new Event("fairfare:profile-updated"));
    } catch {
      // ignore
    }
    setProfileOpen(false);
  }

  // ── Trigger PWA install ──────────────────────────────────────────────────
  async function handleInstall() {
    if (installPrompt) {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === "accepted") {
        setInstallPrompt(null);
        setInstallOpen(false);
      }
    } else {
      setInstallOpen((prev) => !prev);
    }
  }

  return (
    <header className="bg-parchment border-b border-hairline sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

        {/* ── Left: Logo + optional breadcrumb ── */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 min-h-[44px] pr-2 rounded-lg text-walnut hover:text-sage transition-colors shrink-0"
            aria-label="FairFare – go to Trip Dashboard"
          >
            <span
              className="w-8 h-8 rounded-lg bg-sage text-parchment font-editorial font-bold text-xs flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              FF
            </span>
            <span className="font-editorial font-bold text-lg tracking-tight hidden sm:inline">
              FairFare
            </span>
            <span className="hidden md:inline text-sm font-medium text-taupe border-l border-hairline pl-2.5">
              Trip Splitter
            </span>
          </Link>

          {/* Breadcrumb when inside a trip */}
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-sm font-medium text-taupe hover:text-walnut hover:bg-sage-tint transition-colors"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden xs:inline">{backLabel}</span>
            </Link>
          )}
        </div>

        {/* ── Center / Right: Nav links + Guest Profile + Install App ── */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">

          {/* Nav links wrapped in Suspense to safely use usePathname */}
          <Suspense fallback={null}>
            <NavLinks />
          </Suspense>

          {/* rightSlot (trip-level CTAs passed from parent) */}
          {rightSlot && (
            <div className="flex items-center gap-2 shrink-0">{rightSlot}</div>
          )}

          {/* Install App — only show when native prompt available or as guide */}
          <div className="relative" ref={installRef}>
            <button
              type="button"
              onClick={() => void handleInstall()}
              aria-label="Install FairFare app"
              aria-expanded={installOpen}
              className="min-h-[44px] min-w-[44px] px-2.5 sm:px-3 rounded-lg text-xs font-medium text-taupe hover:text-walnut hover:bg-sage-tint inline-flex items-center gap-1.5 transition-colors border border-hairline"
            >
              <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">Install App</span>
            </button>

            {/* Guide popover when native prompt isn't available */}
            {installOpen && !installPrompt && (
              <div
                className="absolute right-0 mt-2 w-72 bg-parchment border border-hairline rounded-2xl p-4 space-y-3 z-40 shadow-sm"
                role="dialog"
                aria-label="Install FairFare app guide"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-sage">
                  Add to Home Screen
                </p>
                <ol className="text-sm text-taupe space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    <strong className="text-walnut">iOS Safari:</strong> tap{" "}
                    <span className="font-mono text-xs bg-alabaster px-1 rounded">Share ⎙</span> → &ldquo;Add to Home Screen&rdquo;
                  </li>
                  <li>
                    <strong className="text-walnut">Android Chrome:</strong> tap{" "}
                    <span className="font-mono text-xs bg-alabaster px-1 rounded">⋮ menu</span> → &ldquo;Add to Home Screen&rdquo;
                  </li>
                </ol>
                <button
                  type="button"
                  onClick={() => setInstallOpen(false)}
                  className="w-full min-h-[44px] px-4 rounded-xl bg-alabaster border border-hairline text-sm font-medium text-walnut hover:bg-sage-tint transition-colors"
                >
                  Got it
                </button>
              </div>
            )}
          </div>

          {/* ── User Avatar / Guest Profile Pill ── */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setDraftName(session?.user?.name || profile.name);
                setDraftUpi(profile.upiId);
                setProfileOpen((prev) => !prev);
              }}
              aria-expanded={profileOpen}
              aria-label={
                session?.user?.name
                  ? `Account: ${session.user.name}`
                  : profile.name
                  ? `Guest profile: ${profile.name}`
                  : "Set your name or sign in"
              }
              className="min-h-[44px] px-3 rounded-full bg-sage-tint border border-hairline text-walnut text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-sage/10 transition-colors max-w-[175px]"
            >
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
              ) : session?.user?.name ? (
                <span
                  className="w-5 h-5 rounded-full bg-sage text-parchment text-[10px] font-bold inline-flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  {session.user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-4 h-4 text-sage shrink-0" aria-hidden="true" />
              )}
              <span className="truncate">
                {session?.user?.name || profile.name || "Set Your Name"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-taupe shrink-0 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {/* Profile / Account popover */}
            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-parchment border border-hairline rounded-2xl p-4 space-y-4 z-40 shadow-sm"
                role="dialog"
                aria-label="Account and guest profile settings"
              >
                {session?.user ? (
                  <div className="space-y-1 pb-3 border-b border-hairline">
                    <p className="text-xs font-semibold uppercase tracking-wider text-sage">
                      Signed In
                    </p>
                    <p className="text-sm font-semibold text-walnut truncate">
                      {session.user.name}
                    </p>
                    {session.user.email && (
                      <p className="text-xs text-taupe truncate">{session.user.email}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-sage mb-2">
                      Guest Identity
                    </p>
                    <p className="text-xs text-taupe leading-relaxed">
                      Saved locally. Auto-selects you as payer when adding expenses.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {!session?.user && (
                    <div className="space-y-1">
                      <label
                        htmlFor="guest-name"
                        className="block text-xs font-semibold text-walnut"
                      >
                        Display Name <span className="text-debtor-fg">*</span>
                      </label>
                      <input
                        id="guest-name"
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        placeholder="e.g. Alex"
                        maxLength={50}
                        className="w-full min-h-[44px] px-3 rounded-xl border border-hairline bg-alabaster text-sm text-walnut placeholder-taupe/60 focus:outline-none focus:border-sage transition-colors"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label
                      htmlFor="guest-upi"
                      className="block text-xs font-semibold text-walnut"
                    >
                      UPI ID{" "}
                      <span className="text-taupe font-normal">(optional)</span>
                    </label>
                    <input
                      id="guest-upi"
                      type="text"
                      value={draftUpi}
                      onChange={(e) => setDraftUpi(e.target.value)}
                      placeholder="e.g. alex@upi"
                      maxLength={80}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-hairline bg-alabaster text-sm text-walnut placeholder-taupe/60 focus:outline-none focus:border-sage transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {!session?.user && profile.name && (
                    <button
                      type="button"
                      onClick={handleClearProfile}
                      className="min-h-[44px] px-3 rounded-xl text-xs font-medium text-taupe hover:text-walnut hover:bg-sage-tint border border-hairline transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={!session?.user && !draftName.trim()}
                    className="flex-1 min-h-[44px] px-4 rounded-xl bg-amber-glow hover:bg-amber-hover text-amber-ink font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>

                <div className="pt-2 border-t border-hairline">
                  {session?.user ? (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        void signOut({ redirect: false });
                      }}
                      className="w-full min-h-[44px] px-3 rounded-xl text-xs font-semibold text-debtor-fg hover:bg-debtor-bg inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        setAuthModalOpen(true);
                      }}
                      className="w-full min-h-[44px] px-3 rounded-xl text-xs font-semibold text-sage hover:bg-sage-tint inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      <LogIn className="w-4 h-4" aria-hidden="true" />
                      <span>Sign in with Google or Email</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onContinueAsGuest={() => setProfileOpen(true)}
      />
    </header>
  );
}

// ── Re-export a hook so trip pages can read the global guest profile ──────────
export function useGuestProfile(): GuestProfile {
  const [profile, setProfile] = useState<GuestProfile>({ name: "", upiId: "" });

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const raw = localStorage.getItem(GUEST_PROFILE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as GuestProfile;
          setProfile(parsed);
        }
      } catch {
        // ignore
      }
    });

    function syncProfile() {
      try {
        const raw = localStorage.getItem(GUEST_PROFILE_KEY);
        if (raw) {
          setProfile(JSON.parse(raw) as GuestProfile);
        } else {
          setProfile({ name: "", upiId: "" });
        }
      } catch {
        // ignore
      }
    }

    function onStorage(e: StorageEvent) {
      if (e.key === GUEST_PROFILE_KEY) {
        syncProfile();
      }
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("fairfare:profile-updated", syncProfile);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("fairfare:profile-updated", syncProfile);
    };
  }, []);

  return profile;
}
