# AI Concierge & Command Center — Modular Implementation Blueprint

> **Purpose**: Authoritative, plug-and-play architectural specification and step-by-step scaffolding guide for deploying the air-gapped **Client AI Concierge, Inbound Inquiries CRM & Site Analytics Hub** (`/concierge`) to any website project in under 15 minutes.

---

## 1. Architectural Philosophy & Air-Gap Standard

Traditional client CMS portals (WordPress, Webflow, direct database dashboards) introduce attack vectors, authentication sprawl, and vulnerability to accidental production breakage by non-technical business owners.

The **Eye Of Ru AI Concierge Architecture** eliminates these liabilities through strict physical and logical air-gapping:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / OWNER DEVICE                          │
│               Private PWA Webclip (/concierge dashboard)               │
└───────────────┬────────────────────────────────────────┬───────────────┘
                │ Proposes Edits                         │ Submits Lead
                │ & Photo Uploads                        │ Status Changes
                ▼                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   AIR-GAPPED GOOGLE APPS SCRIPT WEBHOOK                │
│       Routes 1-12: Drive Scaffolding, Sheet Queues, Lead Ingestion     │
└───────────────┬────────────────────────────────────────┬───────────────┘
                │ Logs Staged Diffs                      │ Real-Time Lead
                │ & Base64 Photos                        │ Status Tracking
                ▼                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 CLIENT OPERATIONAL WORKBOOK (Google Sheet)             │
│        [Tab: Leads]                  [Tab: Staging_Queue]              │
└────────────────────────────────────────────────┬───────────────────────┘
                                                 │
                                                 │ Operator Review & Triage
                                                 │ (scripts/Sync-StagingQueue.ps1)
                                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     ANTIGRAVITY OPERATOR PIPELINE                      │
│            Verified Diff Execution ➔ Cloudflare Pages Release         │
│                        (Zero Direct GitHub Writes)                     │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Tenets:
1. **Zero Direct GitHub Writes**: Neither the client nor the client-side conversational AI has write access to GitHub, git repositories, or production hosting APIs.
2. **Dual-Layer Persistence**: All interactions write to the Google Apps Script spreadsheet ledger and simultaneously buffer in local browser storage (`localStorage`), giving the business owner zero-latency UI updates even on intermittent cellular connections.
3. **Human-in-the-Loop Triage**: High-impact proposals (hours, pricing, photos) stage into an operational spreadsheet. The agency engineering team reviews diffs via the terminal operator CLI tool (`Sync-StagingQueue.ps1`), verifies them, and pushes live with conventional semantic commits.

---

## 2. The 3 Unified Command Center Modules

The dashboard (`concierge.html`) provides a single, high-density obsidian-themed interface structured into three primary panes:

### Module A: Conversational Staging Assistant (Left Pane)
* **Intent Parser**: Interprets plain English change requests (e.g., *"change Saturday hours to 10am-2pm"*, *"make button glow amber"*, *"draft a new article on emergency repairs"*).
* **Starter Direction Cues**: Clean pills (`+ Adjust Template`, `+ Update Hours`, `+ Draft Article`, `+ New Photos`) that seed the prompt box with actionable baseline context.
* **Photo Upload Tray & Drag-and-Drop**: Drag images directly onto the console or attach via the `📎` paperclip button. Generates visual preview thumbnails with file sizes and Base64 uploads directly to the client's Google Drive `02_Brand Assets & Media` folder.
* **Expedited 24H SLA Heuristic**: Requests mentioning *"tomorrow"*, *"urgent"*, or *"asap"* automatically trigger high-priority flame badges (`🔥 [EXPEDITED 24H SLA]`) and priority operator notification emails.
* **Full-Screen Diff Modal**: Clickable `Inspect ↗` button launches an edge-to-edge modal comparing Current Baseline vs. Proposed Value with smooth vertical scrolling.

### Module B: Staging Queue & Live Inquiries Hub (Bottom-Right Panel)
* **Tab Navigation**: Clean rounded buttons matching the obsidian interface without bracket notation:
  * **`Staging Queue`**: Displays active air-gapped proposals awaiting operator verification.
  * **`Live Inquiries`**: Inbound website lead submissions directly from contact forms.
  * **`Site Analytics`**: Live traffic telemetry and audience intelligence.
