# Eye Of Ru Enterprises — Web Production Formula & Operating Blueprint
**Stack**: Google Antigravity & AI Suite $\rightarrow$ GitHub CI/CD $\rightarrow$ Cloudflare Pages (Edge CDN)  
**Cloud Automation**: Google Apps Script managed via `@google/clasp` $\rightarrow$ Google Drive

---

## Executive Lifecycle Architecture

```mermaid
flowchart TD
    subgraph Intake["1. Multi-Modal Intake & Client Scaffolding"]
        A1["Path A: Brand Brief / Docs (Markdown / GDrive)"] --> INTAKE_PROC
        A2["Path B: Rebuild Scrape (Sitemap + 301 Map)"] --> INTAKE_PROC
        A3["Path C: GBP Scan (Places API New: Reviews, NAP, Hours)"] --> INTAKE_PROC
        THEME_CHOICE["Theme Preference: Dark (Default) vs Light vs Auto"] --> INTAKE_PROC
        INTAKE_PROC --> GDRIVE_INIT["Auto-Scaffold Client Google Drive Folder<br/>(clasp Webhook $\rightarrow$ 4 Isolated Subfolders + Lead Sheet)"]
        INTAKE_PROC --> AUDIT_PDF["Aura Diagnostic Engine (ADE)<br/>(Headless Chrome $\rightarrow$ Branded PDF Fix Table $\rightarrow$ Drive)"]
        INTAKE_PROC --> CORPUS["Unified Content Corpus (content/data.json + raw assets)"]
    end

    subgraph Prototyping["2. Design & Prototyping"]
        CORPUS --> STITCH["Google Stitch MCP Prototyping"]
        CORPUS --> LOGO_GEN["AI Brand Suite (Nano Banana / Imagen 3)"]
        STITCH --> TOKENS["Dual Design Tokens: Dark & Light Palettes"]
        LOGO_GEN --> TOKENS
        TOKENS --> SIGN_OFF["Copywriting & Policy Sign-Off (MANDATORY)"]
    end

    subgraph BuildPipeline["3. Modern Development & Edge CI/CD"]
        SIGN_OFF --> DEV["Local Antigravity Dev (Vite + Tailwind)"]
        DEV --> LEAD_SYS["Form Backend: Google Apps Script $\rightarrow$ Sheets"]
        DEV --> CONCIERGE["AI Concierge Client Dashboard"]
        DEV --> THEME_ENGINE["Device Scheme Detection & Prompted Switch Toast"]
        DEV --> SEO_BASE["Baseline Schema.org JSON-LD & Technical SEO"]
        DEV --> PREVIEWS["GitHub Pull Request $\rightarrow$ Cloudflare Preview URL"]
        PREVIEWS --> AUDIT["Audits: Chrome DevTools (LCP / A11y / Schema)"]
        AUDIT --> PROD["Cloudflare Pages Edge Production"]
    end

    subgraph RetainerAndHandoff["4. Concierge Retainer & Ownership Transfer"]
        PROD --> RETAINER["Managed Retainer (DNS + Domain + Hosting)"]
        CONCIERGE --> GSHEET["Client Change Queue (Google Sheet + Alert)"]
        GSHEET --> AGY_MERGE["Agency Review & Merge via Antigravity"]
        RETAINER -.->|"Client Takeover Request"| HANDOFF["Zero-Downtime Ownership Handoff"]
    end
```

---

## 1. Multi-Modal Data Retrieval & Client Drive Scaffolding

Every project begins with automated data extraction and isolated Google Drive provisioning before any frontend code is authored.

### A. Isolated Client Google Drive Architecture
Every client project is provisioned its own dedicated folder tree in Google Drive via our `clasp`-managed webhook (`gas-drive-ingestion/Code.js`):

