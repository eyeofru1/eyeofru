param(
    [string]$DomainName = "eyeofruenterprisesllc.com",
    [string]$ProjectName = "eyeofru"
)

# 1. Load variables from ~/.gemini/.env
$envFile = Join-Path $HOME ".gemini\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match '^([^#=]+)=(.*)$' } | ForEach-Object {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($value -match '^"(.*)"$') { $value = $matches[1] }
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

# 2. Verify Required Credentials
$missing = @()
if (-not $env:GITHUB_TOKEN) { $missing += "GITHUB_TOKEN" }
if (-not $env:CLOUDFLARE_API_TOKEN) { $missing += "CLOUDFLARE_API_TOKEN" }
if (-not $env:CLOUDFLARE_ACCOUNT_ID) { $missing += "CLOUDFLARE_ACCOUNT_ID" }

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Red
    Write-Host "⏸️  MISSING CREDENTIALS" -ForegroundColor Red
    Write-Host "================================================================" -ForegroundColor Red
    Write-Host "The following required credentials are missing from your vault:"
    foreach ($m in $missing) {
        Write-Host "  - $m" -ForegroundColor Yellow
        Write-Host "    Secure Command: powershell -ExecutionPolicy Bypass -File `"$HOME\.gemini\scripts\Manage-Credentials.ps1`" -Action Set -Key `"$m`""
    }
    Write-Host ""
    Write-Host "Please set them using the commands above and rerun this script."
    Write-Host "================================================================" -ForegroundColor Red
    exit 1
}

$ghPath = "C:\Users\forth\.gemini\antigravity\brain\8c48778b-8495-458e-a4cd-738f4c3eb5bf\scratch\bin\gh.exe"
if (-not (Test-Path $ghPath)) {
    Write-Host "gh CLI not found at scratch bin path. Using system 'gh' if available."
    $ghPath = "gh"
}

# Ensure GH Token is explicitly provided to GH CLI
$env:GH_TOKEN = $env:GITHUB_TOKEN

Write-Host "Credentials verified. Proceeding with Phase 2..." -ForegroundColor Green

# Phase 2: GitHub Provisioning
Write-Host "Creating GitHub Repository '$ProjectName'..." -ForegroundColor Cyan
& $ghPath auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub authentication failed. Check your GITHUB_TOKEN." -ForegroundColor Red
    exit 1
}

# Ignore errors if the repo already exists
& $ghPath repo create "eyeofru/$ProjectName" --public --source="." --remote="origin" --push 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Repo might already exist or remote is set. Pushing to main..." -ForegroundColor Yellow
    git push -u origin main
} else {
    Write-Host "Successfully created and pushed to new GitHub repo." -ForegroundColor Green
}

# Phase 3: Cloudflare Pages Setup
Write-Host "Creating Cloudflare Pages Project '$ProjectName'..." -ForegroundColor Cyan
$cfHeaders = @{
    "Authorization" = "Bearer $env:CLOUDFLARE_API_TOKEN"
    "Content-Type"  = "application/json"
}

$cfBody = @{
    name = $ProjectName
    production_branch = "main"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$env:CLOUDFLARE_ACCOUNT_ID/pages/projects" -Method Post -Headers $cfHeaders -Body $cfBody -ErrorAction Stop
    Write-Host "Cloudflare Pages project created." -ForegroundColor Green
} catch {
    Write-Host "Failed to create Pages project (it may already exist)." -ForegroundColor Yellow
}

Write-Host "Injecting Cloudflare Secrets into GitHub..." -ForegroundColor Cyan
& $ghPath secret set CLOUDFLARE_API_TOKEN --body "$env:CLOUDFLARE_API_TOKEN"
& $ghPath secret set CLOUDFLARE_ACCOUNT_ID --body "$env:CLOUDFLARE_ACCOUNT_ID"

Write-Host "Creating GitHub Actions Workflow..." -ForegroundColor Cyan
$workflowDir = ".github\workflows"
if (-not (Test-Path $workflowDir)) {
    New-Item -ItemType Directory -Path $workflowDir -Force | Out-Null
}

$workflowContent = @"
name: Deploy to Cloudflare Pages
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: `$`{{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: `$`{{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: $ProjectName
          directory: '.'
          gitHubToken: `$`{{ secrets.GITHUB_TOKEN }}
"@
Set-Content -Path "$workflowDir\deploy.yml" -Value $workflowContent

# Commit and push workflow
git add "$workflowDir\deploy.yml"
git commit -m "chore: add cloudflare pages deployment workflow"
git push origin main

# Phase 4A: Domain mapping
Write-Host "Registering Domain '$DomainName' in Cloudflare..." -ForegroundColor Cyan

$domains = @("www.$DomainName", $DomainName)
foreach ($domain in $domains) {
    $domainBody = @{ name = $domain } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$env:CLOUDFLARE_ACCOUNT_ID/pages/projects/$ProjectName/domains" -Method Post -Headers $cfHeaders -Body $domainBody -ErrorAction Stop
        Write-Host "Successfully attached domain: $domain" -ForegroundColor Green
    } catch {
        Write-Host "Domain $domain might already be attached or threw an error: $_" -ForegroundColor Yellow
    }
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🚀 DEPLOYMENT AUTOMATION COMPLETE" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Cloudflare is now linked to your repository!"
Write-Host "To complete Phase 4B, please update Squarespace DNS settings with:"
Write-Host "  1. CNAME for 'www' -> $ProjectName.pages.dev"
Write-Host "  2. ALIAS/A records for '$DomainName' -> Follow Cloudflare Dashboard instructions."
