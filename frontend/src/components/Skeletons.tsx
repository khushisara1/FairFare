export function TripListSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading trips">
      {/* Editorial Hero Skeleton */}
      <div className="bg-parchment border border-hairline rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-32 rounded bg-sage-tint animate-pulse" />
          <div className="h-8 w-72 max-w-full rounded bg-sage-tint animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded bg-sage-tint animate-pulse" />
        </div>
        <div className="h-11 w-36 rounded-xl bg-sage-tint animate-pulse shrink-0" />
      </div>

      {/* Bento Grid of Trip Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-parchment border border-hairline rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="h-6 w-44 rounded bg-sage-tint animate-pulse" />
                <div className="h-4 w-56 max-w-full rounded bg-sage-tint animate-pulse" />
              </div>
              <div className="h-6 w-12 rounded-full bg-sage-tint animate-pulse" />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-hairline">
              <div className="space-y-1.5">
                <div className="h-3 w-12 rounded bg-sage-tint animate-pulse" />
                <div className="h-5 w-10 rounded bg-sage-tint animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-14 rounded bg-sage-tint animate-pulse" />
                <div className="h-5 w-10 rounded bg-sage-tint animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-16 rounded bg-sage-tint animate-pulse" />
                <div className="h-5 w-20 rounded bg-sage-tint animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TripDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading trip details">
      {/* Top Editorial Summary Card */}
      <div className="bg-parchment border border-hairline rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-16 rounded-full bg-sage-tint animate-pulse" />
            <div className="h-6 w-36 rounded-full bg-sage-tint animate-pulse" />
          </div>
          <div className="h-9 w-64 max-w-full rounded bg-sage-tint animate-pulse" />
          <div className="h-4 w-80 max-w-full rounded bg-sage-tint animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-11 w-32 rounded-xl bg-sage-tint animate-pulse" />
          <div className="h-11 w-40 rounded-xl bg-sage-tint animate-pulse" />
        </div>
      </div>

      {/* Modular Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Net Balances Skeleton */}
        <div className="lg:col-span-7 bg-parchment border border-hairline rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-36 rounded bg-sage-tint animate-pulse" />
            <div className="h-6 w-28 rounded-full bg-sage-tint animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl bg-alabaster border border-hairline"
              >
                <div className="space-y-1.5">
                  <div className="h-5 w-28 rounded bg-sage-tint animate-pulse" />
                  <div className="h-3.5 w-40 rounded bg-sage-tint animate-pulse" />
                </div>
                <div className="h-7 w-24 rounded-lg bg-sage-tint animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Simplified Settle-Up Cards Skeleton */}
        <div className="lg:col-span-5 bg-parchment border border-hairline rounded-2xl p-6 space-y-4">
          <div className="h-6 w-44 rounded bg-sage-tint animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-alabaster border border-hairline flex items-center justify-between gap-3"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-36 rounded bg-sage-tint animate-pulse" />
                  <div className="h-5 w-24 rounded bg-sage-tint animate-pulse" />
                </div>
                <div className="h-11 w-24 rounded-xl bg-sage-tint animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Trip Spending Insights Skeleton */}
        <div className="lg:col-span-5 bg-parchment border border-hairline rounded-2xl p-6 space-y-4">
          <div className="h-6 w-48 rounded bg-sage-tint animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-xl bg-sage-tint animate-pulse" />
            <div className="h-20 rounded-xl bg-sage-tint animate-pulse" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-sage-tint animate-pulse" />
                  <div className="h-4 w-16 rounded bg-sage-tint animate-pulse" />
                </div>
                <div className="h-2.5 w-full rounded-full bg-sage-tint animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expense Ledger Skeleton */}
        <div className="lg:col-span-7 bg-parchment border border-hairline rounded-2xl p-6 space-y-4">
          <div className="h-6 w-48 rounded bg-sage-tint animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-hairline flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-44 rounded bg-sage-tint animate-pulse" />
                  <div className="h-3.5 w-56 rounded bg-sage-tint animate-pulse" />
                </div>
                <div className="h-5 w-20 rounded bg-sage-tint animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
