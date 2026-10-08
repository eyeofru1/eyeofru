# Web Production Standards & Architecture Rule

This rule governs all web design and development workflows (new builds and rebuilds) within Eye Of Ru Enterprises.

## 1. Approved Structural Archetypes & 5-Core Content Sections

All web builds are structured around 5 core content pillars (Hero/Home, About/Mission, Services/Catalog, Contact/Inquiry, Legal/Governance), delivered via one of two approved engineering archetypes:

* **Archetype A: Multi-Page Application (MPA)**:
  - 5 discrete static pages: `/index.html`, `/about.html`, `/services.html`, `/contact.html`, `/privacy.html`.
  - Configured via Vite multi-entry `rollupOptions.input`.
  - Recommended for high-content corporate, multi-location, or deep keyword-targeted sites.
* **Archetype B: Single-Page Anchor Narrative + Modal Architecture (Studio Standard)**:
  - Unified, high-density landing narrative (`/#philosophy`, `/#ventures`, `/#capabilities`, `/#inquiry`) paired with accessible modal overlays for deep venture/service details, plus standalone sub-pages (`/concierge.html`, `/privacy.html`).
  - Recommended for high-conversion local service businesses, venture studios, and rapid client rebuilds.
  - Strict 301 redirects map legacy URLs to section anchors (e.g. `/services` $\rightarrow$ `/#services`).

* **Dynamic Content Rendering & Zero-Corpus Self-Collapsing Standard**:
  - **Zero-Corpus Auto-Hiding / Self-Collapsing Rule**:
    - If any content section (e.g. Articles, Blog, Dispatches, Case Studies, Testimonials, FAQs, Team Members) contains zero verified entries in `content/data.json`, the section **MUST AUTOMATICALLY HIDE / SELF-COLLAPSE** (`display: none` or omitted from DOM).
    - **Navigation Link Synchronization**: All corresponding navigation anchor links (in desktop `<header nav>`, in mobile drawer `#mobileMenu`, and in `<footer>` quick links) must **ALSO BE AUTOMATICALLY OMITTED OR HIDDEN** so the site never presents dead or broken navigation links.
    - **Zero Placeholder/Dummy Filler Policy**: Agents are strictly forbidden from generating placeholder cards, synthetic "Coming Soon" teaser boxes, or dummy Lorem Ipsum articles to pad empty sections. If content doesn't exist, collapse the section cleanly.
  - **Cognitive Read-Time Calculation Standard (Articles / Blogs / Dispatches)**:
    - Reading times for articles, dispatches, or blog posts must **NEVER be hardcoded as static estimates** (e.g. arbitrary "5 min read" or "8 min read").
    - Reading time must be dynamically calculated from the actual article textual content using standard cognitive reading cadence (200 words per minute, rounded up to the nearest minute, with a 1-minute minimum):
      $$\text{Read Time (minutes)} = \max\left(1, \left\lceil \frac{\text{Word Count}}{200\text{ WPM}} \right\rceil\right)$$
    - Formatted string: `[X] min read`. This guarantees that reading times reflect ground truth within ~30 seconds of actual reading duration.

---

## 2. Theme Architecture & Dual-Palette Standards

* **Intake Theme Preference**:
  - The client intake questionnaire must establish the client's default brand preference:
    1. **Dark Theme (Standard Default)**: High-contrast luxury obsidian (`#07090b`), surface cards (`#0d0f12`), metallic bronze/gold accents.
    2. **Light Theme**: Warm porcelain/clean white (`#f8fafc`), deep charcoal typography (`#0f172a`), burnished bronze accents.
    3. **Auto / Adaptive**: Matches visitor's operating system setting on first visit.