```text
My Drive/
└── Eye Of Ru Enterprises/
    └── Clients/
        └── [Client Business Name]/
            ├── 01_Audits & Proposals/
            │   └── [Date]_[Domain]_Audit_Report.pdf
            ├── 02_Brand Assets & Media/
            │   ├── Logos (Master Cyber Emblem & Vector Monogram)
            │   ├── Storefront / Project Photos
            │   └── OpenGraph 1200x630px Social Cards
            ├── 03_Data & Lead Sheets/
            │   └── [Client Name] — Operational Data & Leads (Tabs: Leads, Staging_Queue)
            └── 04_Production Handoff/
                ├── 301_redirects.csv
                └── Domain & Cloudflare Transfer Checklist
```

### B. Intake Channels
* **Path A: Brand Brief / Document Import**: Ingests value proposition, NAP, testimonials, team bios, and services into `content/data.json`.
* **Path B: Existing Site Scrape & 1:1 301 Redirect Mapping (Rebuilds)**:
  * Crawls existing sitemap and builds Cloudflare `_redirects` file to preserve search rankings.
  * Ingests page copy, headings, and high-res media.
* **Path C: No Website / Google Business Profile (GBP) Scan**:
  * Queries Google Places API (New) via `GOOGLE_MAPS_API_KEY` to extract verified NAP, operating hours, top 5-star customer reviews, storefront photos, and auto-generates `schema.org/LocalBusiness` JSON-LD.

### C. Intake Theme Questionnaire
During onboarding, every client brief captures their fundamental brand aesthetic:
* **Default Theme Preference**:
  1. **Dark Theme (Studio Standard)**: Luxury obsidian/slate (`#07090b`), high-contrast metallic bronze/gold accents.
  2. **Light Theme**: Warm porcelain/clean white, obsidian typography, bronze/accent highlights.
  3. **Auto / Adaptive**: Matches visitor's operating system setting on first visit.
* **Device Prompt Toggle**: Enable/disable the intelligent **Device-Match Switcher Toast**.

### D. Approved Structural Archetypes
During intake, choose the structural archetype matching client scope:
* **Archetype A: Multi-Page Application (MPA)**:
  - Separate static pages (`/index.html`, `/about.html`, `/services.html`, `/contact.html`, `/privacy.html`).
  - Best for large editorial sites, high-SKU services, or multi-location businesses with distinct keyword landing pages.
  - Requires `rollupOptions.input` multi-page entries in `vite.config.js`.
* **Archetype B: Single-Page Anchor Narrative + Modals (Studio Standard)**:
  - Unified, high-density landing narrative (`/#philosophy`, `/#ventures`, `/#capabilities`, `/#inquiry`) with full-screen interactive modal dialogs for deep content, plus dedicated sub-pages (`/concierge.html`, `/privacy.html`).
  - Best for high-converting local service businesses, studios, and fast MVP rebuilds.
  - Strict 301 redirects map legacy URLs to hash sections (e.g. `/services` $\rightarrow$ `/#services`).

---

## 2. The Aura Diagnostic Engine (ADE) & Branded PDF Generator

When auditing a client website (for a pitch or rebuild baseline), the engine scans the URL across the **5-Pillar Friction Framework**:
1. **Speed & Core Web Vitals (FCP, LCP, TBT, CLS)** + Bounce Cost Calculator.
2. **Asset & Media Bloat**: Oversized PNGs/JPEGs, missing `alt` tags, missing image dimensions.
3. **Third-Party Script Drag**: Chatbot lag, un-deferred tracking pixels, render-blocking web fonts.
4. **UX & Spatial Typography**: Contrast ratios (< 4.5:1), font sizes < 14px on mobile, tap target cramping.
5. **Local SEO & Schema Gaps**: Missing `LocalBusiness` JSON-LD, missing OpenGraph cards, broken canonicals.

### Deliverables:
* **The Executive Fix Table**: Translates technical errors into direct revenue impacts and our modern fixes.
* **Print-Ready Branded PDF**:
  * Compiled headlessly via local Chrome (`--headless=new --print-to-pdf --no-pdf-header-footer`) in < 1.5s.
  * Branded with the official **Eye Of Ru Cyber-Sovereignty Emblem** (`assets/logo.jpg`), metallic bronze accents, and corporate disclosures.
  * Automatically pushed to the client's `01_Audits & Proposals/` Google Drive folder via our `clasp` webhook endpoint.

---

