---
name: site-intake-harvester
description: >-
  Harvests and normalizes client data into a production-ready content corpus for web builds.
  Supports three modes: (A) Brand Doc / Brief import, (B) Existing site scrape with 1:1 301
  redirect mapping for rebuilds, and (C) Google Business Profile (GBP) scan via Google Places API (New)
  for clients with no website.
---

# Site Intake Harvester Skill

This skill extracts, processes, and structures client assets into `content/data.json`, `assets/raw/`, and `_redirects` before any frontend code is authored.

## Ingestion Modes

### Mode A: Brand Document & Brief Import
Use when a client provides a brand brief, Google Doc, or intake markdown file.
1. Parse the document into structured sections:
   - Entity Information (Legal name, DBA, phone, email, address, service areas).
   - Core Value Proposition & Hero copy.
   - Theme Preference (Dark [Default] / Light / Auto) & Device Switcher Toast preference.
   - Brand Visual Identity & Color Palette:
     - Ingest verified brand colors (`brand.palette: { primary: "#...", secondary: "#...", accent: "#..." }`).
     - Vector assets provided vs. Needs Logo / Rebrand (triggers Nano Banana brand package).
   - Core Services (Titles, descriptions, deliverables).
   - Testimonials / Case Studies.
   - FAQs & Policies.
2. Output to `content/data.json`.

### Mode B: Existing Site Scrape & 1:1 301 Redirect Mapping (Rebuilds)
Use when modernizing or redesigning an existing website.
1. Fetch and crawl the existing sitemap (`/sitemap.xml`) or crawl HTML links.
2. Extract all live paths to generate a strict 1:1 `_redirects` map:
   ```text
   /old-service.html   /services   301
   /about-us           /about      301
   /*                  /           302
   ```
3. Scrape page copy (`h1`-`h4`, paragraphs, meta tags, schema markup) and download original high-res imagery to `assets/raw/`.
4. Extract Existing Brand Palette:
   - Scrape `:root` CSS custom properties (e.g. `--primary`, `--accent`, `--brand-blue`).
   - Extract computed background colors of primary CTA buttons and active headers.
   - Normalize into `brand.palette` inside `content/data.json`.
5. Output structured content to `content/data.json`.

### Mode C: Google Business Profile (GBP) Scan via Google Places API (New)
Use when the client has **no existing website** but possesses a Google Business listing.
1. Pre-flight check: Verify `GOOGLE_MAPS_API_KEY` exists in `~/.gemini/.env`.
2. Query Google Places API (New) using Place ID or text search (`places.googleapis.com/v1/places:searchText`):
   - Fields: `id,displayName,formattedAddress,nationalPhoneNumber,regularOpeningHours,rating,userRatingCount,reviews,photos,primaryType,location`.
3. Ingest NAP, operating hours, and top 5-star verified reviews directly into `content/data.json`.
4. Extract or Propose Brand Palette:
   - Scan storefront, vehicle wraps, and logo photos to identify dominant brand colors.
   - If no distinct brand color exists, present **3 industry-tailored, WCAG AA compliant dual-palettes** for client sign-off per [docs/client-brand-palette-architecture.md](../../../docs/client-brand-palette-architecture.md).
5. Auto-generate production-ready `schema.org/LocalBusiness` JSON-LD schema with `sameAs` links to their Google Maps CID and place URL.
6. Download storefront and gallery photos into `assets/raw/gallery/`.

## Running the Harvester Script

Run the automated intake helper script:
```powershell
# For GBP Ingestion:
powershell -ExecutionPolicy Bypass -File .agents/skills/site-intake-harvester/scripts/Invoke-IntakeHarvest.ps1 -Mode GBP -Query "Business Name City State"

# For Existing Site Rebuild:
powershell -ExecutionPolicy Bypass -File .agents/skills/site-intake-harvester/scripts/Invoke-IntakeHarvest.ps1 -Mode Scrape -TargetUrl "https://example.com"
```

## Corpus Gap Detection & Prompt-First Protocol (STRICT)

After ingesting raw client data via Mode A, B, or C, the harvester flags any missing data points in `content/data.json`:
* **Phone Number**: If no verified telephone is present, flag as `phone: null`. Prompt user: *"No verified phone number found. Provide official number or confirm email-first model."*
* **Physical Address & Geo**: If no storefront or physical office address exists, flag as `address: null`. Prompt user: *"Is this business digital/remote-only, or is there an official commercial address?"*
* **Reviews / Testimonials**: If no verified Google or client reviews exist, flag as `reviews: []`. **STRICTLY PROHIBITED FROM GENERATING SYNTHETIC TESTIMONIALS.**
* **Zero Fabrication Rule**: Downstream agents building the site must NEVER invent placeholder phone numbers (`555-XXXX`), dummy addresses, or synthetic reviews to satisfy rules. Always prompt the user before writing code.