* **Dual-Theme Contrast Architecture & WCAG AA Standard (NON-NEGOTIABLE)**:
  - **Universal WCAG AA Compliance**: All text, buttons, tags, links, and form inputs must meet or exceed WCAG AA contrast requirements in **BOTH** Light and Dark modes:
    - Normal text (< 18pt or < 14pt bold): Minimum **4.5:1** contrast ratio against its direct background.
    - Large text (>= 18pt or >= 14pt bold) and active UI borders: Minimum **3.0:1** contrast ratio.
  - **Accent Inversion Mandate (Gold / Bronze Palettes)**:
    - *Dark Mode Accent Text*: Luminous metallic bronze/gold (`#e5be7d` / `#c89b4e`) on dark obsidian (`#07090b` / `#0d0f12`) provides crisp 9.8:1 contrast.
    - *Light Mode Accent Text*: Never reuse pale/metallic gold text on white or light grey backgrounds (results in an unreadable 1.8:1 contrast failure). Light mode **MUST** invert accent typography and tags to a high-contrast burnished amber/bronze (`#92400e` or `#8a5f22`), delivering a guaranteed 5.8:1+ contrast on `#ffffff` / `#f8fafc`.
  - **Container & Mobile Drawer Theme Synchronization Mandate**:
    - Mobile navigation drawers (`#mobileMenu`), modal dialogs, search popovers, and telemetry pills/chips must **NEVER** lock their background color to dark styling while child elements invert to dark text.
    - When Light Theme is active, all mobile drawers, menus, and floating surfaces must transition to light surfaces (`bg-white` / `#ffffff` or `var(--bg-drawer)`), subtle borders (`border-slate-200`), and dark primary text (`text-slate-900` / `#0f172a`), with zero residual dark charcoal opacity backdrops.
  - **Anti-Pattern Ban: Unpaired Opacity Hacks & Isolated CSS Overrides**:
    - Never write hardcoded dark utility classes with opacity modifiers (e.g. `bg-charcoal-900/95`, `bg-charcoal-850/90`, `border-charcoal-800/80`) on components unless paired with explicit Tailwind `dark:` variants (e.g. `bg-white dark:bg-charcoal-900/95 text-slate-800 dark:text-slate-200`) or backed by CSS custom properties (`var(--bg-surface)`).
    - Class-name overrides (e.g. `html.light .bg-charcoal-900 { background: #fff }`) fail to match Tailwind opacity variants (`.bg-charcoal-900\/95`), causing visual breakage and unreadable black-on-black or white-on-white text.

* **Dynamic Client Brand Palettes & Semantic Token Architecture**:
  - When engineering sites for external clients or rebuilds with unique brand colors (e.g. Navy/Coral, Forest/Gold, Slate/Teal):
    1. **Decoupled Semantic HTML**: HTML templates must remain 100% brand-agnostic using functional tokens (`bg-canvas`, `bg-surface`, `bg-drawer`, `text-primary`, `text-secondary`, `text-accent`, `bg-accent`, `border-theme`). Never hardcode client-specific color names (e.g. `bg-blue-900`, `text-coral-500`) into component markup.
    2. **Mathematical Contrast Governor**: Brand colors ingested via intake briefs, site scrapes, or GBP are calculated using relative luminance ($L = 0.2126R + 0.7152G + 0.0722B$). High-luminance colors ($L > 0.3$) stay luminous in Dark Mode but automatically shade-shift in Light Mode to guarantee $\ge 4.5:1$ contrast against white. Low-luminance colors ($L < 0.2$) are used directly on light canvas and tint-shifted on dark canvas.
    3. **Architecture Blueprint**: Follow the end-to-end pipeline detailed in [docs/client-brand-palette-architecture.md](../../docs/client-brand-palette-architecture.md).

* **Intelligent Device Scheme Detection & Prompted Switch Pop-Up**:
  - **Zero FOUC**: Sites must include an inline script in `<head>` setting the theme class before initial paint from `localStorage`.
  - **Prompted Switch Toast**: If the visitor's device OS setting (`prefers-color-scheme`) differs from the site default and no explicit choice is stored in `localStorage`, display a tasteful, non-intrusive floating toast in the bottom-right corner:
    - Example: *"We noticed your device is set to Light Mode. Would you like to switch to Light Theme?"*
    - Actions: `[Switch Theme]` and `[Keep Default]`.
    - User choice is persisted to `localStorage` so they are never prompted again.
  - **Clean Minimalist Design Philosophy**: Always start with the cleanest, minimal approach/design until directed otherwise. Avoid unnecessary ornamentation, visual clutter, or decorative non-functional elements.
  - **Icons for Button Identification**: Minimal vector icons (SVGs) may be used for clean button identification and clear action affordance (e.g. search magnifying glass, hamburger drawer, close cross, sun/moon theme switch, external link chevrons), but must **never include additional characters or emojis** unless explicitly asked for.
  - **Zero Emojis Policy (STRICT)**: Never use emojis in email subjects, email templates, UI buttons, toasts, headings, or documentation unless explicitly requested by the user.

