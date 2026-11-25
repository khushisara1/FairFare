# Post-Completion Launch & Compliance Checklist: RED – Trip Splitter

> [!IMPORTANT]
> **DO NOT EXECUTE THIS FILE DURING THE INITIAL BUILD.**  
> This checklist is strictly for **post-completion** execution—run it **only after** Phases 1–4 in `docs/task.md` are fully implemented, tested, and passing the 90-minute gate dry run.

---

## 1. Routing, UX & Conversion Polish
- [x] **Custom 404 Page (`not-found.tsx`):** Styled in the 60/30/10 Warm Alabaster/Sage/Amber system with a clear return link to the Trip Dashboard.
- [x] **CTA Above the Fold:** Primary Amber Glow CTA (`"+ Add Expense"` or `"Create New Trip"`) is immediately visible without scrolling on desktop and mobile.
- [x] **Internal Links Across Pages:** Consistent navigation linking Dashboard (`/`), Trip Detail (`/trips/[id]`), How It Works (`/how-it-works`), Privacy, and Terms.
- [x] **Thank You Page After Inquiry (`/thank-you`):** Dedicated confirmation route with clear next-step navigation.
- [x] **Breadcrumbs Navigation:** Accessible breadcrumb trail (`Trips / <page>`) on `/privacy`, `/terms`, `/how-it-works`.
- [x] **Sticky Mobile CTA Bar (`< 768px`):** Fixed bottom action bar on mobile viewports for one-thumb `"+ Add Expense"` access with `44x44px` minimum touch target.
- [x] **Response Time Promise Badge:** Trust badge on `/how-it-works` — *"API responses in < 50 ms · Settlements calculated instantly"*.

## 2. Content, Trust & Proof
- [x] **Case Studies (Group Trip Settlement Examples):** `/how-it-works` page showcases 3 realistic, anonymized group trip settlement examples (Alpine Cabin Weekend, Kyoto Ramen Trail, Desert Music Fest).
- [x] **5 FAQs:** FAQ section on `/how-it-works` covering:
  1. How minimum-payment simplification works (≤ N−1 transfers).
  2. How subset splits (e.g. drinks for selected people) are calculated.
  3. How odd-cent rounding is handled deterministically without losing a cent.
  4. Data privacy & synthetic-only demo guarantees.
  5. How multi-category payers and trip insights are tracked.

## 3. SEO, Metadata & Structured Data
- [x] **Unique Page Titles per Route:** `%s – FairFare Trip Splitter` template applied; distinct titles on `/`, `/privacy`, `/terms`, `/thank-you`, `/how-it-works`, `/trips/[id]`.
- [x] **Meta Descriptions per Route:** Concise unique `description` on every route.
- [x] **Social Share Image (`og:image`):** `og-image.svg` configured in OpenGraph and Twitter card metadata with 1200×630 dimensions.
- [x] **Alt Text on All Images:** All decorative icons use `aria-hidden="true"`; no non-decorative raster images in use.
- [x] **Local / Software JSON-LD Schema:** `SoftwareApplication` JSON-LD structured data embedded in root layout.
- [x] **Favicon & App Icons:** `favicon.svg` linked in root layout metadata.

## 4. Legal, Security & Performance Verification
- [x] **Privacy Policy Page (`/privacy`):** Dedicated route explaining data handling and synthetic/local-first storage.
- [x] **Terms & Conditions Page (`/terms`):** Dedicated route outlining usage terms and settlement calculation disclaimers.
- [x] **Cookie Consent Banner (Conditional):** ✗ Omitted — zero non-essential cookies are used. No banner needed.
- [x] **Secrets Verified Off Frontend:** Audit of `frontend/` source and `.env*` files confirmed zero API keys, tokens, or private credentials exposed client-side. Only `NEXT_PUBLIC_API_URL` (public by design) is set.
- [x] **Mobile-Friendly Responsive Verification:** All routes tested at `375px`, `768px`, `1280px`. Bento grid stacks cleanly, sticky CTA renders at `< 768px`, touch targets meet `44x44px` minimum.
- [x] **Compressed Images (WebP/AVIF Optimization):** No raster images used in the UI. All visual elements are CSS/SVG — zero image compression required.