## 3. Design Layout, Typography & Dual-Theme Architecture

### A. Dual Token Palette Architecture
* **Dark Theme Tokens (Standard Default)**:
  * Canvas: `#07090b` (Deep obsidian).
  * Card Surfaces: `#0d0f12` or `#14181e` with `#1c222b` elevated borders.
  * Accents: Metallic bronze (`#c89b4e`), champagne gold, or brand primary.
  * Text: White (`#ffffff`) headlines, slate (`#e2e8f0` / `#94a3b8`) body.
* **Light Theme Tokens**:
  * Canvas: `#f8fafc` (Warm porcelain) or `#ffffff`.
  * Card Surfaces: `#ffffff` with subtle slate borders (`#e2e8f0`) and elevation shadows.
  * Accents: Deep burnished bronze (`#ad7e35`) or rich brand hue.
  * Text: Deep obsidian (`#0f172a`) headlines, charcoal (`#334155`) body.

### B. Device Detection & Prompted Switch Pop-Up Engine
* **Zero FOUC**: An inline script in `<head>` immediately sets the `html` class (`dark` or `light`) based on `localStorage` before the DOM renders.
* **Prompted Switch Toast**: If the visitor's device OS setting (`prefers-color-scheme`) differs from the site default, a discreet floating toast appears in the bottom right corner:
  > *"We noticed your device is set to Light Mode. Would you like to switch to Light Theme?"*
  > `[ Switch to Light ]` `[ Keep Dark ]`
* **Manual Toggle**: Accessible Sun/Moon toggle in the navigation bar and footer.

---

## 4. Non-Negotiable Schema & Technical SEO Standards (Every Site & Page)

Every single site and page engineered by Eye Of Ru Enterprises adheres to strict baseline SEO rules:

1. **Page-Specific Schema.org JSON-LD (`@graph`)**:
   * **Home (`/`)**: `schema.org/LocalBusiness` (or `ProfessionalService`) + `WebSite` graph with verified NAP, logo, geo-coordinates, and `sameAs` authority links.
   * **About (`/about`)**: `schema.org/AboutPage` linked back to the parent organization, founders, and credentials.
   * **Services (`/services`)**: `schema.org/OfferCatalog` & `Service` schema defining specific service deliverables and pricing tiers.
   * **Contact (`/contact`)**: `schema.org/ContactPage` with exact operating hours, telephone, contact email, and interactive map coordinates.
   * **FAQ Sections**: `schema.org/FAQPage` structured data for expandable rich snippets.
2. **Complete `<head>` Meta Protocol**:
   * Unique Canonical URL: `<link rel="canonical" href="...">`.
   * Title formula: `[Primary Service] in [Location] | [Brand Name]` (50–60 chars).
   * Active Meta Description: 145–158 chars with CTA and phone/location.
   * OpenGraph + Twitter Cards with high-contrast 1200x630px preview image.
3. **Asset & Semantic Attributes**:
   * Single `<h1>` per page; ordered `<h2>` and `<h3>` tags with zero skipped levels.
   * Descriptive, hyphenated image filenames; meaningful contextual `alt` attributes.
   * Explicit `width` and `height` dimensions on all images (Zero CLS).
   * Hero image `fetchpriority="high"`; below-the-fold assets `loading="lazy"`.
4. **Crawl Infrastructure**: Root `robots.txt` and canonical `sitemap.xml` with `<lastmod>` timestamps.

---

## 5. Scope Matrix: Standard Pages vs. Billable Add-Ons