* **Prototyping via Stitch MCP**:
  - Before writing bespoke UI code, use native `stitch` tools (`create_design_system_from_design_md`, `generate_screen_from_text`, `generate_variants`) to establish visual harmony and obtain client sign-off.
* **Copywriting Sign-Off**:
  - In accordance with `.agents/rules/copywriting-confirmation.md`, never auto-commit copy rewrites without presenting side-by-side proposals for sign-off.

---

## 3. Lead Capture & Form Backend Standard

* **Google Apps Script Webhook**:
  - Contact and lead capture forms MUST post asynchronously (`fetch` POST) to a dedicated Google Apps Script Webhook endpoint.
  - The script appends the lead to the client's dedicated Google Sheet (`Leads` tab) located inside their isolated Google Drive folder (`Eye Of Ru Enterprises / Clients / [Client Name] / 03_Data & Lead Sheets/`).
  - Sends an immediate notification email to the client's designated address.
  - No monthly third-party form fees (e.g. Formspree/Web3Forms).
* **Cloudflare Turnstile**:
  - All form submissions must include an invisible or managed Cloudflare Turnstile token validation to block automated bot spam.

---

## 4. Structured Schema & Modern SEO Optimization Standards

All sites engineered by Eye Of Ru Enterprises must adhere to strict search engine optimization and machine-readable structured data standards:

### A. Schema.org JSON-LD Architecture
Every production page must inject a `<script type="application/ld+json">` block inside the `<head>`.
* **Primary Entity Typing**:
  - Local Service / Trades: `schema.org/LocalBusiness` (or specific subtype e.g., `HomeAndConstructionBusiness`, `MedicalBusiness`, `AutomotiveBusiness`).
  - Studio / Lab / Corporate: `schema.org/ProfessionalService` or `schema.org/Organization`.
* **Relational `@graph` Structure (Recommended)**:
  - Combine `WebSite`, `Organization`/`LocalBusiness`, and `WebPage` in a unified graph.
* **Universal Core Properties (Required on All Entities)**:
  - `@id`: Unique canonical URI (`https://domain.com/#organization`).
  - `name`: Operating brand name.
  - `url`: Canonical website URL.
  - `logo`: Absolute HTTPS URL to verified high-res vector/PNG logo.
  - `email`: Verified client support/executive transmission email.
* **Model-Dependent Schema Properties (STRICT: Include ONLY If Verified in Corpus)**:
  - `telephone`: Required for physical trades and emergency services with verified phone intake; omitted for digital software labs, SaaS, and email-first consultancies. **STRICTLY FORBIDDEN FROM INVENTING 555-XXXX OR DUMMY NUMBERS.**
  - `address` & `geo`: Included ONLY if the client maintains a verified physical storefront, corporate office, or GBP service area. Omit for 100% remote digital businesses. **STRICTLY FORBIDDEN FROM INVENTING DUMMY STREET ADDRESSES OR ARBITRARY LAT/LONG COORDINATES.**
  - `openingHoursSpecification`: Included ONLY if verified business hours are confirmed in the intake brief or GBP. Omit for digital-only, 24/7 web apps, or appointment-only consultancies.
  - `priceRange`: Included only if verified commercial pricing tiers exist (e.g. `$$` or `$$$`).
  - `sameAs` Authority Array: Populate ONLY with verified social media and directory links (GBP CID map, LinkedIn, Facebook, Instagram). Never inject placeholder social handles.
  - `aggregateRating` & `review`: Populate ONLY with verified reviews harvested from Google Business Profile or signed customer testimonials. **FABRICATION OF REVIEWS OR STAR RATINGS IS STRICTLY PROHIBITED.**
