# RED – Trip Splitter: 3-Minute Live Demo Pitch Script

> **Use this script for the 90-minute gate dry run and any live evaluation.**  
> Target: confident delivery in ≤ 3 minutes. Practice once end-to-end before the session.

---

## ⏱ 00:00 – 00:30 | Hook & Problem (30 sec)

> *"Picture this: five friends just got back from a weekend cabin trip.  
> Alex paid for the Airbnb, Blake covered the groceries, Casey settled the bar tab.  
> Now someone sends a WhatsApp message: 'Who owes what?'  
> And the spreadsheet chaos begins.*  
>  
> *RED ends that fight — with the absolute fewest possible payments and zero social awkwardness."*

**While talking:** Have the Trip Dashboard open at `localhost:3000`. The 5 synthetic trips are already loaded.

---

## ⏱ 00:30 – 01:15 | Live Demo — 10-Second Expense Entry (45 sec)

1. Click **"+ New Trip"** → type `Gate Demo Weekend`, currency `USD` → **Create Trip**
2. On the Trip Detail page, click **"Add Member"** → add: `Alex`, `Blake`, `Casey`, `Drew`
3. Click **"+ Add Expense"**:
   - Description: `Cabin Night` · Amount: `100.01` · Paid by: `Alex` · Split: **Equal**
   - → **Save Expense** *(show the live remaining-cents validator)*
4. Add Expense #2:
   - `Kayak Rental` · `40.00` · Blake · Split: **Select People** → check Blake + Casey only
5. Add Expense #3:
   - `Group Dinner` · `60.00` · Casey · Split: **Custom** → Alex $10, Blake $15, Casey $15, Drew $20
   - → show the green "Exact match" validator → **Save**

**Call-out:** *"Three different split modes — equal, subset, and custom — all in under 10 seconds each."*

---

## ⏱ 01:15 – 02:00 | Settlement Engine & Zero-Sum Proof (45 sec)

Point to **Net Balances** panel:

> *"Every person's net balance is `Paid minus Owed`. The green badge confirms
> zero-sum: all balances cancel perfectly to the last cent — mathematically guaranteed,
> enforced in integer arithmetic, never floating-point."*

Point to **Simplified Settle-Up**:

> *"Four people, three expenses — greedy matching reduces this to at most three  
> peer-to-peer payments. No one pays more people than necessary.  
> Mathematically: at most N minus 1 transfers for N participants."*

---

## ⏱ 02:00 – 02:30 | Spending Insights & Nudge (30 sec)

Point to **Trip Spending Insights** panel:

> *"Category breakdown, top payer, most-frequent payer — instant visibility into  
> where the group budget actually went."*

Click **Nudge** on any settle-up card → select **Playful** tone → **Copy Message**:

> *"One click. Copyable. Low-awkwardness. Paste it into WhatsApp — your friend pays,  
> no spreadsheet guilt trip required."*

---

## ⏱ 02:30 – 03:00 | Wrap & Differentiators (30 sec)

> *"To recap what you've seen:*  
> *✅ Integer-cent arithmetic — zero rounding drift, ever.*  
> *✅ Minimum payments — greedy ≤ N−1 transfers, proven.*  
> *✅ Three split modes — equal, subset, custom — all validated.*  
> *✅ Spending insights — category bars, highest/most-frequent payer.*  
> *✅ Nudge generator — three tones, one-click clipboard copy.*  
> *✅ 10-second expense entry with live validation.*  
>  
> *RED: the post-trip money conversation, solved."*

---

## 🎯 Gate Checklist (run before demo)

- [ ] FastAPI running: `http://localhost:8000/health` → `{"status":"ok"}`
- [ ] Frontend running: `http://localhost:3000` loads with 5 synthetic trips
- [ ] 4-person gate trip from `test_api.py` confirmed passing (`python tests/run_all_tests.py`)
- [ ] Browser DevTools → Network tab → no 4xx/5xx errors during expense add
- [ ] Mobile view at 375px: Bento cards stack cleanly, Amber CTAs visible above fold
