# Project Guidelines: [PROJECT_NAME] (App & Dashboard Archetype)

## 1. Project Identity & Architecture
* **Type**: Internal Operational Dashboard / High-Density Web Application (e.g. Lead Command Center)
* **Canonical Host / Port**: Port [PORT_NUMBER] (strictly respect `~/.gemini/ports.json`)
* **Core Function**: Real-time operational data processing, inquiry telemetry, and management workflows.
* **Scope Boundary (Non-Marketing Mandate)**:
  - This is an **authenticated, internal operational application**, NOT a public-facing marketing site.
  - **DO NOT** inject public Schema.org `LocalBusiness` JSON-LD, marketing FAQs, XML sitemaps, or public 301 redirects.
  - **DO NOT** invent dummy or synthetic leads in production ledgers. Use realistic, verified operational fixtures for local development.

## 2. Core Operational Rules (Inherited from Studio Standards)
* **Credentials**: Follow Antigravity Universal Credentials protocol (`Manage-Credentials.ps1 -Action Check -Key <KEY>`).
* **Shell Standards**: Native Windows PowerShell syntax only (explicit UTF-8). Zero bash commands.
* **Code Integrity**: Follow `.agents/rules/code-integrity.md`. Never strip comments or docstrings.
* **Clean Artifacts**: Route all screenshots, test dumps, and audit logs to `artifacts/` or `scratch/`. NEVER write to Desktop.

## 3. Application & Dashboard Engineering Standards
* **High-Density Dashboard UI & Visual Hierarchy**:
  - High-information density: compact tabular views, searchable/filterable lead queues, telemetry metric cards, and responsive drawer details.
  - Status Pills & Badges: Standardized color coding (Emerald for active/live/verified, Amber for in review/staging, Slate for archived/withheld).
* **Dual-Theme Parity & WCAG AA Contrast**:
  - Maintain crisp dark mode (obsidian/slate `#07090b` / `#0d0f12`) and clean light mode (`#f8fafc` / `#ffffff`).
  - All text, table cells, and status badges must meet or exceed WCAG AA $\ge 4.5:1$ contrast against immediate backgrounds.
  - Mobile drawer and slide-over inspector panels must adapt synchronously with active theme.
* **Data Flow & Webhook Ingestion**:
  - Secure asynchronous integration with Google Apps Script webhooks, Google Sheets, Firebase/Firestore, or Cloudflare Workers.
  - Handle rate limits, concurrency lockouts, and network errors gracefully with retry mechanisms and user feedback.
* **Private / Stealth Access**:
  - Secure routes behind access keys, role verification, or stealth operator triggers (`Ctrl+Shift+C`).

## 4. Strict Studio Policies
* **Zero Emojis Policy (STRICT)**: Never add emojis or informal icons to UI buttons, status chips, toasts, logs, or documentation. Use clean vector icons (SVGs) and uppercase ASCII status brackets (e.g. `[LIVE]`, `[PENDING]`, `[ERROR]`).
* **Zero Fictitious Data & Prompt-First Protocol (STRICT)**: Never inject fabricated contact records, dummy phone numbers (`555-XXXX`), or fake metrics into production storage. Always prompt the user before writing mock schemas.
* **Visual Verification Gate**: Capture verification screenshots in **BOTH Light Mode and Dark Mode** at 1440px desktop and 390px mobile to verify layout, table readability, and contrast compliance.
