# RED – Trip Splitter (FairFare)

> **End the post-trip "who owes whom" fight with the absolute fewest possible peer-to-peer payments and zero social awkwardness.**

RED – Trip Splitter is a full-stack group expense settlement engine and Minimalist Bento UI built with **FastAPI**, **SQLite / SQLAlchemy**, **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

---

## Key Capabilities

- **Zero-Sum Integer-Cent Math:** All currency calculations run strictly in integer cents/paise (`int`), preventing floating-point rounding drift and guaranteeing `sum(net_balances) == 0`.
- **3 Split Modes:**
  - **Equal:** Splits evenly across all trip members with deterministic remainder distribution.
  - **Select People (`subset`):** Splits only among chosen participants.
  - **Custom (`custom`):** Unequal exact-cent splits with live remaining-cents validation.
- **Greedy Minimum-Payment Settlement:** Simplifies group debts into at most $N - 1$ peer-to-peer transfers for $N$ participants.
- **Trip Spending Insights:** Surfaces total spend, per-person average, top spending categories, highest payer, and most frequent payer.
- **Low-Awkwardness Nudge Generator:** Generates one-click copyable reminder messages in **Casual**, **Playful**, and **Direct** tones.
- **5 Pre-Seeded Synthetic Trips:** Deterministically seeded on startup (`Alpine Cabin Weekend`, `Kyoto Ramen Trail`, `Coastal Roadtrip`, `Desert Music Fest`, `Lakehouse Retreat`) with 24–35 expenses each and zero real PII.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | FastAPI (Python 3.11+), Pydantic v2, Uvicorn |
| **Database** | SQLite + SQLAlchemy 2.0 (`PRAGMA foreign_keys=ON`) |
| **Design System** | Minimalist Bento UI · 60/30/10 Warm Alabaster / Sage Green / Amber Glow · WCAG 2.2 AA |

---

## Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint, CORS, lifespan seeder
│   │   ├── database.py           # SQLite engine & session management
│   │   ├── models.py             # Trip, Member, Expense, ExpenseSplit ORM models
│   │   ├── schemas.py            # Contract-first Pydantic v2 schemas
│   │   ├── seed.py               # Deterministic 5-trip synthetic seeder
│   │   ├── routers/trips.py      # REST API endpoints (/api/trips/...)
│   │   └── services/
│   │       ├── splitter.py       # Remainder-safe equal/subset/custom splitter
│   │       ├── settlement.py     # Zero-sum balance & greedy <= N-1 simplifier
│   │       ├── insights.py       # Category & payer analytics
│   │       └── nudge.py          # Casual / Playful / Direct message generator
│   ├── tests/
│   │   ├── test_settlement.py    # Core splitting & settlement unit tests
│   │   ├── test_api.py           # Integration & 90-minute gate tests
│   │   ├── test_phase4_qa.py     # Edge-case boundary math QA
│   │   └── run_all_tests.py      # Single-command test runner (19 tests)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                  # App Router pages (/, /trips/[id], /how-it-works, /privacy, /terms, /thank-you)
│   │   ├── components/           # Bento cards, Skeletons, ExpenseModal, NudgeModal
│   │   ├── lib/                  # Typed API client & integer-cent formatters
│   │   └── types/                # TypeScript contracts mirroring Pydantic schemas
│   └── package.json
└── docs/                         # PRD, architecture, design system, rules, roadmap, pitch
```

---

## Getting Started

### 1. Start the Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

- API & Interactive Swagger Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 2. Start the Frontend (Next.js)

Create `frontend/.env.local` (optional, defaults to `http://127.0.0.1:8000`):

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Then run:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Running Tests & Production Build

### Backend Test Suite (19 tests)

```bash
cd backend
python tests/run_all_tests.py
```

### Frontend Lint, Typecheck & Build

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```
