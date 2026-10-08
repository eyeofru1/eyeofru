# Cloudflare Pages Deployment & Edge Security Rule

This rule governs the build, edge configuration, security headers, redirects, and CI/CD pipelines for sites hosted on Cloudflare Pages.

## 1. Stack & CI/CD Pipeline

* **Repository**: GitHub private repository (main branch protected).
* **Build Configuration**:
  - Build command: `npm run build` or static export.
  - Build output directory: `dist` (or `.` for single-page static repositories).
* **Previews**:
  - Every Pull Request automatically generates a branch preview URL on Cloudflare Pages (`<branch>.<project>.pages.dev`).
  - Preview deployments must be tested and reviewed before merging into `main`.

---

## 2. Mandatory Edge Security Headers (`_headers`)

All Cloudflare Pages deployments must include a `_headers` file in the build output root (`dist/_headers` or `public/_headers`):

```text
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; frame-src https://challenges.cloudflare.com https://www.google.com; connect-src 'self' https: https://script.google.com https://script.googleusercontent.com;
```

---

## 3. Strict 1:1 301 Redirect Mapping for Rebuilds (`_redirects`)

For site rebuilds, legacy URL traffic and SEO link equity must be protected:
* An automated crawl of the legacy sitemap and URL list must be performed prior to development.
* A Cloudflare `_redirects` file must be generated in the build output containing strict 1:1 301 redirects from every legacy path to the new structure:
  ```text
  /services/old-service.html   /services   301
  /about-us/index.php          /about      301
  /contact-us                  /contact    301
  /*                           /           302
  ```
* Test all mapped redirects to ensure zero 404 errors on legacy indexed URLs.

---

## 4. Dual Analytics Strategy

* **Default Telemetry (Cloudflare Web Analytics)**:
  - Enabled directly in Cloudflare Pages dashboard (zero cookies, GDPR compliant without cookie banner, zero client script overhead).
* **Client Conversion Tracking (GA4 / GTM)**:
  - Injected only when the client specifically contracts for Google Ads or advanced conversion funnel tracking.
  - Script must be asynchronously loaded and deferred to preserve 100 Core Web Vitals (LCP) performance.

---

## 5. Zero-Leak Secrets on Cloudflare

* Never commit API keys, webhook URLs, or sensitive tokens to GitHub.
* Encrypted environment variables must be configured via Cloudflare Pages dashboard or GitHub repository secrets via Antigravity Universal Credentials Management (`~/.gemini/.env`).
