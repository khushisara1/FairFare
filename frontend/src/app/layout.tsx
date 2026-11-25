import type { Metadata } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { PwaManager } from "@/components/PwaManager";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "FairFare – Trip Splitter | Zero-Sum Group Expense Settlement",
    template: "%s – FairFare Trip Splitter",
  },
  description:
    "End the post-trip who-owes-whom debate with minimum peer-to-peer payments, clear spending insights, and low-awkwardness Nudge messages.",
  openGraph: {
    type: "website",
    siteName: "FairFare – Trip Splitter",
    title: "FairFare – Trip Splitter | Zero-Sum Group Expense Settlement",
    description:
      "Integer-cent splits, greedy ≤ N-1 settlement transfers, and one-click Nudge messages. No spreadsheet chaos.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "FairFare Trip Splitter – group expense settlement dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FairFare – Trip Splitter",
    description:
      "Zero-sum integer-cent trip expense splitting. Minimum payments, no awkwardness.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full bg-alabaster text-walnut flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "FairFare – Trip Splitter",
              applicationCategory: "FinanceApplication",
              description:
                "Zero-sum group expense splitter using integer-cent arithmetic and greedy ≤ N-1 minimum-payment settlement.",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
        <AuthProvider>
          {children}
          <PwaManager />
        </AuthProvider>
        {/* Sticky mobile CTA bar — only visible < 768px */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-parchment border-t border-hairline px-4 py-3 safe-area-inset-bottom">
          <Link
            href="/"
            className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-amber-glow hover:bg-amber-hover text-amber-ink font-semibold text-sm transition-colors"
          >
            <span aria-hidden="true">+</span>
            <span>Add Expense</span>
          </Link>
        </div>
      </body>
    </html>
  );
}
