# System Architecture & Tech Stack: RED – Trip Splitter

> **Document Status:** Foundational Specification  
> **Architecture Style:** Decoupled Monorepo (Contract-First REST API + Typed SPA/SSR Frontend)

---

## 1. Tech Stack & Rationale

| Layer | Technology | Rationale ("What & Why") |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (App Router) + TypeScript + Tailwind CSS** | Enables rapid component velocity with clean multi-route structure (`/`, `/trips/[id]`, `/privacy`, `/terms`), strict end-to-end TypeScript safety matching backend schemas, and utility-first styling for our 60/30/10 design system. |
| **Backend** | **FastAPI (Python 3.11+)** | Provides automatic OpenAPI/Swagger documentation for fast contract alignment, native Pydantic v2 request/response validation, and clean async-ready routing. |
| **Database** | **SQLite via SQLModel / SQLAlchemy** | Zero-config relational persistence ideal for rapid local builds and live demos without external database server overhead, while enforcing foreign-key integrity between trips, members, expenses, and splits. |
| **Math & Data** | **Integer Cents/Paise Arithmetic + Faker / Python Seed Scripts** | Integer math eliminates IEEE-754 floating-point rounding drift (`0.1 + 0.2 != 0.3`). Deterministic Python/Faker scripts seed 5 realistic, strictly synthetic trips (20–40 expenses each) on demand. |

---

## 2. Core Settlement & Math Algorithms

### 2.1 Integer Cents & Remainder-Safe Splitting
All monetary values are stored and processed as signed/unsigned **integers representing cents/paise** (e.g., `$12.50` = `1250`).

When an expense of `amount_cents` ($A$) is split across $k$ selected participants:
1. **Base Share:** $q = \lfloor A / k \rfloor$
2. **Remainder:** $r = A \bmod k$
3. **Deterministic Allocation:** Sort participating `member_id` values ascending. The first $r$ participants receive $q + 1$ cents; the remaining $k - r$ participants receive $q$ cents.
4. **Invariant:** $\sum_{i=1}^{k} \text{share}_i = r(q + 1) + (k - r)q = kq + r = A$. Zero cents are ever lost or invented.

For `custom` (unequal) splits, the backend validates that $\sum_{i=1}^{k} \text{custom\_share}_i = A$ before persisting; otherwise, it rejects the request with HTTP `422 Unprocessable Entity`.

### 2.2 Net Balance Calculation
For each member $m$ in a trip:
$$\text{net\_balance}(m) = \sum_{e \in \text{PaidBy}(m)} e.\text{amount\_cents} - \sum_{s \in \text{OwedBy}(m)} s.\text{share\_cents}$$

- $\text{net\_balance}(m) > 0$: Member is a **Creditor** (is owed money).
- $\text{net\_balance}(m) < 0$: Member is a **Debtor** (owes money).
- $\text{net\_balance}(m) = 0$: Member is **Settled**.

Because every expense has $\text{total\_paid} = \text{total\_owed}$, the global trip invariant always holds:
$$\sum_{m \in \text{Members}} \text{net\_balance}(m) = 0$$

### 2.3 Greedy Minimum-Payment Simplification ($\le N - 1$ Transfers)
To minimize the total number of peer-to-peer transfers:
1. Partition non-zero members into two lists:
   - `creditors`: `(member, balance)` where `balance > 0`, sorted descending by `balance`.
   - `debtors`: `(member, -balance)` where `balance < 0`, sorted descending by owed amount.
2. Initialize two pointers (`i = 0` for debtors, `j = 0` for creditors).
3. While `i < len(debtors)` and `j < len(creditors)`:
   - Let `transfer = min(debtors[i].owes, creditors[j].owed)`.
   - Record settlement transfer: `debtors[i].member → creditors[j].member : transfer`.
   - Decrement `debtors[i].owes -= transfer` and `creditors[j].owed -= transfer`.
   - If `debtors[i].owes == 0`, advance `i += 1`.
   - If `creditors[j].owed == 0`, advance `j += 1`.

**Why $\le N - 1$ is guaranteed:** Each iteration settles at least one participant's remaining balance to `0`. With $N$ total participants, at most $N - 1$ steps can occur before both lists are exhausted (since the final remaining debtor and creditor must have equal and opposite balances, settling both simultaneously).

---

## 3. Application Flow

### 3.1 Data Seeding Flow
1. On startup (or via CLI command `python -m app.seed`), the seeder checks if the SQLite database is empty.
2. If empty, it deterministically generates **5 fictional trips** (e.g., *Alpine Cabin Weekend*, *Kyoto Ramen Trail*, *Coastal Roadtrip*, *Desert Music Fest*, *Lakehouse Retreat*) with **20–40 expenses each**, varied categories, and mixed `equal`, `subset`, and `custom` splits.
3. Every seeded trip runs through the same remainder-safe split and zero-sum assertion pipeline used by the live API.

