import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Privacy Policy – FairFare Trip Splitter",
  description:
    "FairFare Trip Splitter stores no real personal data. All demo trips use strictly synthetic, fictional information. Read our data handling policy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-alabaster">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-taupe">
            <li>
              <Link href="/" className="hover:text-walnut transition-colors">
                Trips
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li className="text-walnut font-medium" aria-current="page">
              Privacy Policy
            </li>
          </ol>
        </nav>

        <article className="bg-parchment border border-hairline rounded-2xl p-6 sm:p-8 space-y-8">
          <header className="space-y-2">
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-walnut">
              Privacy Policy
            </h1>
            <p className="text-sm text-taupe">Last updated: November 2026</p>
          </header>

          {[
            {
              heading: "1. No Real Personal Data",
              body: "FairFare – Trip Splitter is a demonstration product. All pre-loaded trip data (names, amounts, categories) is strictly synthetic and fictional. No real personal information is collected, stored, or transmitted.",
            },
            {
              heading: "2. Local-First Storage",
              body: "All trip data you create during a session is stored in a local SQLite database on the server running this application. No data is sent to third-party analytics services, advertising networks, or external APIs.",
            },
            {
              heading: "3. No Cookies or Tracking",
              body: "This application does not use non-essential cookies, tracking pixels, or fingerprinting. No consent banner is displayed because no optional cookies are set.",
            },
            {
              heading: "4. Frontend Bundle",
              body: "The frontend JavaScript bundle contains no API keys, private tokens, or credentials. The only runtime configuration is the backend API base URL, set via a public environment variable (NEXT_PUBLIC_API_URL).",
            },
            {
              heading: "5. Contact",
              body: "For questions about this policy or the demo application, use the Thank You page contact form.",
            },
          ].map(({ heading, body }) => (
            <section key={heading} className="space-y-2">
              <h2 className="font-editorial text-lg font-bold text-walnut">{heading}</h2>
              <p className="text-sm text-taupe leading-relaxed">{body}</p>
            </section>
          ))}

          <div className="pt-4 border-t border-hairline flex gap-4">
            <Link
              href="/terms"
              className="text-sm font-medium text-sage hover:text-walnut transition-colors"
            >
              Terms &amp; Conditions →
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-taupe hover:text-walnut transition-colors"
            >
              Trip Dashboard →
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