* **In-Window Lead CRM**: Each lead record includes:
  * One-tap `tel:` and `mailto:` communication links for instant client callback.
  * Inline status dropdown: `New Lead` (Amber) ➔ `Contacted` (Sky) ➔ `Qualified` (Emerald) ➔ `Closed` (Charcoal).
  * Instant webhook synchronization (`action: "UPDATE_LEAD_STATUS"`) updating column 7 of the `Leads` sheet tab.
* **Dynamic Tab Signaling Badges (Dot + Count)**:
  * `Staging Queue`: Displays an illuminated amber beacon badge with real-time numeric count (`● N`) whenever staged proposals are awaiting triage.
  * `Live Inquiries`: Displays an illuminated emerald beacon badge with real-time count (`● N`) whenever uncontacted inbound leads (`New Lead`) are pending.
  * `Site Analytics`: Displays an illuminated emerald pulse badge with active user count (`● N`) reflecting real-time edge activity.
* **Lifecycle-Aware Polling Engine**:
  * Utilizes the **Page Visibility API** (`document.visibilityState === 'visible'`) to poll for updates on a 35s cadence only when the dashboard is open and in foreground.
  * Checks are halted instantly whenever the tab is hidden, minimized, or backgrounded to eliminate unnecessary battery draw and API quota usage.
  * Immediately triggers an eager sync check upon regaining focus/visibility.

### Module C: Site Analytics & Edge Telemetry (Third Tab)
* **Zero External Dependencies**: Renders smooth responsive vector timeseries charts directly via native SVG `<svg viewBox="0 0 500 110">` with obsidian-to-bronze gradient fills.
* **4 Real-Time KPI Cards**:
  1. *Realtime Active Users* (pulse beacon indicator).
  2. *Unique Visitors* (7D/30D trend with percentage velocity).
  3. *Total Page Views* (with views-per-visit efficiency).
  4. *Average Session Duration* (engagement retention).
* **Audience Segmentation Pills**:
  * **`Unique Visitors`**: Clean prospective client metrics (internal dev devices, agent review runs, and automated scrapers filtered out).
  * **`AI Helper Agents`**: Telemetry on autonomous subagent reviews, staging queue validations, and edge function executions.
* **Time Range Toggle**: Instant switching between **`7D`** and **`30D`**.

---

## 3. Scaffolding Checklist for a New Website Project (15-Minute Setup)

When bootstrapping a new client website, follow this standardized deployment sequence:

### Step 1: Copy Source Files
Copy the following files into the target repository:
```text
target-website/
├── concierge.html                 # Complete client dashboard application
├── functions/
│   └── api/
│       └── analytics.js           # Cloudflare Pages edge function for analytics
├── gas-drive-ingestion/
│   ├── Code.js                    # Universal Google Apps Script backend
│   ├── appsscript.json            # Manifest with OAuth scopes
│   └── .clasp.json                # Clasp CLI deployment config
├── scripts/
│   └── Sync-StagingQueue.ps1      # Operator triage & diff review tool
└── public/
    └── manifest.webmanifest       # PWA home screen webclip configuration
```

### Step 2: Configure Client Constants
In `concierge.html`:
```javascript
const MASTER_WEBHOOK_URL = "https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec";
const CLIENT_NAME = "Target Client Business Name";
```