### 3.2 Contract-First API Sync
1. Backend Pydantic schemas (`backend/app/schemas.py`) define the canonical JSON shapes for `Trip`, `Member`, `ExpenseCreate`, `ExpenseRead`, `BalanceSummary`, `SettlementTransfer`, `TripInsights`, and `NudgeResponse`.
2. FastAPI exposes `/openapi.json` automatically.
3. Frontend TypeScript interfaces (`frontend/src/types/api.ts`) mirror these exact contracts, ensuring zero field-name mismatches or implicit `any` types.

### 3.3 Expense Mutation Loop
1. User clicks **"+ Add Expense"** in the Next.js UI and submits the 10-second form.
2. Frontend sends `POST /api/trips/{trip_id}/expenses` with integer `amount_cents`.
3. Backend validates payer/participants, computes/verifies exact integer splits, persists to SQLite in a single transaction, recalculates net balances (asserting `sum == 0`), and returns the updated expense.
4. Frontend invalidates/refetches the trip detail endpoint (`GET /api/trips/{trip_id}`)—showing layout-matched skeleton states if needed—and immediately updates **Net Balances**, **Settle-Up Transfers**, and **Trip Insights**.

---

## 4. Planned Repository File & Folder Tree

```text
GoDaddy/
├── docs/
│   ├── prd.md                  # Product Requirements Document
│   ├── architecture.md         # System Architecture & Tech Stack (this file)
│   ├── design.md               # Visual System, 60/30/10 Color & Typography
│   ├── rules.md                # Engineering & AI Guardrails
│   ├── task.md                 # 4-Phase Execution Roadmap
│   ├── memory.md               # Living Context, State & AI Prompt Log
│   └── ending.md               # Post-Completion Launch & Compliance Checklist
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app initialization, CORS, healthcheck
│   │   ├── database.py         # SQLite engine & session management
│   │   ├── models.py           # SQLModel tables (Trip, Member, Expense, ExpenseSplit)
│   │   ├── schemas.py          # Pydantic request/response contracts
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── splitter.py     # Remainder-safe split & custom validation
│   │   │   ├── settlement.py   # Zero-sum balance & greedy <= N-1 simplifier
│   │   │   ├── insights.py     # Category breakdown & top/frequent payer queries
│   │   │   └── nudge.py        # Low-awkwardness Nudge message generator
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── trips.py        # Trip, member, expense, settle-up & nudge endpoints
│   │   └── seed.py             # Deterministic 5-trip synthetic data seeder
│   ├── tests/
│   │   ├── test_settlement.py  # Zero-sum, remainder & <= N-1 unit tests
│   │   └── test_api.py         # 90-minute gate & API integration tests
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx      # Root layout, fonts, Warm Alabaster canvas
    │   │   ├── page.tsx        # Trip selector & overview dashboard
    │   │   ├── not-found.tsx   # Custom 404 page (Phase 4 / ending.md)
    │   │   ├── trips/
    │   │   │   └── [id]/
    │   │   │       └── page.tsx # Trip detail: Balances, Settle-Up, Insights, Expenses
    │   │   ├── privacy/
    │   │   │   └── page.tsx    # Privacy Policy (ending.md)
    │   │   ├── terms/
    │   │   │   └── page.tsx    # Terms & Conditions (ending.md)
    │   │   └── thank-you/
    │   │       └── page.tsx    # Inquiry confirmation page (ending.md)
    │   ├── components/
    │   │   ├── Skeletons.tsx   # Layout-matched skeleton loaders
    │   │   ├── ExpenseModal.tsx # 10-second expense entry modal
    │   │   ├── BalanceList.tsx # Member net balance cards (+ / - semantic status)
    │   │   ├── SettleUpList.tsx # <= N-1 transfer cards + Nudge trigger
    │   │   ├── InsightsPanel.tsx # Top categories + highest/frequent payer
    │   │   └── NudgeModal.tsx  # Tone-selectable, 1-click copyable Nudge UI
    │   ├── lib/
    │   │   ├── api.ts          # Typed fetch client for FastAPI backend
    │   │   └── format.ts       # Integer cents -> currency string formatter
    │   └── types/
    │       └── api.ts          # TypeScript interfaces mirroring Pydantic schemas
    ├── package.json
    ├── tailwind.config.ts      # 60/30/10 palette & font tokens
    └── tsconfig.json
```
