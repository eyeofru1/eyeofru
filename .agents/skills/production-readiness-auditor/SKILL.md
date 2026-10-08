---
name: production-readiness-auditor
description: >-
  Audits client websites before production release on Cloudflare Pages.
  Checks 1:1 301 redirects, LocalBusiness JSON-LD schema validity, security headers (_headers),
  OpenGraph tags, Turnstile form integration, and Core Web Vitals (LCP/A11y).
---

# Production Readiness Auditor Skill

This skill enforces a comprehensive pre-launch checklist to guarantee zero regressions, flawless SEO, and airtight edge security.

## 1. Automated Execution Script

Run the automated pre-flight audit against the build output:

```powershell
powershell -ExecutionPolicy Bypass -File ".agents\skills\production-readiness-auditor\scripts\Invoke-PreflightAudit.ps1" -DistPath "dist"
```

The script automatically executes a 7-step verification matrix:
1. **Edge Assets**: Confirms presence of all required static build files (`index.html`, `_headers`, `_redirects`, `robots.txt`, `sitemap.xml`, favicons).
2. **Redirect Map**: Validates 1:1 301 SEO preservation rules.
3. **Edge Headers**: Verifies strict CSP, `X-Frame-Options: DENY`, `nosniff`, and absence of runtime CDNs.
4. **Structured Schema**: Confirms valid JSON-LD `@graph` (`ProfessionalService` / `LocalBusiness` + `WebSite`).
5. **Form & Turnstile**: Checks bot shield and Apps Script webhook integration.
6. **Zero-Emoji & Typography Compliance**: Mechanically verifies 0 emojis, 0 unprompted icons, and zero character encoding artifacts (`U+FFFD`).
7. **Visual Captures**: Verifies presence of desktop and mobile verification captures.

---

## 2. Pre-Flight Verification Checklist

Before publishing to production or triggering a release PR:

### A. Redirects & SEO Integrity (Rebuilds)
- [ ] Verify `_redirects` file exists in the build output.
- [ ] Test every legacy sitemap URL against the preview domain:
  - Must return `301 Moved Permanently` to the corresponding new route.
  - No legacy URL should return `404 Not Found`.
- [ ] Check canonical tags on all core pages.

### B. Schema & Metadata Verification
- [ ] Validate `schema.org/LocalBusiness` or `ProfessionalService` JSON-LD block:
  - Exact legal entity name, telephone, address, and geo coordinates present.
  - `sameAs` array includes Google Business Profile, CID link, and social profiles.
  - Hours specification matches real operating hours.
- [ ] Verify OpenGraph meta tags (`og:title`, `og:description`, `og:image`, `og:url`).
- [ ] Ensure 1200x630px high-contrast preview image exists at `/assets/og-image.png`.

### C. Security & Edge Headers (`_headers`)
- [ ] Verify `_headers` exists in the build output.
- [ ] Content-Security-Policy (CSP) allows necessary assets (Google Fonts, Turnstile, Google Maps, Apps Script webhook).
- [ ] Anti-clickjacking (`X-Frame-Options: DENY`) and `X-Content-Type-Options: nosniff` active.
- [ ] Cloudflare Turnstile token validation present on all contact forms.

### D. Form & Lead Delivery Test
- [ ] Submit a test lead through the contact form.
- [ ] Verify row appears in the client's Google Sheet (`Leads`).
- [ ] Verify notification email is received with lead details from `agency@eyeofruenterprisesllc.com`.

### E. Visual Verification & Dual-Theme Contrast / A11y
- [ ] Capture responsive verification screenshots in **BOTH Light Mode and Dark Mode** (including 1440px desktop and 390px mobile drawer expanded state) to `<project>/artifacts/`.
- [ ] Verify WCAG AA contrast compliance ($\ge 4.5:1$ for body copy, $\ge 3:1$ for UI borders and large text) across all semantic tokens (`text-primary`, `text-secondary`, `text-accent`, `bg-canvas`, `bg-surface`, `bg-drawer`).
- [ ] Verify zero dark-on-dark or washed-out text when toggling between themes.
- [ ] Run Chrome DevTools accessibility and LCP audits (target 95+ score).
- [ ] In accordance with `.agents/rules/copywriting-confirmation.md`, confirm client sign-off on all customer-facing copy.