In `public/manifest.webmanifest`:
```json
{
  "name": "Target Client AI Concierge",
  "short_name": "Concierge",
  "start_url": "/concierge",
  "display": "standalone",
  "background_color": "#0d0f12",
  "theme_color": "#0d0f12",
  "icons": [
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" },
    { "src": "/assets/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

In `index.html` (Website Contact Form):
```javascript
window.STUDIO_CONFIG = {
  webhookUrl: "https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec",
  ...
};
```

### Step 3: Provision Google Apps Script Backend
1. Create a new Google Apps Script project at [script.google.com](https://script.google.com).
2. Copy the Script ID from Project Settings.
3. Update `gas-drive-ingestion/.clasp.json`:
   ```json
   {
     "scriptId": "YOUR_NEW_SCRIPT_ID",
     "rootDir": ""
   }
   ```
4. Push and deploy via Clasp:
   ```powershell
   npm run clasp:push -f
   npx @google/clasp deploy --description "v1.0.0 Production Webhook"
   ```
5. Copy the deployed Web App URL and set it as `MASTER_WEBHOOK_URL`.

### Step 4: Protect Route via Cloudflare Zero Trust (Access)
1. In Cloudflare Dashboard ➔ **Zero Trust** ➔ **Access** ➔ **Applications**.
2. Add an application protecting `yourdomain.com/concierge`.
3. Set Policy: **One-Time PIN (OTP)** sent to authorized emails (e.g. `owner@clientdomain.com`, `agency@youragency.com`).
4. This ensures total air-gapping: only authenticated business owners can access the dashboard.

### Step 5: Mobile Webclip Installation (Client Onboarding)
During onboarding, guide the client to save the private webclip:
* **iOS Safari**: Open `yourdomain.com/concierge` ➔ Tap **Share** (square with up-arrow) ➔ Tap **"Add to Home Screen"**.
* **Android Chrome**: Open `yourdomain.com/concierge` ➔ Tap **Three Dots Menu (⋮)** ➔ Tap **"Install App"** or **"Add to Home screen"**.
* The webclip appears on their home screen as a native standalone app with the crisp branded icon.

---

## 4. Webhook API Contract Reference (`Code.js`)

All endpoints communicate via `POST` JSON payloads (with CORS support) or `GET` query parameters.

| Action Header | Method | Required Fields | Function & Side Effects |
| :--- | :--- | :--- | :--- |
| `SUBMIT_LEAD` | `POST` | `clientName`, `fullName`, `email`, `message`, `phone`, `subject` | Appends row to `Leads` sheet tab. Dispatches email notification to agency. |
| `GET_LEADS` | `GET`/`POST` | `clientName` | Reads all rows from `Leads` tab. Returns array of lead objects with `rowIndex`, `status`, contact info. |
| `UPDATE_LEAD_STATUS` | `POST` | `clientName`, `rowIndex`, `newStatus` | Updates column 7 (Status) in the `Leads` sheet. Returns success payload. |
| `SUBMIT_STAGING_REQUEST` | `POST` | `clientName`, `targetSection`, `field`, `currentValue`, `proposedValue`, `clientRationale` | Appends proposal to `Staging_Queue` tab. Triggers operator triage notification email. |
| `GET_STAGING_QUEUE` | `GET`/`POST` | `clientName` | Reads active items from `Staging_Queue` tab for dashboard display. |
| `UPDATE_STAGING_STATUS` | `POST` | `clientName`, `rowIndex`, `newStatus`, `operatorNotes` | Updates status (`DEPLOYED`, `REJECTED`, `EXPEDITED`, `REQUIRES_2STEP`). If deployed, dispatches client email. |
| `UPLOAD_ASSET` | `POST` | `clientName`, `base64Data`, `fileName`, `mimeType` | Decodes Base64 image and saves directly to Google Drive `02_Brand Assets & Media` folder. |

---

## 5. Operator Triage CLI Workflow (`Sync-StagingQueue.ps1`)

When a client submits a change proposal from their phone, the agency operator manages it cleanly from PowerShell:

```powershell
.\scripts\Sync-StagingQueue.ps1
```

1. **Urgency Banner**: Highlights any expedited turnaround (`[!] URGENT 24H SLA: NEEDED BY TOMORROW`).
2. **Terminal Diff**: Displays red `[CURRENT BASELINE]` and green `[PROPOSED MODIFICATION]`.
3. **Actions Available**:
   * `[A]` **Approve & Mark DEPLOYED**: Updates sheet to `DEPLOYED` and sends deployment confirmation email to client.
   * `[E]` **Mark EXPEDITED**: Escalates priority to 24-hour turnaround.
   * `[2]` **Flag 2-STEP**: Marks `REQUIRES_2STEP` requiring verbal phone confirmation before production push.
   * `[R]` **Reject Proposal**: Records operator rationale in the client's spreadsheet.
   * `[S]` **Skip**: Advances to next queue proposal.