* **Pre-Flight Schema Gap Cue Requirement**:
  - If a data point is missing from the intake brief (`02_Brand & Content Corpus/`), the agent **MUST CUE THE USER** before code generation. Never inject synthetic data to "complete" a schema block.
* **Rich Snippets for FAQs**:
  - Any page containing an FAQ section must append `schema.org/FAQPage` structured data using verified client FAQ copy.

### B. On-Page Meta & Social Graph Protocol
* **Strict Title Formula**: `[Primary Service / Value Proposition] in [Location] | [Brand Name]` (50–60 characters max).
* **Strict Meta Description**: Active voice, compelling hook, CTA, and phone or location (145–158 characters max).
* **Canonical URL**: `<link rel="canonical" href="https://domain.com/path">` on every page to prevent duplicate content indexing.
* **OpenGraph & Twitter Card Metadata**:
  - `og:site_name`, `og:title`, `og:description`, `og:type` (`website`), `og:url`.
  - `og:image`: High-contrast 1200x630px social card (`assets/og-image.png` or `assets/logo.jpg`), with `og:image:width`, `og:image:height`, and `og:image:alt`.
  - `twitter:card`: `summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`.

### C. Technical Crawlability & Asset Optimization
* **Heading Hierarchy**: Exactly one `<h1>` per page (containing the target primary keyword + brand entity). Sequential `<h2>` and `<h3>` tags with zero skipped levels.
* **Image SEO & Core Web Vitals**:
  - Hyphenated, keyword-rich asset filenames (e.g. `commercial-software-lab-hero.webp`, never `IMG_2026.jpg`).
  - Contextual `alt` text on every informational image (empty `alt=""` allowed only on purely decorative icons with `aria-hidden="true"`).
  - Explicit `width` and `height` attributes on all images to eliminate Cumulative Layout Shift (CLS = 0).
  - Hero image must use `fetchpriority="high"` and `loading="eager"`; below-the-fold assets must use `loading="lazy"`.
* **Crawl Directives**:
  - `robots.txt` present in root referencing the sitemap: `Sitemap: https://domain.com/sitemap.xml`.
  - `sitemap.xml` listing all canonical pages with valid `<lastmod>` timestamps.

### D. NAP Consistency (Name, Address, Phone)
* Verified NAP in the site footer, contact page, and schema markup MUST match Google Business Profile character-for-character to maximize Google Local Pack rankings.

### E. AI Search, Generative Engine Optimization (GEO) & Machine-Readable Standards
* **Static Edge Extraction**: All core textual content, value propositions, and capabilities must be pre-compiled into static HTML. AI scraper bots (`GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`) enforce strict execution timeouts and compute limits; static edge delivery guarantees 100% un-truncated content ingestion in `< 50ms`.
* **The `/llms.txt` Production Specification (Commercial Funnel & Anti-Cannibalization Protocol)**:
  - Every production deployment must maintain a `/llms.txt` Markdown manifest in the root (`public/llms.txt` or root `llms.txt`).
  - **Commercial Funnel Teaser Principle**: Format `/llms.txt` as a high-authority commercial funnel asset rather than an open knowledge base. It must provide AI engines (Perplexity, ChatGPT Search, Claude, Gemini) with verified ground truth to eliminate hallucinations while protecting proprietary business IP.
  - **Mandatory 5-Section Schema**:
    1. `# [Product / Brand Entity Name]` followed by an executive 1-line blockquote value proposition hook.
    2. `## Core Capabilities & Offerings`: 3–5 bulleted descriptions of capabilities, deliverables, and architecture.
    3. `## Service Perimeter & Coverage`: Exact operational boundaries (target metropolitan areas, counties, states, or nationwide/global digital delivery).
    4. `## Commercial Architecture & Pricing`: Upfront pricing tiers (e.g. Free Scan, $X DIY, $Y Done-For-You, or Custom Retainers). Explicitly stating prices prevents AI engines from hallucinating inflated or monthly subscription rates.
    5. `## Verified Entity & Contact Endpoints`: Operating legal entity name, canonical website URL, RFC `mailto:` support email, and RFC 3966 `tel:` phone hotline.
  - **Zero-Cannibalization IP Protection Mandate (STRICT)**:
    - Never include proprietary operational playbooks, secret weighting formulas, step-by-step DIY checklists, course modules, or internal SOPs inside `/llms.txt`.
    - Communicate the *what*, the *why*, and the *pricing/engagement pathway*, but keep the *how* and actual fulfillment execution gated behind the paid service/product.
