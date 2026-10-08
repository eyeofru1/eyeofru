---
name: ai-concierge-builder
description: >-
  Scaffolds and configures the client-side AI Concierge dashboard (/concierge) and staging queue.
  Connects a Gemini-powered conversational assistant to a Google Apps Script staging queue, allowing
  clients to propose site updates with live diff previews while keeping production code safe.
---

# AI Concierge Builder Skill

This skill scaffolds the `/concierge` client dashboard, Cloudflare edge proxy function, and Google Apps Script staging queue.

## 1. Architectural Safeguards

1. **Edge Auth Barrier**: Protect `/concierge` using Cloudflare Zero Trust (Access) with One-Time PIN (OTP) verification sent to authorized client emails.
2. **Edge Proxy Function**: All chat interactions call `/api/concierge` (Cloudflare Pages Function). The `GEMINI_API_KEY` is never exposed to the client browser.
3. **Strict JSON Schema**: The Gemini assistant is constrained to output structured diff proposals:
   ```json
   {
     "targetSection": "hours",
     "field": "saturday",
     "currentValue": "9:00 AM - 5:00 PM",
     "proposedValue": "10:00 AM - 2:00 PM",
     "clientRationale": "Summer weekend hours reduction"
   }
   ```
4. **Air-Gapped Human-in-the-Loop**: The assistant CANNOT commit to GitHub or modify live files directly. It posts exclusively to the Agency Google Sheet `Staging_Queue` for review in Antigravity.

---

## 2. Deployment Tiers

1. **Tier 1: Static Client Dashboard (Standard MVP)**:
   - Split-pane conversational UI at `/concierge.html`.
   - Directional starter cues (`Adjust Template`, `Change Hours`, `Draft Venture`) that prompt the agent with user intent.
   - Client-side intent parser (`interpretContentOrStyleRequest`) capable of synthesizing visual styling (glowing accents, scaling) and component targeting.
   - Dynamic auto-expanding prompt input with sticky compact action icon.
   - Scrollable Staging diff viewer and full-screen inspection modal (`Inspect ↗`).
   - Posts structured change proposals directly to the master webhook (`gas-drive-ingestion/Code.js`) using `action: "SUBMIT_STAGING_REQUEST"`.
   - Zero edge functions or cloud build overhead required.

2. **Tier 2: Managed Edge LLM Assistant (Enterprise Retainer)**:
   - Protected behind Cloudflare Access (Zero Trust) with One-Time PIN (OTP) verification sent to authorized client emails.
   - Cloudflare Pages Functions edge proxy (`functions/api/concierge.ts`) calling `gemini-2.5-flash` with the client's schema.
   - `GEMINI_API_KEY` is securely stored in Cloudflare environment variables, never exposed to client browsers.

---

## 3. Direction Cues & Contextual Intent Architecture

The concierge interface leverages natural opening direction cues rather than brittle template placeholders:
* **Adjust Template**: Pre-fills `"Please adjust the site content as follows: "` and focuses the input. The agent recognizes general site modifications, text edits, or layout enhancements.
* **Change Hours**: Pre-fills `"Please update operating hours as follows: "`. The agent immediately recognizes business schedule modifications and maps the target directly to the business hours schema.
* **Draft Venture**: Pre-fills `"Please draft a new venture article/card as follows: "`. The agent understands an article submission is underway and scaffolds a portfolio card or modal layout with the provided text.

### Visual Styling & Component Parsing
The engine interprets requests that go beyond verbatim string replacement:
* **Visual Effects**: Detects keywords like `glowing`, `glow`, `accent`, and automatically injects cyber-bronze/amber box shadows and border glows (`box-shadow: 0 0 25px rgba(212, 160, 23, 0.45); border-color: rgba(212, 160, 23, 0.6)`).
* **Font Scaling**: Interprets relative sizing requests (e.g., `increase it 25%` -> `font-size: 1.25em`).
* **Content Prepending/Appending**: Synthesizes prefix/suffix additions (e.g., `say hello before the title`).
* **Target Isolation**: Discerns specific UI components (`header`, `hero`, `ventures`, `hours`, `contact`) from natural language queries.

---

## 4. Master Google Sheet Integration (`gas-drive-ingestion`)

Staging requests post directly to the client's unified workbook:
* **Master Workbook**: `Eye Of Ru Enterprises / Clients / [Client Name] / 03_Data & Lead Sheets / [Client Name] — Operational Data & Leads`
* **Target Tab**: `Staging_Queue` (automatically provisioned alongside the `Leads` tab).
* **Payload Structure**:
  ```json
  {
    "action": "SUBMIT_STAGING_REQUEST",
    "clientName": "Client Business Name",
    "targetSection": "services",
    "field": "consultation_rate",
    "currentValue": "$250/hr",
    "proposedValue": "$300/hr",
    "clientRationale": "Annual rate adjustment for Q4",
    "submittedBy": "owner@clientdomain.com"
  }
  ```
* **Alert Trigger**: The master webhook automatically triggers an email notification to `agency@eyeofruenterprisesllc.com` with a direct link to the staging tab for review and one-click Antigravity deployment.

