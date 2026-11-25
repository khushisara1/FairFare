import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Thank You – RED Trip Splitter",
  description: "Thank you for your interest in RED Trip Splitter. We'll be in touch shortly.",
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex flex-col bg-alabaster">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-parchment border border-hairline rounded-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-creditor-bg flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-creditor-fg" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="font-editorial text-2xl font-bold text-walnut">
              Thank You!
            </h1>
            <p className="text-sm text-taupe leading-relaxed">
              Your message has been received. We typically reply within{" "}
              <strong className="text-walnut">24 hours</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-alabaster border border-hairline text-left space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-sage">
              What&apos;s next?
            </p>
            <ul className="text-sm text-taupe space-y-1 list-disc list-inside">
              <li>Try the live demo with the 5 pre-seeded trips</li>
              <li>Log a 3-expense trip and hit Settle Up</li>
              <li>Copy a Nudge message for your friend</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center justify-center px-6 rounded-xl bg-amber-glow hover:bg-amber-hover text-amber-ink font-semibold text-sm transition-colors"
            >
              Explore the Dashboard
            </Link>
            <Link
              href="/privacy"
              className="inline-flex min-h-[44px] items-center justify-center px-5 rounded-xl border border-hairline bg-alabaster hover:bg-sage-tint text-walnut text-sm font-medium transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
