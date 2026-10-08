# Deployment Plan: EyeOfRu (GitHub -> Cloudflare Pages)

## Architecture Strategy
To achieve maximum automation, we will bypass the manual Cloudflare-GitHub OAuth UI flow. Instead, we will configure a **GitHub Actions** workflow to build and push the site directly to Cloudflare Pages upon every commit to the `main` branch. 

---

## Phase 1: Credentials & Environment Validation
Before we touch any external services, we need to ensure our scripts can securely authenticate.

1. **Vault Integration Script**: I will author a PowerShell script (`Setup-Deployment.ps1`) that sources `Manage-Credentials.ps1` to extract the following variables from your `~/.gemini/.env` vault:
   - `GITHUB_TOKEN` (Needs `repo` scope)
   - `CLOUDFLARE_API_TOKEN` (Needs Cloudflare Pages edit permissions)
   - `CLOUDFLARE_ACCOUNT_ID`
2. **Pre-flight Check**: The script will validate that these keys are present and test authentication against both APIs.

---

## Phase 2: Automated GitHub Provisioning
Once authenticated, the script will execute the following:

1. **Repository Creation**: Use the GitHub REST API (or `gh` CLI if available) to create a new private (or public) repository named `eyeofru`.
2. **Git Initialization**: 
   - Ensure the local directory is a git repository.
   - Stage all relevant files (ignoring anything in `.gitignore`).
   - Commit the current state.
   - Add the new remote origin and push the `main` branch.

---

## Phase 3: CI/CD Pipeline & Cloudflare Pages Setup
We will automatically wire the newly created GitHub repository to Cloudflare.

1. **Pages Project Creation**: Use the Cloudflare API to provision a new Pages project named `eyeofru`.
2. **GitHub Secrets Injection**: Use the GitHub API to securely inject `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` into the GitHub repository's Action Secrets.
3. **Workflow Creation**: I will create `.github/workflows/deploy.yml` in the repository. This YAML file will use the official `cloudflare/pages-action` to deploy the site every time you push to `main`.
4. **Trigger Deployment**: A final push will trigger the first live deployment to `<project>.pages.dev`.

---

## Phase 4: DNS Configuration (Manual UI Steps)
Squarespace does not provide a standard API for managing DNS records programmatically on standard tiers, so this must be done manually. 

### Step 4A: Register Domain in Cloudflare (Automated)
- Our script will make an API call to Cloudflare Pages to attach your live domain (e.g., `www.eyeofru.com`) to the Pages project.

### Step 4B: Update Squarespace DNS (Manual Checklist)
Once the script finishes, you will need to perform these exact steps in your Squarespace account:
1. Log into **Squarespace** and navigate to your **Domains** dashboard.
2. Click on your specific domain and select **DNS Settings**.
3. Scroll down to **Custom Records**.
4. **Add a CNAME Record** for the `www` subdomain:
   - **Host / Alias**: `www`
   - **Type**: `CNAME`
   - **Data / Value**: `eyeofru.pages.dev`
5. **Add an ALIAS or A/AAAA Records** for the root domain:
   - *Note: Cloudflare will provide specific A/AAAA records during Step 4A. If Squarespace supports ALIAS records on the root `@`, you can point it to `eyeofru.pages.dev`.*
6. Delete any conflicting default Squarespace website records (usually marked under "Squarespace Defaults").
7. Save changes. (DNS propagation may take 15 mins to a few hours).
