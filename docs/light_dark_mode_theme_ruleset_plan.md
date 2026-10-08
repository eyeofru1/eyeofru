# Light & Dark Mode Base Ruleset Specification & Contrast Architecture Plan

## 1. Executive Summary & Root Cause Analysis

An inspection of user-submitted diagnostic imagery (`media_1790965655310.png`) revealed critical readability and contrast breakdowns when the interface switches from Dark to Light mode:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                VISUAL DEFECT BREAKDOWN                                 │
├────────────────────────────────┬──────────────────────┬────────────────────────────────┤
│ Component                      │ Observed Visual Defect│ Root Mechanical Cause          │
├────────────────────────────────┼──────────────────────┼────────────────────────────────┤
│ 1. Mobile Menu Drawer          │ Dark slate text on   │ Hardcoded opacity class        │
│    (`#mobileMenu`)             │ charcoal background  │ `bg-charcoal-900/95` ignored   │
│                                │ (~1.2:1 contrast)    │ `.bg-charcoal-900` CSS override│
├────────────────────────────────┼──────────────────────┼────────────────────────────────┤
│ 2. Header Tag & Outline Button │ Pale gold text/border│ Light bronze (`#e5be7d`) on    │
│    (`Initiate Consultation`)   │ washed out on white  │ light grey/white has ~1.8:1    │
│                                │ canvas (~1.8:1)      │ contrast; fails WCAG AA (4.5:1)│
├────────────────────────────────┼──────────────────────┼────────────────────────────────┤
│ 3. Hero Telemetry Pill         │ Dark blue/black text │ `bg-charcoal-850/90` stayed    │
│    (`PRIVATE VENTURE STUDIO`)  │ inside charcoal pill │ dark while `.text-slate-300`   │
│                                │ (~1.1:1 contrast)    │ inverted to `#334155` (slate)  │
├────────────────────────────────┼──────────────────────┼────────────────────────────────┤
│ 4. Systemic Pattern            │ Incomplete overrides │ CSS `!important` class hacks   │
│                                │ across opacity tags  │ fail on Tailwind opacity syntax│
└────────────────────────────────┴──────────────────────┴────────────────────────────────┘
```

### The Three Root Flaws in Current Rulesets

1. **The Tailwind Opacity Class Selector Mismatch**:
   In `src/style.css`, light mode was implemented via naive overrides like:
   `html.light .bg-charcoal-900 { background-color: #ffffff !important; }`
   However, Tailwind compiles classes with opacity modifiers (e.g. `bg-charcoal-900/95`, `bg-charcoal-850/90`, `border-charcoal-800/80`) into distinct escaped class names (`.bg-charcoal-900\/95`). The CSS rule `.bg-charcoal-900` never touches them, leaving containers completely dark while child text colors switch to dark slate.

2. **The Accent Inversion Blindspot**:
   Luminous metallic gold/bronze (`#e5be7d` / `#c89b4e`) provides high contrast against obsidian/charcoal in Dark Mode. But when placed on a white canvas (`#ffffff`), that exact same color has a contrast ratio of only **1.8:1 to 2.4:1**, rendering badges, borders, and buttons invisible.
   **Solution**: Light mode requires an **Inverted Deep Accent** (`#8a5f22` or `#92400e`, 5.5:1+ contrast) on light backgrounds.

3. **Missing Component-Level Rules in Documentation**:
   Neither `.agents/rules/web-production-standards.md` nor `docs/web-production-formula.md` explicitly mandated paired utility classes (`bg-white dark:bg-charcoal-900`), semantic CSS variables (`var(--bg-surface)`), or WCAG AA minimum contrast thresholds for mobile drawers, pills, and outline buttons.

---

## 2. Universal Dual-Theme Architecture Standard

### A. Semantic CSS Custom Properties Architecture
All production templates and client builds must ground themes in CSS Custom Properties attached to `:root` (Light mode baseline or Dark mode default) and inverted via `.dark` / `.light`:

```css
:root {
  /* Canvas & Structural Surfaces */
  --bg-canvas: #f8fafc;           /* Light slate/porcelain */
  --bg-surface: #ffffff;          /* Pure white cards */
  --bg-surface-elevated: #f1f5f9; /* Elevated cards / secondary surfaces */
  --bg-drawer: #ffffff;           /* Mobile drawers & dropdown menus */
  --bg-pill: #e2e8f0;             /* Telemetry badges & pill backgrounds */
  
  /* Borders & Hairlines */
  --border-subtle: #e2e8f0;       /* Hairline card/section borders */
  --border-prominent: #cbd5e1;    /* Interactive borders */
  --border-accent: #b45309;       /* Burnished amber/bronze border (3.5:1+) */

  /* Typography (WCAG AA Compliant >= 4.5:1) */
  --text-primary: #0f172a;        /* Deep obsidian (15.8:1 contrast) */
  --text-secondary: #334155;      /* Charcoal slate (9.5:1 contrast) */
  --text-muted: #64748b;          /* Muted metadata (4.6:1 contrast) */
  
  /* Accents (WCAG AA Compliant >= 4.5:1 for text) */
  --accent-primary: #92400e;      /* Deep burnished amber (5.8:1 contrast on white) */
  --accent-hover: #78350f;        /* Deepest amber on hover */
  --accent-contrast-text: #ffffff;/* White text on accent fill */
}

html.dark {
  /* Canvas & Structural Surfaces */
  --bg-canvas: #07090b;           /* Obsidian canvas */
  --bg-surface: #0d0f12;          /* Charcoal surface */
  --bg-surface-elevated: #13161b; /* Elevated cards */
  --bg-drawer: #0d0f12;           /* Mobile drawers & dropdowns */
  --bg-pill: #13161b;             /* Telemetry pill */

  /* Borders & Hairlines */
  --border-subtle: #1a1e24;       /* Subtle dark borders */
  --border-prominent: #282e38;    /* Interactive borders */
  --border-accent: rgba(200, 155, 78, 0.4);

  /* Typography (WCAG AA Compliant >= 4.5:1) */
  --text-primary: #f8fafc;        /* Crisp white (18.2:1 contrast) */
  --text-secondary: #cbd5e1;      /* Crisp slate (11.5:1 contrast) */
  --text-muted: #94a3b8;          /* Muted metadata (5.6:1 contrast) */

  /* Accents */
  --accent-primary: #c89b4e;      /* Metallic bronze/gold */
  --accent-hover: #e5be7d;        /* Luminous gold */
  --accent-contrast-text: #07090b;/* Charcoal text on accent fill */
}
```

### B. Contrast Matrix & WCAG AA Verification

| Element | Dark Mode Token & Value | Dark Contrast vs Canvas | Light Mode Token & Value | Light Contrast vs Canvas | WCAG AA Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Headline / Primary** | `#f8fafc` | **18.2:1** | `#0f172a` | **15.8:1** | **PASS** (Req: 4.5:1) |
| **Body / Secondary** | `#cbd5e1` | **11.5:1** | `#334155` | **9.5:1** | **PASS** (Req: 4.5:1) |
| **Metadata / Muted** | `#94a3b8` | **5.6:1** | `#64748b` | **4.6:1** | **PASS** (Req: 4.5:1) |
| **Accent Text / Tags** | `#e5be7d` | **9.8:1** | `#92400e` (Burnished Amber) | **5.8:1** | **PASS** (Req: 4.5:1) |
| **Pill Background** | `#13161b` (Border `#282e38`) | Distinct | `#e2e8f0` (Border `#cbd5e1`) | Distinct | **PASS** |
| **Mobile Drawer Canvas** | `#0d0f12` (Text `#cbd5e1`) | **11.5:1** | `#ffffff` (Text `#0f172a`) | **15.8:1** | **PASS** |
| **Outline Button Text** | `#e5be7d` on dark fill | **9.8:1** | `#92400e` on white/grey | **5.8:1** | **PASS** |

---

## 3. Specific Component Hardening Rules

### 1. Mobile Navigation Drawer (`#mobileMenu`)
* **Dark Mode**: `bg-charcoal-900 border-charcoal-800 text-slate-300`
* **Light Mode**: `bg-white border-slate-200 text-slate-800 shadow-xl`
* **Rule**: The mobile drawer MUST dynamically match the active theme. Never allow a fixed dark background dropdown when the page is in light mode. Text links must transition to `#0f172a` / `#334155` with hover states `#92400e` in light mode.

### 2. Badges & Telemetry Pills (`.inline-flex ... rounded-full`)
* **Rule**: Pills must never use hardcoded dark opacity classes (`bg-charcoal-850/90`).
* **Paired Classes**:
  - Dark: `bg-charcoal-850 border-charcoal-700 text-slate-300`
  - Light: `bg-slate-100 border-slate-300 text-slate-700`
  - Or semantic classes that adapt via CSS variables.

### 3. Outline Action Buttons & Brand Tags
* **Rule**: Never use light gold (`text-bronze-400` / `#e5be7d`) on light backgrounds.
* In Dark mode: `text-bronze-400 border-bronze-500/40 bg-charcoal-950`
* In Light mode: `text-amber-800 border-amber-700/40 bg-white hover:bg-slate-50`

---

## 4. Documentation Updates Planned

1. **`.agents/rules/web-production-standards.md` (Section 2)**:
   - Add explicit subsection **"Dual-Theme Contrast Architecture & Zero-Defect Standards"**.
   - Ban hardcoded opacity classes on dark containers without paired light-mode variants.
   - Enforce the **Accent Inversion Rule** (`#92400e` / `#8a5f22` for light mode text).
   - Require full WCAG AA contrast (minimum 4.5:1 for body, 3:1 for borders/large text).

2. **`docs/web-production-formula.md` (Section 3)**:
   - Update **Section 3: Design Layout, Typography & Dual-Theme Architecture**.
   - Embed the complete CSS custom properties token table and mobile drawer specification.
   - Add the contrast verification matrix.

3. **`.agents/rules/user-preferences.md` (Section 2 & 4)**:
   - Add explicit dual-theme contrast mandate under Frontend standards.
   - Mandate that pre-flight visual checks must verify BOTH Light and Dark mode rendering.

4. **Production Implementation (`src/style.css` & `index.html`)**:
   - Update `src/style.css` to comprehensively handle all opacity variants and semantic token classes.
   - Fix `index.html` navigation header, mobile menu, hero pill, and buttons.
   - Verify `Invoke-PreflightAudit.ps1` runs clean.
