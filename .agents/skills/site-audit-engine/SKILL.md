---
name: site-audit-engine
description: >-
  Executes the Aura Diagnostic Engine (ADE) to audit any target website URL across the 5-Pillar Friction
  Framework (Speed, Asset Bloat, Third-Party Drag, UX/Contrast, Schema/SEO). Compiles a branded 3-page
  executive PDF via Headless Chrome and uploads it to the client's 01_Audits & Proposals/ Google Drive folder.
---

# Site Audit Engine (Aura Diagnostic Engine)

The **Site Audit Engine** performs empirical technical audits on client websites to establish pre-rebuild baselines, calculate abandonment/bounce costs, and generate executive pitch deliverables.

## The 5-Pillar Friction Framework

1. **Speed & Core Web Vitals (FCP, LCP, TBT, CLS)**: Mobile vs. desktop load time comparison and estimated bounce cost.
2. **Asset & Media Bloat**: Oversized PNG/JPEG files, missing responsive dimensions (CLS), missing `alt` attributes.
3. **Third-Party Script Drag**: Chatbot delays, un-deferred tracking pixels, render-blocking web fonts.
4. **UX & Spatial Typography**: WCAG AA contrast ratio compliance (< 4.5:1), cramped mobile tap targets (< 48px).
5. **Local SEO & Schema Gaps**: Missing `schema.org/LocalBusiness` JSON-LD, missing OpenGraph cards, broken canonicals.

---

## Execution Command

Run the audit engine script with the target URL and client name:

```powershell
powershell -ExecutionPolicy Bypass -File ".agents\skills\site-audit-engine\scripts\Invoke-SiteAudit.ps1" `
  -TargetUrl "https://example.com" `
  -ClientName "Example Corp" `
  -UploadToDrive
```

### Script Execution Workflow:
1. **Telemetry Capture**: Queries PageSpeed Insights API (or local Chromium lighthouse) for mobile & desktop scores.
2. **DOM Scan**: Inspects image tags, alt text, viewport settings, and Schema JSON-LD blocks.
3. **Fix Table Generation**: Synthesizes findings into the Executive Bottleneck & Remediation Matrix.
4. **Headless Chrome PDF Compilation**: Renders `assets/templates/audit-report-template.html` into a crisp 3-page PDF via `--headless=new --print-to-pdf` in `<project>/artifacts/audits/`.
5. **Google Drive Ingestion**: Base64-encodes the PDF and dispatches it to the master Google Apps Script webhook (`action: "UPLOAD_AUDIT"`), saving directly into:
   `Eye Of Ru Enterprises / Clients / [Client Name] / 01_Audits & Proposals/`.
6. **Zero Emojis**: Output tables and documents use strictly clean ASCII bracketed badges (`[CRITICAL]`, `[HIGH]`, `[MEDIUM]`).
