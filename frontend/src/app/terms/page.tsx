import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Terms & Conditions – RED Trip Splitter",
  description:
    "Usage terms for RED Trip Splitter: a demonstration settlement engine using integer-cent math and strictly synthetic data.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-alabaster">
      <Header />
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
              Terms &amp; Conditions
            </li>
          </ol>
        </nav>

        <article className="bg-parchment border border-hairline rounded-2xl p-6 sm:p-8 space-y-8">
          <header className="space-y-2">
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-walnut">
              Terms &amp; Conditions
            </h1>
            <p className="text-sm text-taupe">Last updated: November 2026</p>
          </header>

          {[
            {
              heading: "1. Demonstration Purpose",
              body: "RED – Trip Splitter is provided as a technical demonstration of integer-cent group expense settlement. It is not a financial product, payment processor, or regulated service.",
            },
            {
              heading: "2. Calculation Accuracy",
              body: "All split calculations use integer cents/paise arithmetic to prevent floating-point rounding drift. The zero-sum guarantee (sum of all net balances == 0) is enforced programmatically. However, users should verify settlement amounts independently before making real payments.",
            },
            {
              heading: "3. Synthetic Demo Data",
              body: "Pre-loaded trip data is entirely fictional. Any resemblance to real persons, amounts, or transactions is coincidental. No real financial data should be entered into this demonstration.",
            },
            {
              heading: "4. No Liability",
              body: "The creators of RED – Trip Splitter accept no liability for financial decisions made based on calculations displayed in this application. Use this tool as a reference aid only.",
            },
            {
              heading: "5. Open Source & Fair Use",
              body: "This project is built for educational and demonstration purposes. Code and algorithms may be freely referenced with attribution.",
            },
          ].map(({ heading, body }) => (
            <section key={heading} className="space-y-2">
              <h2 className="font-editorial text-lg font-bold text-walnut">{heading}</h2>
              <p className="text-sm text-taupe leading-relaxed">{body}</p>
            </section>
          ))}

          <div className="pt-4 border-t border-hairline flex gap-4">
            <Link
              href="/privacy"
              className="text-sm font-medium text-sage hover:text-walnut transition-colors"
            >
              Privacy Policy →
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
