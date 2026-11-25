# Product Requirements Document (PRD): RED – Trip Splitter

> **Document Status:** Foundational Specification  
> **Product Name:** RED – Trip Splitter  
> **Owner:** Principal Technical Project Manager & Lead Software Architect  

---

## 1. Vision, Mission & Problem Statement

### 1.1 Vision
Make post-trip expense reconciliation effortless, mathematically indisputable, and socially frictionless for any group of travelers.

### 1.2 Mission
End the post-trip "who owes whom" fight with the absolute fewest possible peer-to-peer payments and zero social awkwardness.

### 1.3 Core Problem Statement
Group trips consistently end with a fragmented spreadsheet or a chaotic chat thread where multiple people paid for overlapping subsets of the group across dozens of expenses. Manual reconciliation suffers from three chronic failures:
1. **Payment Explosion:** Naive pair-by-pair settlement creates $O(N^2)$ transfers (e.g., 6 people sending 12–15 small payments back and forth).
2. **Rounding & Math Drift:** Floating-point splits and ad-hoc rounding cause totals not to sum to zero, sparking distrust over missing dollars/cents.
3. **Social Awkwardness:** Chasing friends for money after a great trip feels transactional and uncomfortable, leading payers to eat costs or delay asking.

**RED – Trip Splitter** solves all three by enforcing exact integer-cent zero-sum accounting, reducing settlements to at most $N - 1$ transfers, surfacing clear trip spending insights, and generating low-awkwardness "Nudge" messages.

---

## 2. Target User Personas

| Persona | Description | Primary Needs | Success Metric |
| :--- | :--- | :--- | :--- |
| **1. The Organizer / Heavy Payer** | Books the lodging, covers group dinners, and fronts shared transport. Usually ends the trip as the primary net creditor. | Fast expense entry (< 10 seconds), confidence that every cent is accounted for, and a polite way to remind debtors without sounding pushy. | Logs expenses rapidly during the trip; collects all reimbursements in minimal transfers with zero awkward follow-ups. |
| **2. The Casual Trip Member** | Joins activities, occasionally buys coffee or snacks for a subset of friends, and wants to pay back their exact share in one clean transfer. | Instant clarity on net balance (`+` owed vs. `-` owes), transparent breakdown of why they owe what they owe, and a single "Settle Up" action. | Understands their net position in < 5 seconds and settles their entire trip debt in 1 payment. |
| **3. Live Demo Evaluators** | Technical reviewers and stakeholders testing the system during the **90-minute live gate** (e.g., 4 people, 3 expenses). | Immediate comprehension of seeded data, deterministic zero-sum verification, clean UI without clutter, and verifiable minimum-payment math. | Gate scenario (4 people, 3 expenses) passes with exact `sum == 0` net balances and optimal $\le N - 1$ transfers. |

---

## 3. Functional Requirements

Requirements are organized across three architectural layers (**Data**, **Backend API**, **Creative UI**) and mapped to progressive capability levels (**Level 1**, **Level 2**, **Level 3**).

### 3.1 Data Layer
- **[L1-D1] Strictly Synthetic Seed Dataset:** Generate **5 realistic, anonymized group trips** using deterministic Python/Faker scripts.
  - Each trip must contain **20–40 expenses** across realistic categories (e.g., *Lodging*, *Dining*, *Transport*, *Groceries*, *Activities*, *Supplies*).
  - **Zero Real PII:** All member names, emails/handles, trip titles, and notes must be strictly fictional.
- **[L1-D2] Integer Currency Representation:** Store all monetary amounts as integer **cents/paise** (`int`), never as floating-point numbers (`float`).
- **[L2-D1] Flexible Split Persistence:** Persist both full-group splits, **subset splits** (selected members only), and **custom/unequal splits** with exact per-member share allocations.
- **[L3-D1] Trip Insights Aggregation:** Support efficient queries for:
  - Total trip spend and per-person average.
  - **Top spending categories** ranked by total integer cents and percentage of trip spend.
  - **Highest payer** (most total cents paid) and **most frequent payer** (highest count of expenses paid) per trip.

