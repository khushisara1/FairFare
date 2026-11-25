# Living Context & State Tracker: RED – Trip Splitter

> **Purpose:** Read this file at the start of any coding or review session to immediately restore project context without scanning the entire repository.

---

## 1. Current Project State

### What Is Done
- **Foundational Documentation (`/docs`):** All 7 architectural and planning documents created.
- **Phase 1 (Backend Foundation, Schema, Seeder & Insights):**
  - Created `backend/app/` with `main.py`, `database.py` (SQLAlchemy 2.0 + SQLite with `PRAGMA foreign_keys=ON`), `models.py`, `schemas.py` (Pydantic v2), `seed.py`, and `services/insights.py`.
  - Seeded 5 strictly synthetic trips (`Alpine Cabin Weekend` 26, `Kyoto Ramen Trail` 31, `Coastal Roadtrip` 24, `Desert Music Fest` 35, `Lakehouse Retreat` 28 expenses) and verified `net_balance_sum == 0` across all 5 trips.
- **Phase 2 (Settlement Engine, Nudge & FastAPI Routes):**
  - Implemented `services/splitter.py` (remainder-safe `equal`, `subset`, and `custom` splits), `services/settlement.py` (zero-sum balance engine + greedy $\le N - 1$ transfer simplifier), `services/nudge.py` (*Casual*, *Playful*, *Direct* message generator), and `routers/trips.py` wired into `main.py`.
  - All 8 unit & integration tests in `tests/test_settlement.py` and `tests/test_api.py` (including the 4-person, 3-expense 90-minute gate scenario) pass via `python run_tests.py`.

- **Phase 3 (Next.js Frontend, Bento UI &amp; Modals):**
  - Scaffolded `frontend/` with Next.js 16 (App Router) + TypeScript + Tailwind CSS 4.
  - Configured 60/30/10 color palette via CSS custom properties in `globals.css`; `Plus Jakarta Sans` / `Inter` / `JetBrains Mono` fonts loaded via `next/font/google`.
  - Created `src/types/api.ts` (TypeScript mirror of all Pydantic schemas), `src/lib/api.ts` (typed fetch client with `ApiError`), `src/lib/format.ts` (integer-cent formatters, no float drift).
  - Built `Skeletons.tsx` — layout-matched pulsing `#EEF2EE` skeletons for TripList and all 4 Bento panels.
  - Built Minimalist Bento UI pages: `page.tsx` (Trip List dashboard with editorial hero banner + card grid) and `trips/[id]/page.tsx` (Trip Detail with 12-col Bento grid wrapped in `<Suspense>`).
  - Built all 5 components: `Header.tsx`, `BalancesCard.tsx`, `SettlementsCard.tsx`, `InsightsCard.tsx`, `ExpenseLedgerCard.tsx`.
  - Built `ExpenseModal.tsx` (10-second entry, progressive `Equal` | `Select People` | `Custom` disclosure, live remaining-cents validator) and `NudgeModal.tsx` (3-tone preset, one-click clipboard copy).
  - `npm run lint` → 0 errors; `next build --webpack` → clean (5/5 static pages generated).
- **Phase 4 (QA, Gate Run, Checklist, Pitch):**
  - Wrote `tests/test_phase4_qa.py` with 11 new edge-case tests (odd-cent splits, 1-person subset, zero-balance exclusion, over/under-allocated custom splits, ≤ N−1 guarantee variants). **19/19 total tests pass.**
  - 90-minute gate scenario (`test_90_minute_gate_4_people_3_expenses`) confirmed: zero-sum ✓, ≤ 3 transfers ✓, Nudge ✓, expense deletion updates balances ✓.
  - Built `not-found.tsx`, `/privacy`, `/terms`, `/thank-you` pages with SEO metadata, breadcrumbs, and internal links.
  - Added `SoftwareApplication` JSON-LD schema, full OpenGraph/Twitter metadata, `metadataBase`, sticky mobile CTA bar (`< 768px`).
  - Secrets audit: zero API keys/tokens in `.env*` or source files.
  - Final `next build --webpack` → 8 routes, 0 errors, 0 warnings.
  - Wrote `docs/pitch.md` — 3-minute live demo script with gate checklist.

### What Is Left
- **Nothing.** All 4 phases complete. Run remaining cosmetic items in `docs/ending.md` (favicon asset, og:image PNG, compressed images) only when preparing for public deployment.

---

## 2. Non-Negotiable Rules Summary
1. **Zero-Sum Integer Cents:** All currency math uses integer cents/paise (`int`). Never use `float`. `sum(net_balances) == 0` must always hold.
2. **Strictly Synthetic Data:** Zero real PII. All 5 seeded trips (20–40 expenses each) and tests use fictional names and numbers.
3. **60 / 30 / 10 Design + Skeletons + WCAG AA:**
   - 60% Warm Alabaster (`#F8F7F4`) / Crisp Parchment (`#FFFFFF`) / Muted Sage Tint (`#EEF2EE`).
   - 30% Sage Green (`#4A6B5D`) / Deep Walnut (`#3E2723`) / Warm Taupe (`#6D5D56`).
   - 10% Amber Glow (`#F59E0B`/`#D97706`) with Deep Walnut text.
   - Mandatory layout-matched skeleton loaders, explicit `+`/`-` signs + text labels, `tabular-nums`, and `44x44px` mobile touch targets.
4. **4-Phase Scope Cap:** Stick strictly to the 4 phases in `docs/task.md`. Do not execute `docs/ending.md` until Phases 1–4 are complete.

---

## 3. Master Plan & Architecture Summary
- **Backend:** FastAPI (Python 3.11+) + SQLite (SQLModel/SQLAlchemy) + Pydantic v2.
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS.
- **Core Settlement Flow:**
  1. `splitter.py` splits `amount_cents` with deterministic remainder allocation (`amount % k` distributed +1 cent to first $r$ sorted participants).
  2. `settlement.py` computes `net_balance = paid - owed` for each member, asserts `sum == 0`, and runs greedy two-pointer debtor-to-creditor matching to emit $\le N - 1$ transfers.
  3. `insights.py` aggregates category spend, highest payer, and most frequent payer.
  4. `nudge.py` generates friendly, copyable debtor reminder messages.

---

## 4. AI Prompt & Error Log

> **Instruction:** Every time an AI assistant makes a mistake (math drift, schema mismatch, cluttered UI, accessibility miss, or hallucinated requirement), log it below immediately after fixing.

### Entry Template
```markdown
### [YYYY-MM-DD] Short Title of Issue
- **Phase / Area:** (e.g., Phase 2 - Settlement Engine)
- **Prompt Given:** Concise summary of what was asked.
- **What AI Got Wrong:** Exact bug, wrong assumption, or rule violation.
- **How It Was Fixed:** Exact code/doc change made and verified.
```

### Logged Entries
*(No entries yet — implementation begins in Phase 1.)*
