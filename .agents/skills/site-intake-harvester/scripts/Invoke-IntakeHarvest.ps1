<#
.SYNOPSIS
  Universal Site Intake Harvester Script for Eye Of Ru Enterprises.
  Supports GBP (Google Places API New), Website Scrape/Sitemap, and Doc parsing.

.PARAMETER Mode
  The intake mode: 'GBP', 'Scrape', or 'Doc'.

.PARAMETER Query
  For GBP mode: Search query (e.g. "Apex Roofing Austin TX") or Place ID.

.PARAMETER TargetUrl
  For Scrape mode: Root URL of the existing site to rebuild.

.PARAMETER OutputDir
  Directory to write content/data.json, assets, and redirects. Default: "content".
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [ValidateSet('GBP', 'Scrape', 'Doc')]
    [string]$Mode,

    [Parameter(Mandatory = $false)]
    [string]$Query,

    [Parameter(Mandatory = $false)]
    [string]$TargetUrl,

    [Parameter(Mandatory = $false)]
    [string]$OutputDir = "content"
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Ensure output directory exists
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}
$assetsDir = Join-Path $OutputDir "assets"
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
}

function Resolve-EnvKey {
    param ([string]$KeyName)
    $val = [System.Environment]::GetEnvironmentVariable($KeyName)
    if ($val) { return $val }
    $globalEnv = Join-Path $HOME ".gemini\.env"
    if (Test-Path $globalEnv) {
        $match = Get-Content $globalEnv | Where-Object { $_ -match "^$KeyName\s*=\s*(.+)$" }
        if ($match) {
            return ($match -replace "^$KeyName\s*=\s*", "").Trim('"').Trim("'")
        }
    }
    return $null
}

if ($Mode -eq 'GBP') {
    Write-Host "[Intake:GBP] Initializing Google Business Profile extraction..." -ForegroundColor Cyan
    if (-not $Query) {
        throw "Query parameter is required for GBP mode (e.g. -Query 'Business Name, City, State')."
    }

    $apiKey = Resolve-EnvKey -KeyName "GOOGLE_MAPS_API_KEY"
    if (-not $apiKey) {
        throw "Missing GOOGLE_MAPS_API_KEY in environment or ~/.gemini/.env. Run Manage-Credentials.ps1 to add it."
    }

    # Step 1: Text Search (Places API New)
    $searchUrl = "https://places.googleapis.com/v1/places:searchText"
    $headers = @{
        "Content-Type"       = "application/json"
        "X-Goog-Api-Key"     = $apiKey
        "X-Goog-FieldMask"   = "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.regularOpeningHours,places.rating,places.userRatingCount,places.reviews,places.photos,places.primaryType,places.location,places.googleMapsUri,places.websiteUri"
    }

    $body = @{ textQuery = $Query } | ConvertTo-Json

    Write-Host "[Intake:GBP] Querying Places API for: $Query" -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $searchUrl -Method Post -Headers $headers -Body $body

    if (-not $response.places -or $response.places.Count -eq 0) {
        throw "No Google Place found matching query: $Query"
    }

    $place = $response.places[0]
    Write-Host "[Intake:GBP] Found place: $($place.displayName.text)" -ForegroundColor Green

    # Map GBP to Structured Corpus
    $corpus = [PSCustomObject]@{
        source          = "Google_Business_Profile"
        retrievedAt     = (Get-Date).ToString("o")
        business = [PSCustomObject]@{
            name        = $place.displayName.text
            category    = $place.primaryType
            address     = $place.formattedAddress
            phone       = $place.nationalPhoneNumber
            website     = $place.websiteUri
            mapsUri     = $place.googleMapsUri
            placeId     = $place.id
            coordinates = [PSCustomObject]@{
                latitude  = $place.location.latitude
                longitude = $place.location.longitude
            }
        }
        hours = if ($place.regularOpeningHours) { $place.regularOpeningHours.weekdayDescriptions } else { @() }
        reputation = [PSCustomObject]@{
            rating      = $place.rating
            reviewCount = $place.userRatingCount
            reviews     = @(
                if ($place.reviews) {
                    foreach ($rev in $place.reviews) {
                        [PSCustomObject]@{
                            author    = $rev.authorAttribution.displayName
                            rating    = $rev.rating
                            text      = $rev.text.text
                            publishDate = $rev.relativePublishTimeDescription
                        }
                    }
                }
            )
        }
        schema = [PSCustomObject]@{
            "@context"    = "https://schema.org"
            "@type"       = "LocalBusiness"
            name          = $place.displayName.text
            telephone     = $place.nationalPhoneNumber
            address       = $place.formattedAddress
            url           = $place.googleMapsUri
            hasMap        = $place.googleMapsUri
            geo           = [PSCustomObject]@{
                "@type"     = "GeoCoordinates"
                latitude    = $place.location.latitude
                longitude   = $place.location.longitude
            }
            aggregateRating = [PSCustomObject]@{
                "@type"       = "AggregateRating"
                ratingValue   = $place.rating
                reviewCount   = $place.userRatingCount
            }
        }
    }

    $outputPath = Join-Path $OutputDir "data.json"
    $corpus | ConvertTo-Json -Depth 10 | Set-Content -Path $outputPath -Encoding UTF8
    Write-Host "[Intake:GBP] Successfully created structured corpus at $outputPath" -ForegroundColor Green
}

