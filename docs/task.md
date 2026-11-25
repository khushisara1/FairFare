# Phased Execution Roadmap: RED – Trip Splitter

> **Document Status:** Foundational Specification  
> **Governance Rule:** Strictly **4 Phases**. Do not execute `docs/ending.md` until all 4 phases below are checked off and verified.

---

## Phase 1: Foundation, Contracts, SQLite Schema & Synthetic Seeder
- [x] Initialize `backend/` FastAPI project structure (`app/main.py`, `database.py`, `models.py`, `schemas.py`, `requirements.txt`).
- [x] Define SQLite/SQLModel schema for `Trip`, `Member`, `Expense`, and `ExpenseSplit` using integer `cents` fields and foreign keys.
- [x] Define contract-first Pydantic schemas (`TripCreate`, `TripRead`, `MemberCreate`, `ExpenseCreate`, `BalanceSummary`, `SettlementTransfer`, `TripInsights`, `NudgeResponse`).
- [x] Build deterministic 5-trip synthetic data seeder (`backend/app/seed.py`) generating **20–40 expenses per trip** with strictly fictional names/numbers and mixed `equal`, `subset`, and `custom` splits.
- [x] Implement Trip Insights query service (`backend/app/services/insights.py`) returning top spending categories, highest payer, and most frequent payer per trip.
- [x] Verify database creation, seeding of all 5 trips, and zero-sum integrity across all seeded expenses.

## Phase 2: Core Backend API, Settlement Engine & Nudge Generator
- [x] Implement remainder-safe `equal`, `subset`, and `custom` split calculator (`backend/app/services/splitter.py`) with strict `sum(shares) == amount_cents` validation.
- [x] Implement zero-sum net balance calculator (`backend/app/services/settlement.py`) with `sum(net_balances) == 0` assertion.
- [x] Implement greedy debtor-to-creditor minimum-payment simplifier guaranteeing $\le N - 1$ transfers.
- [x] Implement Level 3 low-awkwardness "Nudge" message generator (`backend/app/services/nudge.py`) supporting tone presets (*Casual*, *Playful*, *Direct*).
- [x] Wire FastAPI routes (`backend/app/routers/trips.py`) for trip creation, member addition, expense logging/deletion, balances, settle-up paths, insights, and nudge generation.
- [x] Write and pass backend unit & integration tests (`tests/test_settlement.py`, `tests/test_api.py`) covering odd-cent remainders, subset splits, and $\le N - 1$ transfers.

## Phase 3: Next.js Frontend, 60/30/10 Design System & Interactive UI ✅
- [x] Initialize `frontend/` Next.js (App Router) + TypeScript + Tailwind CSS project with `Plus Jakarta Sans`, `Inter`, and `JetBrains Mono` / `tabular-nums`.
- [x] Configure global CSS with the 60/30/10 palette (`#F8F7F4`, `#FFFFFF`, `#EEF2EE`, `#4A6B5D`, `#3E2723`, `#6D5D56`, `#F59E0B`/`#D97706`) and WCAG AA semantic status tokens via CSS custom properties.
- [x] Create typed API client (`src/lib/api.ts`), currency formatter (`src/lib/format.ts`), and TypeScript contracts (`src/types/api.ts`) matching Pydantic schemas.
- [x] Build layout-matched skeleton loaders (`src/components/Skeletons.tsx`) for Trip List, Balances, Settle-Up Cards, and Insights Panel (pulsing `#EEF2EE` tracks, zero layout shift).
- [x] Build Trip Dashboard (`src/app/page.tsx`) and Trip Detail view (`src/app/trips/[id]/page.tsx`) with Minimalist Bento Grid, `+`/`-` net balances, InsightsCard, and SettlementsCard.
- [x] Build the 10-Second Expense Entry Modal (`src/components/ExpenseModal.tsx`) with progressive disclosure (`Equal` | `Select People` | `Custom`) and live remaining-cents validation.
- [x] Build the one-click copyable "Nudge" generator UI (`src/components/NudgeModal.tsx`) with tone presets and instant clipboard feedback.

## Phase 4: Edge-Case QA, 90-Minute Gate Dry Run & Post-Build Polish ✅
- [x] Run end-to-end edge-case math QA (`tests/test_phase4_qa.py`): odd-cent 3-way splits, 1-person subset, zero-balance exclusion, custom split over/under-allocation, ≤ N−1 guarantee — **19/19 tests pass**.
- [x] Execute **90-Minute Gate Dry Run**: 4-person `Gate Demo Weekend` trip with equal ($100.01), subset ($40.00/2 people), and custom ($60.00 unequal) expenses — `sum(net_balances) == 0` ✓, `len(settlements) ≤ 3` ✓, Nudge generated ✓.
- [x] Execute applicable items from post-completion checklist (`docs/ending.md`): `not-found.tsx`, `/privacy`, `/terms`, `/thank-you`, JSON-LD SoftwareApplication schema, OpenGraph metadata, sticky mobile CTA bar (`< 768px`), breadcrumbs navigation.
- [x] Verified zero secrets exposed in frontend bundle (audit: no SECRET/KEY/TOKEN in `.env*` or source). Updated `docs/memory.md` and `docs/task.md`. Wrote 3-minute live demo pitch script (`docs/pitch.md`).
- [x] **Delete Trip (End-to-End):** Implement `DELETE /api/trips/{trip_id}` (`204 No Content` / `404`) with full SQLite cascade (`Member`, `Expense`, `ExpenseSplit`), plus subtle Terracotta Rust (`#B84A39`) "Delete Trip" action & accessible confirmation modal on `/trips/[id]` that clears `localStorage` identity and redirects to `/`.

## Phase 5: Invites, WhatsApp Nudges & Multi-Purpose Modes
- [x] **5.1 Zero-Friction Member Invites:** Add a "Share / Invite" button in the trip header (`Copy Trip Link` & `Invite via WhatsApp`) and a "Who are you?" member pill bar persisted in `localStorage` to auto-select "Paid by" in `+ Add Expense`.
- [x] **5.2 One-Tap WhatsApp Payment Reminders:** Add a "Send via WhatsApp" button next to Nudge on each transfer card in `SettlementsCard.tsx` (`https://wa.me/?text=...` with owed amount, recipient, and trip link).
- [x] **5.3 Multi-Purpose Modes:** Support preset trip/group templates (Roadtrip, Flatmates, Event) and quick-currency switching.

## Phase 6: Installable PWA Mobile App
- [x] **6.1 Installable Mobile PWA Manifest:** Create `frontend/src/app/manifest.ts` (`FairFare – Trip Splitter`, `FairFare`, `standalone`, `#F8F7F4`, `#4A6B5D`, app icons) for Android/iOS home screen installation.
- [x] **6.2 Offline & Install Prompt:** Add service worker caching for static shell and subtle install prompt banner on mobile.