| Tier / Category | Deliverables Included | Scope Boundary & Specifications |
| :--- | :--- | :--- |
| **Standard Core Build**<br/>*(Foundational Package)* | **5 Standard Pages**:<br/>1. **Home / Landing Page**<br/>2. **About / Story / Company**<br/>3. **Core Services / Offerings**<br/>4. **Contact / Lead Capture**<br/>5. **Privacy Policy & Terms** | • Responsive mobile/desktop layout<br/>• Google Apps Script webhook to Google Sheets lead form<br/>• Cloudflare Turnstile spam protection<br/>• Dual Theme support (Dark/Light) + Prompted Switch Toast<br/>• Non-negotiable baseline Schema.org JSON-LD & full SEO tags<br/>• Core Web Vitals optimization (100 LCP / Accessibility)<br/>• Dual Analytics (Cloudflare Web Analytics default) |
| **Billable Add-On: AI Brand & Logo Suite** | • Primary Logo Lockup (Horizontal & Vertical, Dark & Light)<br/>• Monogram / Favicon vector badge<br/>• OpenGraph 1200x630px social card | Generated via **Nano Banana / Imagen 3** engine ($497 – $1,200 add-on). |
| **Billable Add-On: Dynamic Blog / Articles** | • Headless Git-backed Markdown collection (`/content/blog/`)<br/>• Tag filters, reading time, author bio, social sharing<br/>• Choice of publishing: AI Concierge, Decap CMS, or Retainer | $500 – $1,200 one-time setup (or $450 – $1,200/mo managed growth retainer). |
| **Billable Add-On: AI Concierge Client Dashboard** | • Embedded `/concierge` client portal / chatbot<br/>• Conversational update assistant powered by Gemini API<br/>• Staged changes queue to Agency Google Sheet | Monthly retainer or premium add-on for client self-service change requests. |
| **Billable Add-On: Advanced Functionality** | • Interactive cost estimators / calculators<br/>• Live booking / calendar synchronization<br/>• Client Portal / Password-protected member areas<br/>• Filterable / searchable product/service databases | Custom scoped serverless applications. |
| **Billable Add-On: E-Commerce & Payments** | • Stripe Checkout integration<br/>• Cart & mini-cart flyout<br/>• Product catalog (> 10 items) & inventory sync | Scoped by SKU count and fulfillment logic. |

---

## 6. Modern Tech Stack & Pipeline: Antigravity $\rightarrow$ GitHub $\rightarrow$ Cloudflare Pages

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Antigravity Agent / Engineer
    participant GH as GitHub Repository
    participant CF as Cloudflare Pages (Edge)
    participant GAS as Google Apps Script (Webhook)
    participant GS as Google Sheets (Leads/Queue)

    Dev->>GH: Push feature branch / Pull Request
    GH->>CF: Auto-deploy Preview Branch
    CF-->>Dev: Preview URL (e.g., branch.site.pages.dev)
    Dev->>Dev: Run Chrome DevTools A11y, LCP & Schema checks
    Dev->>GH: Merge PR into main branch
    GH->>CF: Trigger Production Build
    CF-->>User: Edge delivery (200 OK)
    User->>GAS: Submit Contact Form / AI Concierge Request
    GAS->>GS: Append Row to Client Sheet & Trigger Alert Email
```

### A. Lead Capture & Form Backend Architecture
* **Frontend**: Lightweight HTML form with **Cloudflare Turnstile** invisible CAPTCHA.
* **Serverless Backend**: Standardized **Google Apps Script Webhook** (No recurring third-party form fees like Formspree).
  * Automatically receives form payload via POST.
  * Writes the lead to a dedicated tab in the client's Google Sheet (`Leads`).
  * Triggers an immediate branded notification email to the client's inbox.
  * Provides instant ownership handoff: simply share/transfer the Google Sheet!

### B. Security, Edge Headers & Dual Analytics
* **Edge Headers (`_headers` file)**:
  * Strict Content-Security-Policy (CSP).
  * `X-Frame-Options: DENY`.
  * `X-Content-Type-Options: nosniff`.
  * `Referrer-Policy: strict-origin-when-cross-origin`.
  * `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
* **Dual Analytics Strategy**:
  * **Default**: Cloudflare Web Analytics (100% privacy-first, zero cookie consent banner, 0ms latency impact).
  * **Client Opt-In**: Google Tag Manager / GA4 container injected conditionally when conversion tracking or Google Ads attribution is required.

---

## 7. Domain Retainer & Zero-Downtime Client Ownership Transfer Protocol

To guarantee smooth operations under our managed retainer while ensuring seamless client handoffs without downtime:

