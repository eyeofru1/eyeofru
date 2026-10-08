Write-Host "1. Loading credentials securely..."
$envFile = Join-Path $HOME ".gemini\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match '^([^#=]+)=(.*)$' } | ForEach-Object {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($value -match '^"(.*)"$') { $value = $matches[1] }
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

if (-not $env:GITHUB_TOKEN) {
    Write-Host "ERROR: GITHUB_TOKEN not found in vault." -ForegroundColor Red
    exit 1
}

$env:GH_TOKEN = $env:GITHUB_TOKEN
$ghPath = "C:\Users\forth\.gemini\antigravity\brain\8c48778b-8495-458e-a4cd-738f4c3eb5bf\scratch\bin\gh.exe"

Write-Host "2. Creating GitHub Repository 'eyeofru'..."
& $ghPath auth status
& $ghPath repo create "eyeofru" --public --source="." --remote="origin" 2>$null

Write-Host "3. Setting Git config..."
git config --global user.email "deploy@eyeofru.com"
git config --global user.name "Deployment Agent"

Write-Host "4. Adding Cloudflare API keys to GitHub Secrets..."
& $ghPath secret set CLOUDFLARE_API_TOKEN --body "$env:CLOUDFLARE_API_TOKEN"
& $ghPath secret set CLOUDFLARE_ACCOUNT_ID --body "$env:CLOUDFLARE_ACCOUNT_ID"

Write-Host "5. Setting up authenticated Git Remote and Pushing..."
$ghUsername = & $ghPath api user -q .login
Write-Host "Authenticated as GitHub User: $ghUsername"

git remote set-url origin "https://x-access-token:$($env:GITHUB_TOKEN)@github.com/$ghUsername/eyeofru.git"

git add .
git commit -m "chore: initial automated deployment"
git push -u origin main

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🚀 GITHUB DEPLOYMENT COMPLETE" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
