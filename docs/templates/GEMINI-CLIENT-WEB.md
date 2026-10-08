# Project Guidelines: [PROJECT_NAME] (Client Marketing / Web Rebuild Archetype)

## 1. Project Identity & Architecture
* **Type**: Client Marketing Website / High-Conversion Web Rebuild
* **Canonical Host / Port**: Port [PORT_NUMBER] (per `~/.gemini/ports.json`)
* **Deployment Target**: Cloudflare Pages (Edge CDN Static HTML/JS)

## 2. Core Operational Rules (Inherited from Studio Standards)
* **Credentials**: Follow Antigravity Universal Credentials protocol (`Manage-Credentials.ps1 -Action Check -Key <KEY>`).
* **Shell Standards**: Native Windows PowerShell syntax only (explicit UTF-8). Zero bash commands.
* **Code Integrity**: Follow `.agents/rules/code-integrity.md`. Never strip comments or docstrings.
* **Clean Artifacts**: Route all screenshots, test dumps, and audit logs to `artifacts/` or `scratch/`. NEVER write to Desktop.

## 3. Web Production Standards (Client Web Archetype)
* **5-Core Pillars**: Hero/Home, About/Story, Services/Catalog, Contact/Inquiry, Legal/Governance.
* **Dual-Theme Semantic Tokens & WCAG AA**:
  - Use brand-agnostic utility tokens (`bg-canvas`, `bg-surface`, `bg-drawer`, `text-primary`, `text-secondary`, `text-accent`, `bg-accent`, `border-theme`).
  - Enforce the Mathematical Contrast Governor (relative luminance $L = 0.2126R + 0.7152G + 0.0722B$) per `docs/client-brand-palette-architecture.md`.
  - All text must achieve $\ge 4.5:1$ contrast against immediate background in BOTH Light and Dark modes.
* **Cognitive Read-Time & Zero-Corpus Self-Collapsing**:
  - Dynamically calculate article read time: $\max(1, \lceil \text{words} / 200 \rceil)\text{ min read}$. Never hardcode static estimates.
  - If dynamic sections (Articles, Blogs, Case Studies, Testimonials) have zero verified entries in `content/data.json`, automatically hide/self-collapse the entire section and all corresponding navigation anchor links. Never invent dummy placeholder cards.
* **Lead Capture & Edge Security**:
  - Contact forms submit asynchronously to dedicated Google Apps Script webhook with Cloudflare Turnstile bot shield.
  - Edge security headers in `_headers` (strict CSP, `X-Frame-Options: DENY`, `nosniff`).
  - For rebuilds, maintain 1:1 301 redirects in `_redirects` to preserve legacy SEO rankings.
* **Machine Manifests & SEO**:
  - Inject Schema.org JSON-LD `@graph` (`LocalBusiness` / `ProfessionalService` + `WebSite`) using verified client corpus data only.
  - Provide `/llms.txt` teaser manifest using the mandatory 5-section commercial schema.

## 4. Strict Studio Policies
* **Zero Emojis Policy (STRICT)**: Never add emojis or informal icons to UI buttons, toasts, headings, code, or documentation.
* **Zero Fictitious Data & Prompt-First Protocol (STRICT)**: Never invent placeholder phone numbers (`555-XXXX`), fake addresses, arbitrary coordinates, or synthetic reviews. If data is missing from `content/data.json`, **PAUSE AND CUE THE USER**.
* **Copywriting Sign-Off (MANDATORY)**: Never auto-commit rewrites to client copy without side-by-side proposal and user sign-off.