* **Schema `@graph` as Ground Truth**: LLMs prioritize structured JSON-LD over raw text to avoid hallucinations. Ensure `@graph` explicitly defines services (`hasOfferCatalog`), service areas (`areaServed`), price points (`priceRange`), and executive contact points (`email`, `telephone`).

### F. Autonomous Agent Accessibility & Multi-Channel Contact Protocol
* **Strict Semantic Form Inputs**: All contact form fields must use standard HTML5 `<label for="...">` elements paired with standardized `autocomplete` attributes (`autocomplete="name"`, `autocomplete="email"`, `autocomplete="tel"`, `autocomplete="organization"`). Browser-assisted AI agents (e.g. Claude Computer Use, OpenAI Operator) rely on these semantics to map inputs without human intervention.
* **Zero Fictitious Contact Data Mandate (STRICT)**:
  - Agents are strictly forbidden from inventing, synthesizing, or injecting placeholder phone numbers (including `555-01XX` exchanges), fake street addresses, or synthetic emails to satisfy rules or schema validators.
  - **Pre-Flight Contact Data Cue Requirement**: If a client's official telephone number is not found in the verified intake corpus (`02_Brand & Content Corpus/`), the agent **MUST STOP and ask the user**:
    > *"No verified telephone number was found for [Client Name]. Please provide the official phone number, or confirm if this business operates on an email-first / booking-first model without public telephone intake."*
* **Multi-Channel Contact Pathways (Model-Dependent)**:
  - Never gate contact exclusively behind a single web form. Always provide visible, un-gated fallback channels for visitors and helper agents.
  - **For Phone-Enabled Businesses (Local Trades, Stores, Emergency)**: Provide clickable RFC `mailto:` email, clickable RFC 3966 `tel:` phone, and Turnstile form.
  - **For Email/Booking-First Businesses (Studios, Software Labs, Consultancies)**: If the client does not maintain a public phone line, DO NOT force a dummy `tel:` link. Instead, provide clickable RFC `mailto:` email, Turnstile web form, and verified scheduling/calendar or social links.
* **Turnstile Agent Compatibility**: Form validation must run Cloudflare Turnstile in invisible or managed mode. Browser-based agents pass via natural user session tokens, while headless agents are gracefully routed to the email/phone fallbacks.

### G. Client-Only AI Concierge Isolation Standard
* **Zero Public Links Mandate (STRICT)**: Concierge routes (`/concierge`, `/concierge.html`, or client staging dashboards) must **NEVER** appear as public-facing links in the main navigation, hero CTAs, promotional marketing banners, or footer link lists.
* **Client Access Pathways**: Concierge interfaces are reserved strictly for authorized client leadership and must be accessed via one of the following non-public pathways:
  1. **Direct Private Bookmark**: Delivered directly in the client's onboarding welcome packet.
  2. **Google Drive Workspace Shortcut**: A dedicated launcher shortcut (`00_Launch AI Concierge.url`) provisioned directly in the client's isolated Google Drive root (`Eye Of Ru Enterprises / Clients / [Client Name] /`).
  3. **Lead Alert Digest Link**: Private link button included at the bottom of automated lead notification emails sent exclusively to the client.
  4. **Discreet Stealth Trigger**: An optional, unadvertised operator trigger on the live website (e.g. keyboard shortcut `Ctrl + Shift + C` or subtle triple-click on the footer copyright emblem) prompting for an authorized client passcode.
* **Search Engine Exclusion**: The `/concierge` route must always include `<meta name="robots" content="noindex, nofollow">`, be disallowed in `robots.txt`, and be excluded from `sitemap.xml`.

---

## 5. Visual Verification Before Release

* In accordance with `.agents/rules/user-preferences.md`, capture a visual verification screenshot into `<project>/artifacts/` verifying responsive desktop (1440px) and mobile (390px) rendering before declaring completion.
