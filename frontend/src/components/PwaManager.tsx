"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "fairfare_install_banner_dismissed";

export function PwaManager() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Ignore registration errors in unsupported environments
      });
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      try {
        const wasDismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
        setDismissed(wasDismissed);
      } catch {
        setDismissed(false);
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  if (!installPrompt || dismissed) return null;

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    }
    setDismissed(true);
  }

  function handleDismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  return (
    <div
      role="region"
      aria-label="Install FairFare app"
      className="sm:hidden fixed bottom-[76px] left-4 right-4 z-40 bg-parchment border border-hairline rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold text-walnut truncate">Install FairFare</p>
        <p className="text-[11px] text-taupe truncate">Add to your home screen for quick splits</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => void handleInstall()}
          className="min-h-[44px] px-3.5 rounded-xl bg-sage text-parchment text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Install</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install banner"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-taupe hover:text-walnut hover:bg-sage-tint"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