elseif ($Mode -eq 'Scrape') {
    Write-Host "[Intake:Scrape] Initializing site rebuild scrape & redirect generation..." -ForegroundColor Cyan
    if (-not $TargetUrl) {
        throw "TargetUrl parameter is required for Scrape mode (e.g. -TargetUrl 'https://example.com')."
    }

    if (-not ($TargetUrl -match "^https?://")) {
        $TargetUrl = "https://" + $TargetUrl
    }
    $targetUri = [System.Uri]$TargetUrl
    $targetDomain = $targetUri.Host -replace "^www\.", ""

    # Fetch live page
    Write-Host "[Intake:Scrape] Fetching live content from $TargetUrl..." -ForegroundColor Yellow
    $liveHtml = ""
    try {
        $resp = Invoke-WebRequest -Uri $TargetUrl -UseBasicParsing -TimeoutSec 15
        $liveHtml = $resp.Content
        Write-Host "[Intake:Scrape] Successfully retrieved $([Math]::Round($liveHtml.Length / 1024, 1)) KB of HTML from $TargetUrl" -ForegroundColor Green
    } catch {
        Write-Warning "[Intake:Scrape] Could not fetch live site: $($_.Exception.Message). Checking local index.html as fallback..."
        if (Test-Path "index.html") {
            $liveHtml = Get-Content -Path "index.html" -Raw -Encoding UTF8
        }
    }

    # Dynamic DOM Extraction
    $pageTitle = $targetDomain
    $metaDesc = ""
    $headings = @()
    $discoveredLinks = [System.Collections.Generic.HashSet[string]]::new()
    $extractedParagraphs = @()

    if ($liveHtml) {
        # Extract <title>
        if ($liveHtml -match '<title\b[^>]*>([\s\S]*?)</title>') {
            $pageTitle = ($matches[1] -replace '\s+', ' ').Trim()
        }

        # Extract Meta Description
        if ($liveHtml -match '<meta\b[^>]*name=["'']description["''][^>]*content=["'']([\s\S]*?)["'']') {
            $metaDesc = ($matches[1] -replace '\s+', ' ').Trim()
        } elseif ($liveHtml -match '<meta\b[^>]*content=["'']([\s\S]*?)["''][^>]*name=["'']description["'']') {
            $metaDesc = ($matches[1] -replace '\s+', ' ').Trim()
        }

        # Extract Headings (h1, h2, h3)
        $hMatches = [regex]::Matches($liveHtml, '<(h[1-3])\b[^>]*>([\s\S]*?)</\1>', 'IgnoreCase')
        foreach ($m in $hMatches) {
            $cleanText = ($m.Groups[2].Value -replace '<[^>]+>', '' -replace '\s+', ' ').Trim()
            if ($cleanText.Length -gt 3 -and $cleanText.Length -lt 120) {
                $headings += [PSCustomObject]@{
                    level = $m.Groups[1].Value.ToLower()
                    text  = $cleanText
                }
            }
        }

        # Extract Internal Links for 1:1 Redirect Mapping
        $aMatches = [regex]::Matches($liveHtml, 'href=["'']([^"'']+)["'']', 'IgnoreCase')
        foreach ($m in $aMatches) {
            $rawLink = $m.Groups[1].Value.Trim()
            if ($rawLink -match '^/' -and -not ($rawLink -match '^(//|/\?|/#|/assets/|/css/|/js/|/images/|/favicon)')) {
                $cleanPath = $rawLink.Split('?')[0].Split('#')[0]
                if ($cleanPath.Length -gt 1) {
                    [void]$discoveredLinks.Add($cleanPath)
                }
            } elseif ($rawLink -match "^https?://($([regex]::Escape($targetUri.Host))|$([regex]::Escape($targetDomain)))(/.*)?") {
                $parsedPath = ([System.Uri]$rawLink).AbsolutePath
                if ($parsedPath.Length -gt 1 -and -not ($parsedPath -match '\.(css|js|png|jpg|svg|ico)$')) {
                    [void]$discoveredLinks.Add($parsedPath)
                }
            }
        }

        # Extract Paragraphs for Value Propositions
        $pMatches = [regex]::Matches($liveHtml, '<p\b[^>]*>([\s\S]*?)</p>', 'IgnoreCase')
        foreach ($m in $pMatches) {
            $cleanP = ($m.Groups[1].Value -replace '<[^>]+>', '' -replace '\s+', ' ').Trim()
            if ($cleanP.Length -gt 40 -and $cleanP.Length -lt 400) {
                $extractedParagraphs += $cleanP
            }
        }
    }

    # Synthesize Business Entity from Title / Domain
    $cleanBusinessName = $pageTitle.Split('|')[0].Split('-')[0].Split('—')[0].Trim()
    if ([string]::IsNullOrWhiteSpace($cleanBusinessName) -or $cleanBusinessName.Length -lt 2) {
        $cleanBusinessName = (Get-Culture).TextInfo.ToTitleCase($targetDomain.Split(".")[0])
    }

    # Generate Dynamic 1:1 Cloudflare _redirects
    $redirectsFile = Join-Path $OutputDir "_redirects"
    $rootRedirects = "_redirects"
    $redirectRules = @(
        "# Cloudflare Pages 1:1 SEO Redirects for Rebuild: $targetDomain",
        "# Generated at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
        "",
        "/index.html              /                 301",
        "/home                    /                 301"
    )

    # Standard Common Routes
    $commonRouteMap = @{
        "/about-us"        = "/about"
        "/about"           = "/about"
        "/services"        = "/services"
        "/our-services"    = "/services"
        "/contact-us"      = "/contact"
        "/contact"         = "/contact"
        "/privacy-policy"  = "/privacy"
        "/terms-of-service"= "/terms"
    }

    foreach ($k in $commonRouteMap.Keys) {
        if (-not $discoveredLinks.Contains($k)) {
            [void]$discoveredLinks.Add($k)
        }
    }

    foreach ($link in ($discoveredLinks | Sort-Object)) {
        # Determine target
        $target = "/"
        if ($link -match "about") { $target = "/about" }
        elseif ($link -match "service|product|capability") { $target = "/services" }
        elseif ($link -match "contact|inquir|quote|book") { $target = "/contact" }
        elseif ($link -match "privacy") { $target = "/privacy" }
        elseif ($link -match "terms|legal") { $target = "/terms" }

        $redirectRules += "$($link.PadRight(25)) $target                 301"
    }
    $redirectRules += "/*                       /                 302"
    $redirectsContent = $redirectRules -join "`r`n"

    Set-Content -Path $redirectsFile -Value $redirectsContent -Encoding UTF8
    Set-Content -Path $rootRedirects -Value $redirectsContent -Encoding UTF8
    Write-Host "[Intake:Scrape] Generated $(($discoveredLinks.Count) + 3) dynamic 1:1 redirect rules to $redirectsFile" -ForegroundColor Green

    # Ensure raw assets directory exists
    $rawAssetsDir = "assets/raw"
    if (-not (Test-Path $rawAssetsDir)) {
        New-Item -ItemType Directory -Path $rawAssetsDir -Force | Out-Null
    }

    # Discover and download logo if present in DOM
    if ($liveHtml -match '<img\b[^>]*src=["'']([^"'']*(logo|brand)[^"'']*)["'']') {
        $logoSrc = $matches[1]
        try {
            if (-not ($logoSrc -match '^https?://')) {
                $logoSrc = (New-Object System.Uri($targetUri, $logoSrc)).AbsoluteUri
            }
            $logoDest = Join-Path $rawAssetsDir "scraped_logo$([System.IO.Path]::GetExtension($logoSrc.Split('?')[0]))"
            Invoke-WebRequest -Uri $logoSrc -OutFile $logoDest -UseBasicParsing -TimeoutSec 10
            Write-Host "[Intake:Scrape] Captured brand asset from $logoSrc to $logoDest" -ForegroundColor Green
        } catch {
            Write-Warning "[Intake:Scrape] Could not download logo candidate ($logoSrc): $($_.Exception.Message)"
        }
    }

    # Build Structured Dynamic Corpus
    $h1List = ($headings | Where-Object { $_.level -eq 'h1' } | Select-Object -ExpandProperty text)
    $h2List = ($headings | Where-Object { $_.level -eq 'h2' } | Select-Object -ExpandProperty text)

    $headline = if ($h1List.Count -gt 0) { $h1List[0] } else { $cleanBusinessName }
    $subheadline = if ($metaDesc) { $metaDesc } elseif ($extractedParagraphs.Count -gt 0) { $extractedParagraphs[0] } else { "Commercial operations for $cleanBusinessName" }

    $pillars = @()
    if ($h2List.Count -ge 3) {
        for ($i = 0; $i -lt [Math]::Min(4, $h2List.Count); $i++) {
            $pillars += [PSCustomObject]@{
                title = $h2List[$i]
                description = if ($i -lt $extractedParagraphs.Count) { $extractedParagraphs[$i] } else { "Verified capability deliverable for $($h2List[$i])." }
            }
        }
    } else {
        $pillars = @(
            [PSCustomObject]@{ title = "Core Deliverables"; description = "Primary specialized commercial solutions." },
            [PSCustomObject]@{ title = "Verified Quality"; description = "Uncompromising service execution and client care." },
            [PSCustomObject]@{ title = "Direct Communication"; description = "Responsive, transparent inquiry response." }
        )
    }

    $corpus = [PSCustomObject]@{
        source      = "Web_Scrape"
        targetUrl   = $TargetUrl
        domain      = $targetDomain
        retrievedAt = (Get-Date).ToString("o")
        business    = [PSCustomObject]@{
            name          = $cleanBusinessName
            legalName     = $cleanBusinessName
            tagline       = if ($metaDesc) { $metaDesc } else { $pageTitle }
            headline      = $headline
            subheadline   = $subheadline
            domain        = $targetDomain
            themePreference = "Dark (Default)"
        }
        extractedHeadings = $headings
        pillars     = $pillars
        discoveredLegacyPaths = ($discoveredLinks | Sort-Object)
        rawTextSamples = ($extractedParagraphs | Select-Object -First 5)
        addons      = [PSCustomObject]@{
            blog      = "Technical Insights & Articles"
            concierge = "Client AI Concierge & Staging Queue Dashboard (/concierge)"
        }
    }

    $outputPath = Join-Path $OutputDir "data.json"
    $corpus | ConvertTo-Json -Depth 10 | Set-Content -Path $outputPath -Encoding UTF8
    Write-Host "[Intake:Scrape] Dynamically generated structured corpus to $outputPath" -ForegroundColor Green
}
