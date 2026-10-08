# Unified Square Design & Mobile Responsiveness Plan

## Key Directives from User
1. **Eliminate Duplicate Top Row**: Remove the KPI bar (`TOTAL`, `NEED 8+`, `NO WEBSITE`, `UNCONTACTED`) as it duplicates the filter buttons directly underneath it. The filter buttons will directly display their live counts: `All (12)`, `Need 8+ (6)`, `No Website (2)`, `Uncontacted (9)`.
2. **Strict Square Geometry**: Replace all bubbly pill capsules (`border-radius: 9999px` / `pill`) with crisp, regular **square geometry** (`border-radius: 0px` or uniform micro `2px`) across all buttons, filter tabs, input fields, cards, badges, and modals.
3. **Unified, Distraction-Free CSS Templating**: Eliminate visual clutter, mismatched heights, and off-center elements. Ensure consistent typography, padding, and alignments.
4. **Flawless Mobile Responsiveness**: Solve the horizontal stretch/scroll bug and the crunched header.

---

## 1. Header & View Tabs Architecture
- **Desktop (≥ 768px)**:
  - Sleek, single-row 42px command bar.
  - Left: Brand mark + compact square project selector.
  - Right: Square view tabs (`[ Pipeline ]`, `[ Quick Sourcing ]`, `[ Markets ]`).
- **Mobile (< 768px)**:
  - **Row 1 (Top Bar - 38px)**: Left: Brand mark; Right: Square project selector.
  - **Row 2 (View Tabs - 36px)**: Full-width segmented tabs with equal 3-way distribution (`flex: 1` each) with crisp square styling.
  - Completely eliminates header crunching and text wrapping.

---

## 2. Toolbar & Single Filter Row (Removing Top Row Duplication)
- **Eliminate `#kpi-bar-mount`**:
  - Remove the separate KPI bar from `index.html` and `src/js/app.js`.
- **Enhanced Single Filter Strip**:
  - Integrate live count badges directly into the filter buttons:
    - `All (12)`
    - `Need 8+ (6)`
    - `No Website (2)`
    - `Uncontacted (9)`
  - On Mobile: Full-width search bar on row 1; square filter buttons on row 2 (horizontally scrollable without wrapping or breaking layout).
  - Clean square `Import` and `Export` actions.

---

## 3. Strict Square Design System (Tokens & CSS)
- **Tokens Update (`src/css/tokens.css`)**:
  - Set `--mg-radius-sm: 0px` (or `2px`), `--mg-radius-md: 0px`, `--mg-radius-lg: 0px`, `--mg-radius-full: 0px`.
  - Buttons, cards, inputs, dropdowns, and drawer sheets adopt crisp, modern square edges.
- **Card Alignment & Structure**:
  - `.pure-grid-card`: Square border, uniform padding, clean 2-row score breakdown:
    - Row 1: `GBP Health: 89 / 100`
    - Row 2: `Website Score: 0 / 10 (No Website)`
  - Zero rounded pills, sirens, or glowing drop-shadows.

---

## 4. Elimination of Horizontal Stretch & Scroll
- Replace all `width: 100vw` with `width: 100%` and `max-width: 100%`.
- Add `min-width: 0` to all flex containers and cards containing truncated text.
- Set `.pure-lead-grid`:
  - Mobile (< 640px): `grid-template-columns: 1fr;` (100% width, 0 overflow).
  - Tablet/Desktop (≥ 640px): `grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));`.
- Set `html, body, .app-container`: `width: 100%; max-width: 100%; overflow-x: hidden;`.

---

## 5. Verification Plan
1. Check `document.documentElement.scrollWidth === document.documentElement.clientWidth` across 360px, 375px, 414px, and 1280px viewports (confirming zero horizontal scroll).
2. Verify top duplicate button row is gone, and filter chips reflect live dynamic counts.
3. Audit all buttons, inputs, tabs, and cards to verify 100% uniform square geometry.
4. Verify drawer opens smoothly with square actions and no horizontal displacement.
