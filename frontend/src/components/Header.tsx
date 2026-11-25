import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  backHref?: string;
  backLabel?: string;
  rightSlot?: React.ReactNode;
}

export function Header({ backHref, backLabel = "All Trips", rightSlot }: HeaderProps) {
  return (
    <header className="bg-parchment border-b border-hairline">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 min-h-[44px] pr-2 rounded-lg text-walnut hover:text-sage transition-colors"
          >
            <span
              className="w-8 h-8 rounded-lg bg-sage text-parchment font-editorial font-bold text-sm flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              FF
            </span>
            <span className="font-editorial font-bold text-lg tracking-tight truncate">
              FairFare
            </span>
            <span className="hidden sm:inline text-sm font-medium text-taupe border-l border-hairline pl-2.5">
              Trip Splitter
            </span>
          </Link>

          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-sm font-medium text-taupe hover:text-walnut hover:bg-sage-tint transition-colors"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{backLabel}</span>
            </Link>
          )}
        </div>

        {rightSlot && <div className="flex items-center gap-3 shrink-0">{rightSlot}</div>}
      </div>
    </header>
  );
}
