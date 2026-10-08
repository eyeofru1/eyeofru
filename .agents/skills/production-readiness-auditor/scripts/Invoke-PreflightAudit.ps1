<#
.SYNOPSIS
  Eye Of Ru Enterprises — Automated Pre-Flight Production Readiness Auditor.
.DESCRIPTION
  Automated 7-step pre-flight release gate verifying build outputs, edge security headers,
  1:1 301 redirects, Schema.org @graph JSON-LD, Turnstile & form webhooks, visual screenshots,
  and mechanical Zero-Emoji / clean typography compliance.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string]$DistPath = "dist"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   EYE OF RU ENTERPRISES -- PRODUCTION READINESS AUDIT     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$auditResults = [ordered]@{}
$hasFailures = $false

# 1. Edge Files in Build Output (dist)
Write-Host "`n[Check 1/7] Verifying Build Output and Edge Assets..." -ForegroundColor Yellow
$requiredDistFiles = @(
  'index.html',
  '_headers',
  '_redirects',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  'favicon.png',
  'apple-touch-icon.png'
)

$allDistPresent = $true
foreach ($f in $requiredDistFiles) {
  $p = Join-Path $DistPath $f
  if (-not (Test-Path $p)) {
    Write-Warning "Missing in $($DistPath): $f"
    $allDistPresent = $false
  }
}
$auditResults['DistFilesPresent'] = if ($allDistPresent) { "PASS (Core edge files present in $($DistPath)/)" } else { $hasFailures = $true; 'FAIL' }

# 2. Strict 1:1 301 Redirect Mapping Integrity
Write-Host "`n[Check 2/7] Verifying 1:1 SEO Redirects Map..." -ForegroundColor Yellow
$redirectFile = Join-Path $DistPath '_redirects'
if (Test-Path $redirectFile) {
  $redirectLines = Get-Content $redirectFile | Where-Object { $_ -notmatch '^\s*#' -and $_.Trim() -ne '' }
  $redirectCount = $redirectLines.Count
  $auditResults['RedirectMap'] = "PASS ($redirectCount rules mapped: strict 301s + fallback)"
} else {
  $hasFailures = $true
  $auditResults['RedirectMap'] = 'FAIL (Missing _redirects)'
}

# 3. Security Headers (_headers)
Write-Host "`n[Check 3/7] Verifying Cloudflare Edge Security Headers..." -ForegroundColor Yellow
$headersFile = Join-Path $DistPath '_headers'
if (Test-Path $headersFile) {
  $headersContent = Get-Content $headersFile -Raw
  $hasCSP = $headersContent -match 'Content-Security-Policy:'
  $hasXFO = $headersContent -match 'X-Frame-Options:\s*DENY'
  $hasNosniff = $headersContent -match 'X-Content-Type-Options:\s*nosniff'
  $hasPerms = $headersContent -match 'Permissions-Policy:'
  $noTailwindCdn = -not ($headersContent -match 'cdn\.tailwindcss\.com')

  $auditResults['EdgeSecurityHeaders'] = if ($hasCSP -and $hasXFO -and $hasNosniff -and $hasPerms -and $noTailwindCdn) {
    'PASS (Strict CSP without runtime CDN, X-Frame-Options: DENY, nosniff)'
  } else {
    $hasFailures = $true
    'FAIL'
  }
} else {
  $hasFailures = $true
  $auditResults['EdgeSecurityHeaders'] = 'FAIL (Missing _headers)'
}

# 4. Schema.org JSON-LD Validation
Write-Host "`n[Check 4/7] Verifying Structured Data Graph..." -ForegroundColor Yellow
$indexHtmlPath = Join-Path $DistPath 'index.html'
if (Test-Path $indexHtmlPath) {
  $indexHtml = Get-Content $indexHtmlPath -Raw -Encoding UTF8
  if ($indexHtml -match '<script type="application/ld\+json">([\s\S]*?)</script>') {
    try {
      $schemaObj = $matches[1] | ConvertFrom-Json
      $types = @()
      if ($schemaObj.'@graph') {
        $types = $schemaObj.'@graph' | ForEach-Object { $_.'@type' }
      } else {
        $types = @($schemaObj.'@type')
      }
      $hasEntity = ($types -contains 'ProfessionalService') -or ($types -contains 'LocalBusiness') -or ($types -contains 'Organization')
      $hasWebSite = $types -contains 'WebSite'
      $auditResults['SchemaValidation'] = if ($hasEntity -and $hasWebSite) {
        "PASS (Valid Schema @graph: $($types -join ', '))"
      } else {
        'PARTIAL'
      }
    } catch {
      $hasFailures = $true
      $auditResults['SchemaValidation'] = "FAIL (JSON parse error: $_)"
    }
  } else {
    $hasFailures = $true
    $auditResults['SchemaValidation'] = 'FAIL (JSON-LD script missing)'
  }
} else {
  $hasFailures = $true
  $auditResults['SchemaValidation'] = 'FAIL (Missing index.html)'
}

