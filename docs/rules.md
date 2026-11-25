# Engineering & AI Guardrails: RED – Trip Splitter

> **Document Status:** Foundational Specification  
> **Purpose:** Non-negotiable coding, data, design, and AI workflow rules to prevent regressions during rapid development.

---

## 1. What to Use (Mandatory Practices)

### 1.1 Financial Math & Data Integrity
- **Use Integer Cents/Paise Everywhere:** Represent all money as `int` (`amount_cents`, `share_cents`, `net_balance_cents`) in SQLite, Pydantic, FastAPI, and TypeScript. Format to decimal strings (`$12.50`) only at the final UI presentation boundary.
- **Use Deterministic Remainder Distribution:** When splitting `amount_cents` across $k$ participants, distribute `amount_cents % k` cents deterministically (sorted by `member_id` ascending) so `sum(shares) == amount_cents` is always exact.
- **Use Zero-Sum Assertions:** Run `assert sum(balances) == 0` in backend service tests and balance-calculation checks after every expense mutation.

### 1.2 Architecture & Contracts
- **Use Contract-First Schemas:** Define all request/response shapes in `backend/app/schemas.py` (Pydantic) first, and mirror them 1:1 in `frontend/src/types/api.ts` (TypeScript).
- **Use Strictly Synthetic Data:** Generate all 5 seeded trips (20–40 expenses each) and test fixtures using clearly fictional names, trip titles, and numbers.
- **Use Single-Transaction Persistence:** Create an `Expense` and all of its `ExpenseSplit` rows inside a single atomic database transaction so partial splits can never exist.

### 1.3 UI, UX & Accessibility
- **Use Layout-Matched Skeleton Loaders:** Render Muted Sage Tint (`#EEF2EE`) skeleton placeholders matching the final layout for every async fetch.
- **Use the 60/30/10 Color System:** Keep 60% Warm Alabaster/Crisp Parchment, 30% Sage Green/Deep Walnut/Warm Taupe, and 10% Amber Glow CTAs paired with Deep Walnut text.
- **Use WCAG 2.2 AA Standards:** Enforce $\ge 4.5:1$ text contrast, explicit `+`/`-` signs and text labels alongside semantic colors, `tabular-nums` for currency alignment, and `44x44px` minimum touch targets on mobile.

### 1.4 AI Governance
- **Use the Prompt & Error Log:** Record every significant AI prompt, any mistake AI made, and the exact fix in `docs/memory.md`.

---

## 2. What to Avoid (Prohibited Practices)

### 2.1 Math & Data Anti-Patterns
- **Avoid Raw Floating-Point Division:** Never use `float`, `amount / count`, or `round(val, 2)` for splitting expenses or summing balances.
- **Avoid Real Personal Data (PII):** Never include real names, real email addresses, phone numbers, or real bank/Venmo/UPI handles in seed scripts, docs, or tests.

### 2.2 Security & Architecture Anti-Patterns
- **Avoid Exposing Secrets on the Frontend:** Never place API keys, database credentials, or private tokens in `NEXT_PUBLIC_*` environment variables or client-side bundles.
- **Avoid Over-Engineering Beyond 4 Phases:** Do not add authentication servers, external Postgres/Redis clusters, or real payment-gateway integrations during Phases 1–4.

### 2.3 UI & Accessibility Anti-Patterns
- **Avoid Cluttered UIs & Raw IDs:** Never display raw database IDs, dense multi-column tables on mobile, or multiple competing Amber CTAs in the same viewport.
- **Avoid Accessibility Violations:** Never use low-contrast placeholder text as the only label, never rely on color alone (red/green) to communicate debt vs. credit, and never ship blank loading screens.
- **Avoid Unlogged AI Bugs:** Never silently fix an AI-generated math, contract, or UI bug without logging what went wrong in `docs/memory.md`.