### 3.2 Backend API Layer
- **[L1-B1] Trip & Member Management:**
  - Create trips (name, currency code, optional description).
  - Add members to a trip (preventing duplicate names within the same trip).
  - List all trips and fetch full trip details (members, expenses, balances, settlements, insights).
- **[L1-B2] Expense Logging & Remainder-Safe Splitting:**
  - Log expenses with `title`, `amount_cents`, `category`, `payer_id`, `split_mode` (`equal`, `subset`, `custom`), and `splits`.
  - **Deterministic Remainder Distribution:** When `amount_cents` does not divide evenly among $k$ participants, distribute the remainder cents (`amount_cents % k`) deterministically (e.g., +1 cent to the first $r$ participants in sorted member ID order) so that `sum(shares) == amount_cents` always holds.
- **[L1-B3] Zero-Sum Balance Engine:**
  - Compute each member's net balance: $\text{net\_balance} = \text{total\_paid} - \text{total\_owed}$.
  - Enforce and verify the strict invariant: `sum(member.net_balance for member in trip) == 0`.
- **[L2-B1] Minimum-Payment Settlement Simplifier:**
  - Implement a greedy debtor-to-creditor matching algorithm that produces at most $N - 1$ transfers for $N$ participants, completely eliminating circular or redundant payments.
  - Ignore zero-balance members (`net_balance == 0`) from transfer generation.
- **[L3-B1] Low-Awkwardness "Nudge" Message Generator:**
  - Generate personalized, friendly, low-awkwardness payment reminder messages for any debtor-to-creditor transfer, incorporating trip name, amount, and optional tone presets (e.g., *Casual*, *Playful*, *Direct*).

### 3.3 Creative UI Layer
- **[L1-U1] Trip Dashboard & Member Overview:**
  - Display all 5 seeded trips plus newly created trips.
  - Show clear per-member net balances with explicit `+` / `-` signs, semantic status badges, and aligned tabular numerals.
- **[L1-U2] 10-Second Expense Entry Modal:**
  - Streamlined modal/drawer designed for sub-10-second entry: Amount → Title → Payer → Split Mode.
  - Progressive disclosure for split modes: `Equal` (default, 1-click) | `Select People` (subset checkboxes) | `Custom` (exact cents/amount inputs with live remaining-balance validation).
- **[L2-U1] Settle-Up Path Visualizer:**
  - Present the simplified $\le N - 1$ transfer cards clearly (`Debtor → Creditor: $XX.XX`), highlighting the reduction compared to raw expense count.
- **[L3-U1] Trip Spending Insights Panel:**
  - Visual breakdown of top spending categories and callout badges for **Highest Payer** and **Most Frequent Payer**.
- **[L3-U2] One-Click Copyable "Nudge" Generator:**
  - Each settle-up card includes a **"Nudge"** action that opens or copies a warm, low-awkwardness message to the clipboard with instant visual confirmation.
- **[L3-U3] Layout-Matched Skeleton Loaders & Accessibility:**
  - Every async view renders layout-matched skeleton loaders (zero blank screens or layout shift) and adheres strictly to WCAG 2.2 AA contrast and touch-target standards.

---

## 4. Non-Functional Constraints & Governance

1. **Strictly Synthetic Data:** Zero real names, phone numbers, emails, bank details, or real trip records anywhere in the repository, seed scripts, or tests.
2. **Mathematical Integrity:** Floating-point arithmetic is prohibited for currency calculations. Every balance and split mutation must preserve `sum(net_balances) == 0`.
3. **AI Prompt & Error Logging:** Maintain a structured log in `docs/memory.md` tracking prompts given to AI assistants, what AI got wrong (e.g., rounding drift, UI clutter, wrong contracts), and how each issue was resolved.
4. **90-Minute Live Gate Readiness:** The application must reliably execute a live 90-minute gate test scenario—creating a fresh trip with **4 people** and **3 expenses** (covering equal, subset, and custom splits)—and immediately display accurate zero-sum balances and $\le 3$ minimum settlement transfers.
5. **Scope Discipline:** Execution is strictly capped at 4 phases (`docs/task.md`). Post-completion polish items (`docs/ending.md`) are deferred until Phases 1–4 are verified complete.