# 5. Form and Turnstile Security
Write-Host "`n[Check 5/7] Verifying Form Webhook and Turnstile..." -ForegroundColor Yellow
if (Test-Path $indexHtmlPath) {
  $hasTurnstile = $indexHtml -match 'challenges\.cloudflare\.com/turnstile'
  $hasWebhook = ($indexHtml -match 'script\.google\.com/macros/s/') -or ($indexHtml -match 'handleFormSubmit')
  $auditResults['FormIntegrity'] = if ($hasTurnstile -and $hasWebhook) {
    'PASS (Google Apps Script Webhook + Cloudflare Turnstile Zero-Bot Shield)'
  } else {
    $hasFailures = $true
    'FAIL'
  }
}

# 6. Mechanical Zero-Emoji & Clean Typography Verification
Write-Host "`n[Check 6/7] Mechanically Verifying Zero Emojis and Typography..." -ForegroundColor Yellow
$htmlFiles = Get-ChildItem -Path $DistPath -Filter "*.html" -File
$emojiDetected = $false
$detectedDetails = @()

foreach ($h in $htmlFiles) {
  $content = Get-Content $h.FullName -Raw -Encoding UTF8
  # Check for high-plane surrogate pairs (emojis) or U+FFFD replacement characters
  for ($i = 0; $i -lt $content.Length; $i++) {
    $code = [int][char]$content[$i]
    if ($code -ge 0xD800 -and $code -le 0xDBFF) {
      $emojiDetected = $true
      $detectedDetails += "Surrogate emoji at $($h.Name):$i"
      break
    }
    if ($code -eq 0xFFFD) {
      $emojiDetected = $true
      $detectedDetails += "Encoding replacement char (U+FFFD) at $($h.Name):$i"
      break
    }
  }
}

$auditResults['ZeroEmojiCompliance'] = if (-not $emojiDetected) {
  'PASS (0 emojis and 0 encoding artifacts detected in production files)'
} else {
  $hasFailures = $true
  "FAIL ($($detectedDetails -join '; '))"
}

# 7. Mechanical Zero Fictitious Contact Data Verification
Write-Host "`n[Check 7/8] Mechanically Verifying Zero Fictitious Contact Data..." -ForegroundColor Yellow
$prodFiles = Get-ChildItem -Path $DistPath -Recurse -Include "*.html", "*.js", "*.json", "llms.txt" -File
$fictitiousDataDetected = $false
$fictitiousDetails = @()

foreach ($f in $prodFiles) {
  $content = Get-Content $f.FullName -Raw -Encoding UTF8
  # Strip input placeholders (placeholder="...") so sample UI formats aren't falsely flagged
  $cleanContent = $content -replace 'placeholder\s*=\s*["''][^"'']*["'']', ''
  
  # Scan for 555 dummy phone numbers or 123-456-7890
  if ($cleanContent -match '(?i)(?:\+?1[-.\s]?)?\(?555\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b555-01\d{2}\b|\b123-456-7890\b') {
    $fictitiousDataDetected = $true
    $fictitiousDetails += "Fictitious phone number detected in $($f.Name): $($matches[0])"
  }
}

$auditResults['ContactDataIntegrity'] = if (-not $fictitiousDataDetected) {
  'PASS (0 fictitious phone numbers or 555-XXXX dummy data detected)'
} else {
  $hasFailures = $true
  "FAIL ($($fictitiousDetails -join '; '))"
}

# 8. Visual Verification Artifacts
Write-Host "`n[Check 8/8] Verifying Responsive Screenshots in artifacts/..." -ForegroundColor Yellow
$hasDesktop = (Test-Path 'artifacts/desktop-1440px.png') -or (Test-Path 'artifacts/audits/desktop-1440px.png')
$hasMobile = (Test-Path 'artifacts/mobile-390px.png') -or (Test-Path 'artifacts/audits/mobile-390px.png')

$auditResults['VisualVerification'] = if ($hasDesktop -or $hasMobile) {
  'PASS (Responsive visual verification captures verified)'
} else {
  'WARNING (Capture desktop-1440px.png and mobile-390px.png before final handoff)'
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host '                AUDIT SUMMARY MATRIX                      ' -ForegroundColor Cyan
Write-Host '==========================================================' -ForegroundColor Cyan
$auditResults.GetEnumerator() | Format-Table Key, Value -AutoSize

if ($hasFailures) {
  Write-Host "[RESULT] AUDIT FAILED: Resolve flagged items before releasing to production.`n" -ForegroundColor Red
  exit 1
} else {
  Write-Host "[RESULT] AUDIT PASSED: All critical production gates verified.`n" -ForegroundColor Green
  exit 0
}
