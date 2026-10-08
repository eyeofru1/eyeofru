# Pure Grid & Executive Minimalist Dashboard Plan

## Overview & Goals
Eliminate all cheap-looking emoji icons, excessive color pulling, and redundant views/tabs. Re-architect the dashboard into a **pure Grid card layout** with strict metric-driven scoring (1-10 Need of Services Rank, GBP Health Score, and Website 0-10 Score), and streamline the drawer with an intelligent **Outreach Tracker** that hides template clutter once a lead has been contacted.

---

## 1. Metric & Scoring Specification
Every lead card in the Grid displays strictly focused, action-oriented metrics:
- **Need Rank (1-10)**: Priority index indicating the urgency of outreach (10 = highest need of our services, 1 = lowest need).
  - Derived from: Missing website + poor map ranking + low reviews = 9 to 10; healthy site + top-3 map ranking = 1 to 3.
- **GBP Health Score (0-100)**:
  - Direct 0-100 score matching the audit engine (e.g., `89/100`).
  - Represents the comprehensive Google Business Profile & Map Pack ranking audit.
  - 80–100: Dominant local 3-pack profile / high opportunity.
  - 60–79: Moderate profile with ranking deficits.
  - Below 60: Poor/unoptimized profile.
- **Website Score (0-10)**:
  - **0**: Has **no website** (immediate turnkey website opportunity).
  - **1 - 3**: Severely outdated, broken tap-to-call, or no mobile responsiveness (full rebuild opportunity).
  - **4 - 7**: Functional but dated template, slow load speeds, or missing conversion hooks (facelift opportunity).
  - **8 - 10**: New, modern, updated functionality website.

*Color Rule*: Color is reserved strictly for score identification (e.g. Red for 0-3, Amber for 4-6, Green for 7-10). All other interface text and borders remain neutral monochrome (Executive slate/charcoal).

---

## 2. Layout & Toolbar Simplification
- **Grid Layout Only**:
  - Remove the `Rows | Grid | Kanban` toggle buttons and view options completely.
  - Cards render in a clean, responsive CSS Grid (1 column on mobile, 2 columns on tablet, 3-4 columns on desktop).
- **Icon Stripping**:
  - Eliminate all emoji icons (`⚡`, `💻`, `✉️`, `🚫`, `📊`, `📋`, `🔍`, `🔥`, `🚨`, `📞`, `💬`).
  - Search bar: Clean text field with placeholder `Filter leads...`.
  - Filter pills: Minimal text badges (`All (12)`, `Need 8+`, `No Website`, `Uncontacted`).
  - Stat counters: Clean muted numbers (`Total: 12`, `Need 8+: 8`, `No Site: 10`, `Uncontacted: 9`) without neon borders.

---

## 3. Grid Card Architecture
Each card in the grid is a focused, high-density tile:
```
┌────────────────────────────────────────────────────────┐
│ NEED 10/10                                             │
│ Orlando Air & Heat Heroes                              │
│ Orlando, FL • AC Repair                                │
├────────────────────────────────────────────────────────┤
│ GBP Health:     89 / 100                               │
│ Website Score:  0 / 10  (No Website)                   │
└────────────────────────────────────────────────────────┘
```
- Clicking any card opens the slide-up drawer.

---

## 4. Drawer & Outreach Tracker Redesign
Eliminate the 2-row duplicate button/tab confusion:

### Top Action Row (Minimal Text, Zero Icons)
- **`Site`**: Opens client's existing website in new tab (disabled/grayed out if Website Score is 0).
- **`Audit`**: Opens the live report (Live Report URL).
- **`Tracker`**: Quickly switches the drawer to the status tracking section.

### Section Tabs (Row 2)
1. **`Overview`** (Default first tab):
   - Full business contact info (Phone with tap-to-call link, address, Google Maps link).
   - GBP & Website score breakdown.
   - Technical gaps summary.
2. **`Matrix`**:
   - Rubric breakdown (Speed, Mobile Tap-to-Call, Booking Widget, Reviews).
3. **`Tracker`**:
   - **When Uncontacted**: Displays the minimal outreach link and SMS/Email copy with one-click copy buttons, alongside a **`Mark as Contacted`** button.
   - **When Contacted**: **Hides the copy templates and subject/body text**. Instead, cleanly displays:
     - Current Status: `Contacted` (with dropdown to change to `Follow-Up Needed`, `In Discussion`, `Won`, or `Lost`).
     - Outreach Date / Timestamp.
     - Notes field for logging call/email replies.

---

## Verification Plan
1. **Visual & Icon Audit**: Verify 0 non-score icons across header, cards, toolbar, and drawer.
2. **Grid Layout Check**: Confirm responsive grid rendering on both mobile viewport (375px) and desktop.
3. **Score Mapping Validation**: Confirm 0-10 Website Score properly identifies 0 for "No Site" and scale for existing sites.
4. **Outreach Tracker State**: Test marking a lead as contacted and verify the outreach copy vanishes and is replaced by status logging.
