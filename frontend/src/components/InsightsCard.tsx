import { Award, Repeat } from "lucide-react";
import { formatCents } from "@/lib/format";
import type { TripInsights } from "@/types/api";

interface InsightsCardProps {
  currency: string;
  insights: TripInsights;
}

export function InsightsCard({ currency, insights }: InsightsCardProps) {
  return (
    <section
      aria-labelledby="insights-heading"
      className="bg-parchment border border-hairline rounded-2xl p-6 space-y-5"
    >
      <div className="space-y-1">
        <h2 id="insights-heading" className="font-editorial text-lg font-bold text-walnut">
          Trip Spending Insights
        </h2>
        <p className="text-xs text-taupe">
          Where the group budget went and who covered the most
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-alabaster border border-hairline space-y-1">
          <span className="text-xs font-medium text-taupe">Total Spend</span>
          <p className="font-mono font-semibold text-lg text-walnut tabular-currency">
            {formatCents(insights.total_spend_cents, currency)}
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-alabaster border border-hairline space-y-1">
          <span className="text-xs font-medium text-taupe">Per-Person Avg</span>
          <p className="font-mono font-semibold text-lg text-walnut tabular-currency">
            {formatCents(insights.per_person_average_cents, currency)}
          </p>
        </div>
      </div>

      {/* Payer Highlights */}
      {(insights.highest_payer || insights.most_frequent_payer) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.highest_payer && (
            <div className="p-3.5 rounded-xl bg-sage-tint/70 border border-hairline space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sage">
                <Award className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Highest Payer</span>
              </div>
              <p className="text-sm font-bold text-walnut truncate">
                {insights.highest_payer.member_name}
              </p>
              <p className="text-xs text-taupe font-mono tabular-currency">
                {formatCents(insights.highest_payer.total_paid_cents, currency)}
              </p>
            </div>
          )}

          {insights.most_frequent_payer && (
            <div className="p-3.5 rounded-xl bg-sage-tint/70 border border-hairline space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sage">
                <Repeat className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Most Frequent</span>
              </div>
              <p className="text-sm font-bold text-walnut truncate">
                {insights.most_frequent_payer.member_name}
              </p>
              <p className="text-xs text-taupe tabular-currency">
                {insights.most_frequent_payer.expense_count} expenses logged
              </p>
            </div>
          )}
        </div>
      )}

      {/* Top Categories */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-taupe">
          Top Categories
        </h3>
        {insights.top_categories.length === 0 ? (
          <p className="text-sm text-taupe">No category data yet.</p>
        ) : (
          <ul className="space-y-3">
            {insights.top_categories.slice(0, 5).map((cat) => (
              <li key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-walnut">
                    {cat.category}{" "}
                    <span className="font-normal text-taupe">({cat.expense_count})</span>
                  </span>
                  <span className="font-mono font-medium text-walnut tabular-currency">
                    {formatCents(cat.total_cents, currency)} · {cat.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-sage-tint overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sage transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(4, cat.percentage))}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
