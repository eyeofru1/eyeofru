# Mobile Access & Google Sheets / Drive Architecture Plan

## Executive Summary
You have two powerful layers in this ecosystem:
1. **The Database Layer (Google Sheets in Google Drive)**: The central spreadsheet holding all your lead records, outreach statuses, phone numbers, and notes.
2. **The Operational Layer (Lead Command Center Web App)**: The mobile-friendly web dashboard you’ve been refining, designed for rapid 1-tap calling, 1-click outreach copying, and instant scoring.

---

## How the Dashboard is Visible on Your Mobile Phone

### Option A: Deployed as a Mobile Web App / PWA (Recommended)
The **Lead Command Center** can be hosted on a private URL (e.g., `https://leads.eyeofru.com` or `https://eyeofru-leads.pages.dev`).
- **How you access it on your phone**:
  1. Open the URL in Safari (iOS) or Chrome (Android).
  2. Tap **Share / Options** -> **Add to Home Screen**.
  3. An icon titled **EYEOFRU** appears directly on your phone's home screen.
  4. Tapping it opens full-screen without browser address bars, giving you a native app feel on your phone with 1-tap call, 1-tap SMS, and instant copying.

### Option B: Google Apps Script Web App (Hosted Directly by Google Drive)
If you want the dashboard hosted 100% inside Google Drive:
- Google Apps Script provides an `HtmlService` web app URL directly linked to your Google Sheet.
- You bookmark that Google Apps Script URL on your phone to open the interface.

### Option C: Immediate Local Testing (Right Now from Your Phone)
Because the server is currently running on port `3300` on your computer:
- While your phone is on the same local Wi-Fi network as your computer, you can visit:
  `http://[Your-Computer-Local-IP]:3300`
- Alternatively, we can start a free instant Cloudflare tunnel (`cloudflared`) to give you a temporary secure `https://....trycloudflare.com` link to open on your phone right this second.

---

## How Google Sheets in Drive Connects with the Dashboard

```
┌──────────────────────────────────────┐       ┌──────────────────────────────────────┐
│  Mobile Phone (Safari / Chrome)      │       │  Google Drive (Google Sheet)         │
│  Lead Command Center Dashboard       │ <===> │  Live Central Master Spreadsheet     │
│  - 1-Tap Call & 1-Click Copy         │       │  - Full rows, timestamped logs       │
│  - Need 1-10 Rank & Dual Scores      │       │  - Direct collaborative editing      │
└──────────────────────────────────────┘       └──────────────────────────────────────┘
```

1. **Two-Way Real-Time Sync**:
   - The dashboard reads leads directly from your Google Sheet via a Google Apps Script API webhook.
   - When you tap **`Mark as Contacted`** or log notes in the drawer on your phone, it writes directly back to that Google Sheet in Google Drive.
2. **Fallback & CSV Import/Export**:
   - You can also export to CSV or import from CSV into Google Drive at any time using the `Export` / `Import` buttons in the toolbar.

---

## Recommended Next Steps
1. **Immediate Mobile Preview**: Launch a quick tunnel so you can test the new square mobile layout directly on your smartphone right now.
2. **Deploy to Cloudflare Pages**: Connect the repository to Cloudflare Pages for permanent 24/7 mobile access.
3. **Connect Google Sheets Webhook**: Bind the dashboard's data connector to your active Google Sheet URL in Google Drive for automatic two-way synchronization.
