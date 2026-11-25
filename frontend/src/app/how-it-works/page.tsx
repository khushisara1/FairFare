import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "How It Works – Case Studies & FAQs",
  description:
    "See how RED Trip Splitter simplifies real group trips to the minimum number of payments, with answers to common questions about splits, rounding, and privacy.",
};

const CASE_STUDIES = [
  {
    title: "Alpine Cabin Weekend — 4 People, 7 Expenses",
    summary:
      "Alex paid the Airbnb, Blake covered groceries twice, Casey settled two restaurant bills, and Drew paid for the ski lift. Without a tool, that's up to 12 possible payments. RED reduced it to 3.",
    creditor: "Alex +$142.50",
    debtor: "Drew –$68.25",
    transfers: 3,
  },
  {
    title: "Kyoto Ramen Trail — 5 People, Mixed Subset Splits",
    summary:
      "Three people shared a private sake tasting; everyone split the ryokan equally. Subset splits meant the non-participants owed nothing for the tasting — zero over-charging, zero rounding drift.",
    creditor: "Mia +$218.00",
    debtor: "Leo –$74.00",
    transfers: 4,
  },
  {
    title: "Desert Music Fest — 6 People, Custom Unequal Splits",
    summary:
      "VIP upgrades were custom-split: two people paid extra, four shared standard. The greedy settlement engine still resolved six unique net balances in just 5 transfers — the mathematical minimum.",
    creditor: "Sam +$305.00",
    debtor: "River –$112.50",
    transfers: 5,
  },
];

const FAQS = [
  {
    q: "How does minimum-payment simplification work?",
    a: "RED uses a greedy debtor-to-creditor matching algorithm. After computing each person's net balance (paid minus owed), the largest debtor pays the largest creditor first, then repeats until all balances reach zero. This guarantees at most N−1 transfers for N participants — mathematically optimal.",
  },
  {
    q: "How are subset splits (e.g. drinks for some people) calculated?",
    a: "In Subset mode you select exactly which members share the expense. Only those members receive a share; everyone else owes nothing for that item. The selected members split the full amount equally (with deterministic odd-cent distribution).",
  },
  {
    q: "How is odd-cent rounding handled without losing a cent?",
    a: "All math is integer cents — never floats. When an amount doesn't divide evenly, the remainder cents (e.g. 1¢ for a $10.01 ÷ 3 split) are distributed one per person to the first sorted participants. The sum of all shares always equals the original amount exactly.",
  },
  {
    q: "Is my data private? Are real names stored?",
    a: "RED is a demonstration app. All pre-loaded trips use strictly synthetic, fictional data. Any trip data you create is stored only in a local SQLite database on your own machine — nothing is sent to external servers, analytics platforms, or third parties.",
  },
  {
    q: "How are multi-category payers tracked in Spending Insights?",
    a: "The Insights engine aggregates every expense by category and by payer across the whole trip. It surfaces total spend per category (with percentage bars), the member who paid the highest total amount, and the member who logged the most individual expenses.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-alabaster">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-14">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-taupe">
            <li><Link href="/" className="hover:text-walnut transition-colors">Trips</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-walnut font-medium" aria-current="page">How It Works</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-parchment border border-hairline rounded-2xl p-6 sm:p-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-sage">From Chaos to Clarity</p>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-walnut">
            Settlement in the fewest possible moves.
          </h1>
          <p className="text-sm text-taupe leading-relaxed max-w-2xl">
            RED uses integer-cent arithmetic and a greedy matching algorithm to collapse any group
            expense ledger into at most N−1 peer-to-peer payments — always zero-sum, always exact.
          </p>
          {/* Response time promise badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-tint border border-hairline text-xs font-semibold text-sage">
            <span aria-hidden="true">⚡</span> API responses in &lt; 50 ms · Settlements calculated instantly
          </div>
        </section>

        {/* Case Studies */}
        <section aria-labelledby="case-studies-heading" className="space-y-5">
          <h2 id="case-studies-heading" className="font-editorial text-xl font-bold text-walnut">
            Real-Trip Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {CASE_STUDIES.map((cs) => (
              <article
                key={cs.title}
                className="bg-parchment border border-hairline rounded-2xl p-5 space-y-4"
              >
                <h3 className="font-editorial text-base font-bold text-walnut leading-snug">
                  {cs.title}
                </h3>
                <p className="text-xs text-taupe leading-relaxed">{cs.summary}</p>
                <div className="pt-3 border-t border-hairline grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-creditor-bg text-creditor-fg font-mono font-semibold tabular-currency">
                    {cs.creditor}
                  </div>
                  <div className="p-2 rounded-lg bg-debtor-bg text-debtor-fg font-mono font-semibold tabular-currency">
                    {cs.debtor}
                  </div>
                </div>
                <p className="text-xs text-taupe">
                  Settled in <strong className="text-walnut">{cs.transfers} transfer{cs.transfers !== 1 ? "s" : ""}</strong> (≤ N−1)
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section aria-labelledby="faq-heading" className="space-y-5">
          <h2 id="faq-heading" className="font-editorial text-xl font-bold text-walnut">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="bg-parchment border border-hairline rounded-2xl group"
              >
                <summary className="p-5 cursor-pointer list-none flex items-center justify-between gap-3 font-semibold text-sm text-walnut select-none">
                  <span>{faq.q}</span>
                  <span className="text-sage shrink-0 group-open:rotate-180 transition-transform" aria-hidden="true">▾</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-taupe leading-relaxed border-t border-hairline pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-6 space-y-4">
          <p className="text-sm text-taupe">Ready to split your next trip?</p>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center px-8 rounded-xl bg-amber-glow hover:bg-amber-hover text-amber-ink font-semibold text-sm transition-colors"
          >
            Go to Trip Dashboard →
          </Link>
          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-taupe">
            <Link href="/privacy" className="hover:text-walnut transition-colors">Privacy</Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms" className="hover:text-walnut transition-colors">Terms</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
