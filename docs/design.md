# Visual System, Color & Typography: RED – Trip Splitter

> **Document Status:** Foundational Specification  
> **Design Philosophy:** Warm, calm, trustworthy financial clarity—zero spreadsheet anxiety, zero visual clutter.

---

## 1. 60 / 30 / 10 Color Ratio System

The UI strictly adheres to a **60 / 30 / 10** visual hierarchy so that numbers, balances, and primary actions are immediately scannable.

### 1.1 60% Dominant Base (Canvas & Surfaces)
| Token Name | Hex | Usage |
| :--- | :--- | :--- |
| **Warm Alabaster** | `#F8F7F4` | Main application canvas background. Soft, warm off-white that reduces eye strain. |
| **Crisp Parchment** | `#FFFFFF` | Elevated cards, modals, expense rows, and settle-up panels. |
| **Muted Sage Tint** | `#EEF2EE` | Secondary nested surfaces, subtle table headers, and **skeleton loader tracks**. |

### 1.2 30% Secondary Structure (Identity, Typography & Borders)
| Token Name | Hex | Usage |
| :--- | :--- | :--- |
| **Sage Green** | `#4A6B5D` | Brand identity, top navigation accents, active tab indicators, and category bars. |
| **Deep Walnut Brown** | `#3E2723` | Primary headings, body copy, and high-contrast grounding text. |
| **Warm Taupe** | `#6D5D56` | Secondary metadata, timestamps, category labels, and helper descriptions. |

### 1.3 10% Accent / CTA (High-Intent Actions)
| Token Name | Hex | Usage |
| :--- | :--- | :--- |
| **Amber Glow** | `#D97706` (hover/active) / `#F59E0B` (base) | Primary action buttons: **"+ Add Expense"**, **"Settle Up"**, and **"Nudge"**. |
| **CTA Text Pairing** | `#3E2723` (Deep Walnut) | All Amber Glow buttons **must** use Deep Walnut Brown (`#3E2723`) text (never white text on `#F59E0B`) to guarantee WCAG AA contrast. |

---

## 2. Semantic Status Colors

Financial states must be unmistakable at a glance. Every semantic state pairs a distinct foreground/background combination with explicit text labels and `+` / `-` signs.

| Financial State | Foreground Hex | Background Hex | Required Text / Symbol Pairing |
| :--- | :--- | :--- | :--- |
| **Owed / Creditor** | `#2E5A44` (Forest Sage) | `#E6F4EA` (Soft Mint) | Explicit `+` prefix (e.g., `+$142.50`) + `"Is owed"` label |
| **Owes / Debtor** | `#B4432C` (Terracotta Rust) | `#FCECE9` (Soft Clay) | Explicit `-` prefix (e.g., `-$68.25`) + `"Owes"` label |
| **Settled / Zero** | `#475569` (Slate Neutral) | `#F1F5F9` (Cool Mist) | `$0.00` + `"Settled"` badge |
| **Warning / Validation** | `#92400E` (Deep Ochre) | `#FEF3C7` (Warm Cream) | Warning icon + descriptive text (e.g., `"Custom split off by $0.02"`) |

---

## 3. Typography

| Role | Font Family | Weights | Styling Rules |
| :--- | :--- | :--- | :--- |
| **Headings** | `Plus Jakarta Sans` | `600`, `700` | Tight tracking (`-0.02em`) for page titles, trip names, and section headers. |
| **UI & Body** | `Inter` | `400`, `500`, `600` | Clean legibility for labels, expense descriptions, and Nudge message previews. |
| **Currency & Numbers** | `JetBrains Mono` (or `Inter` with `tabular-nums`) | `500`, `600` | **Mandatory `font-variant-numeric: tabular-nums`** on all balances, totals, and split inputs so decimal points align vertically. |

---

## 4. UX & Anti-Clutter Guardrails

### 4.1 Mandatory Layout-Matched Skeleton Loaders
- **Zero blank screens or spinner-only states:** Every async view (Trip List, Trip Balances, Settle-Up Cards, Insights Panel) must render a layout-matched skeleton using **Muted Sage Tint (`#EEF2EE`)** tracks with subtle pulse animation.
- Skeletons must match the exact dimensions and card grid of the loaded content to prevent Cumulative Layout Shift (CLS).

### 4.2 Zero Cluttered UI Elements
- **Generous Spacing:** Cards use `16px–24px` (`p-4` to `p-6`) internal padding and clean `16px` gaps.
- **No Raw Database IDs:** Never display UUIDs or internal integer IDs (`member_id: 4`) in user-facing UI.
- **Progressive Disclosure for Splits:** The 10-second Expense Modal defaults to `Equal` split. `Select People` (subset) and `Custom` (unequal) options reveal their controls only when selected.
- **One Primary CTA per Viewport:** At most one Amber Glow primary button is emphasized per viewport section so the user's eye always knows the next action.

### 4.3 Strict WCAG 2.2 AA Accessibility Compliance
- **Contrast Ratio:** All normal text and interactive labels must achieve $\ge 4.5:1$ contrast ratio against their background (`#3E2723` on `#F8F7F4` and `#FFFFFF` easily exceeds `10:1`; `#3E2723` on `#F59E0B` exceeds `6.5:1`).
- **Never Color-Only:** Every balance or status must include explicit `+` / `-` signs, icons, or text labels (`"Owes"`, `"Is owed"`, `"Settled"`) alongside semantic colors.
- **Mobile Touch Targets:** All buttons, checkboxes, split-mode tabs, and Nudge copy triggers must have a minimum hit area of **`44x44px`**.
- **Keyboard & Focus:** Visible focus rings (`2px` Sage Green `#4A6B5D` outline with offset) on all interactive controls and modal focus trapping.
