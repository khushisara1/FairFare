import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Page Not Found – FairFare Trip Splitter",
  description: "The page you are looking for does not exist. Return to the Trip Dashboard.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-alabaster">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-parchment border border-hairline rounded-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-sage-tint flex items-center justify-center mx-auto">
            <span className="font-editorial text-3xl font-bold text-sage">404</span>
          </div>
          <div className="space-y-2">
            <h1 className="font-editorial text-2xl font-bold text-walnut">
              Page Not Found
            </h1>
            <p className="text-sm text-taupe leading-relaxed">
              This route doesn&apos;t exist. Head back to the Trip Dashboard to
              manage your group expenses.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center px-6 rounded-xl bg-amber-glow hover:bg-amber-hover text-amber-ink font-semibold text-sm transition-colors"
          >
            Back to Trip Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