1. **Managed Retainer Phase**:
   * Agency registers/manages domain and hosts DNS in Agency Cloudflare.
   * Client enjoys fully hands-off hosting, edge caching, and AI Concierge updates.
2. **Clean Ownership Handoff Protocol**:
   * **GitHub Transfer**: Transfer repository ownership directly to client's GitHub account.
   * **Cloudflare Pages**: Client creates a free Cloudflare account, connects the transferred repo, and verifies preview build.
   * **Domain & DNS Push**: Domain is pushed to client's registrar account (or Cloudflare Registrar) with existing nameservers/DNS records intact. Transition takes place at Cloudflare's edge with **zero downtime**.
   * **Asset & Lead Handoff**: Transfer ownership of the client's master Google Drive folder (`Eye Of Ru Enterprises / Clients / [Client Name]`), instantly handing off their leads, audits, and assets.

---

## 8. Strategic Roadmap: Custom Client CRM & Lead Dashboard (Lead Command Center)

```mermaid
flowchart LR
    A["Website Contact / Quote Form"] -->|"Apps Script Webhook"| B["Client Google Sheet (Leads)"]
    B <-->|"Two-Way Live Sync"| C["Custom Client CRM Dashboard<br/>(Lead Command Center)"]
    C --> D["Visual Kanban Pipeline<br/>(New $\rightarrow$ Contacted $\rightarrow$ Quoted $\rightarrow$ Closed)"]
    C --> E["1-Click Email & Call Triggers"]
    C --> F["Unified AI Concierge Drawer<br/>(Manage Leads + Request Site Updates)"]
```

### A. Architectural Vision
Transform the client's underlying Google Sheet (`Leads`) into a **modern, proprietary web CRM dashboard** (e.g. `/portal` or `portal.clientdomain.com`):
* **Live Two-Way Synchronization**: Reads incoming rows from their Google Sheet in real-time; updates status changes back to the sheet automatically.
* **Visual Kanban Pipeline**: Drag-and-drop cards across deal stages (`New Lead` $\rightarrow$ `Contacted` $\rightarrow$ `Estimate Sent` $\rightarrow$ `Won / Closed`).
* **1-Click Communications**: Quick-action buttons to launch phone calls, send pre-drafted quote confirmation emails, or send appointment SMS.
* **Unified Client Portal**: Houses both the **Lead Command Center** and the **AI Concierge**, giving business owners a single, branded dashboard to run customer inquiries and manage their website.

### B. Business & Retainer Monetization
* **Setup Tier**: Add-on product ($1,200 – $2,500 custom build fee).
* **Monthly Retainer Tier**: Replaces fragmented subscriptions like HubSpot/Jobber for local service businesses ($99 – $299/month recurring agency SaaS retainer).

---

## 9. Non-Negotiable Visual & Typography Standards: Clean Minimal Design, Button Icons & Zero Emojis

Eye Of Ru Enterprises enforces a strict enterprise aesthetic across all digital touchpoints:

1. **Clean Minimalist Design Philosophy**:
   - Always start with the cleanest, minimal approach and design until directed otherwise.
   - Let structure, high-contrast dark/light tokens, deliberate whitespace, and refined typography carry the brand dignity without unnecessary visual noise or clutter.
2. **Icons for Button Identification**:
   - Clean vector icons (SVGs) may be utilized for button identification and clear action affordance (e.g. search, menu drawer, close modal, theme toggle, external link chevrons).
   - Buttons must **never include additional decorative characters, emoji glyphs, or unprompted symbols** alongside them unless explicitly asked for.
3. **Absolute Prohibition on Emojis**:
   - Never add emojis to email subject lines, email templates, push notifications, UI buttons, toasts, headings, modal windows, or documentation.
   - Raw emojis cause RFC 2047 MIME encoding failures across email clients (rendering as diamond question mark boxes) and compromise executive credibility.
4. **Clean ASCII & Typographic Badges**:
   - Use clean, bracketed ASCII labels for statuses, alerts, and badges (e.g. `[NEW LEAD]`, `[SYSTEM MATCH]`, `[CRITICAL]`, `[HIGH]`, `[VERIFIED]`).


