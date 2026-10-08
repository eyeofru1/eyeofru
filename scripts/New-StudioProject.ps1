<#
.SYNOPSIS
    Automated scaffolding engine for Eye Of Ru Enterprises & Antigravity projects.
    Provisions fresh projects with isolated rules, assigned ports, and zero data bleed.

.PARAMETER Name
    The project directory and repository name (e.g. "lead-command-center", "acme-plumbing").

.PARAMETER Type
    Project archetype: "ClientWeb" (Marketing/Rebuild), "App" (Dashboard/SaaS), or "Tool" (CLI/Utility).

.PARAMETER Port
    Optional explicit port. If omitted, checks or assigns next port from ~/.gemini/ports.json.

.EXAMPLE
    .\New-StudioProject.ps1 -Name "lead-command-center" -Type "App"
    .\New-StudioProject.ps1 -Name "client-summit-roofing" -Type "ClientWeb"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Name,

    [Parameter(Mandatory = $true, Position = 1)]
    [ValidateSet("ClientWeb", "App", "Tool")]
    [string]$Type,

    [Parameter(Mandatory = $false)]
    [int]$Port = 0,

    [Parameter(Mandatory = $false)]
    [string]$BaseDir = "C:\Users\forth\Documents\antigravity"
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   EYE OF RU ENTERPRISES -- PROJECT SCAFFOLDING ENGINE    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Resolve Target Directory
$targetDir = Join-Path $BaseDir $Name
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "[+] Created project directory: $targetDir" -ForegroundColor Green
} else {
    Write-Host "[!] Target directory already exists: $targetDir" -ForegroundColor Yellow
}

# 2. Port Allocation Management (~/.gemini/ports.json)
$portsJsonPath = Join-Path $env:USERPROFILE ".gemini\ports.json"
$assignedPort = $Port

if (Test-Path $portsJsonPath) {
    try {
        $portsData = Get-Content $portsJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
        $allocations = $portsData.allocations

        if ($assignedPort -eq 0) {
            # Check if this project already has an assigned port
            $existing = $allocations.PSObject.Properties | Where-Object { $_.Name -eq $Name }
            if ($existing) {
                $assignedPort = [int]$existing.Value
                Write-Host "[*] Found existing port allocation for '$Name': $assignedPort" -ForegroundColor Cyan
            } else {
                # Determine next open port in defaultRange
                $startPort = if ($portsData.defaultRange.start) { [int]$portsData.defaultRange.start } else { 3000 }
                $usedPorts = @($allocations.PSObject.Properties | ForEach-Object { [int]$_.Value })
                
                $candidate = $startPort
                while ($usedPorts -contains $candidate) {
                    $candidate += 50 # spaced allocations
                }
                $assignedPort = $candidate

                # Record new allocation in ports.json
                $allocations | Add-Member -MemberType NoteProperty -Name $Name -Value $assignedPort -Force
                $portsData | ConvertTo-Json -Depth 5 | Set-Content -Path $portsJsonPath -Encoding UTF8
                Write-Host "[+] Assigned new port for '$Name' in ports.json: $assignedPort" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "[!] Warning: Could not parse ports.json. Using fallback port 3000." -ForegroundColor Yellow
        if ($assignedPort -eq 0) { $assignedPort = 3000 }
    }
} else {
    if ($assignedPort -eq 0) { $assignedPort = 3000 }
}

# 3. Create Clean Folder Tree
$subDirs = @(
    ".agents\rules",
    "artifacts",
    "scratch",
    "content",
    "src"
)
foreach ($sub in $subDirs) {
    $p = Join-Path $targetDir $sub
    if (-not (Test-Path $p)) {
        New-Item -ItemType Directory -Path $p -Force | Out-Null
    }
}
Write-Host "[+] Initialized directory structure (.agents/rules, artifacts, content, src)" -ForegroundColor Green

# 4. Copy Universal Studio Core Rules (Tier 1)
$studioRulesDir = "C:\Users\forth\Documents\antigravity\friendly-nobel\.agents\rules"
$universalRules = @(
    "code-integrity.md",
    "windows-shell.md",
    "universal-credentials.md",
    "user-preferences.md",
    "port-allocation.md"
)

if ($Type -eq "ClientWeb") {
    $universalRules += @(
        "web-production-standards.md",
        "cloudflare-pages-deployment.md",
        "client-handoff-protocol.md",
        "copywriting-confirmation.md"
    )
}

foreach ($r in $universalRules) {
    $srcFile = Join-Path $studioRulesDir $r
    $dstFile = Join-Path (Join-Path $targetDir ".agents\rules") $r
    if (Test-Path $srcFile) {
        Copy-Item -Path $srcFile -Destination $dstFile -Force
    }
}
Write-Host "[+] Injected Tier 1 Core Studio Rules into .agents/rules/" -ForegroundColor Green

# 5. Generate Tailored GEMINI.md (Method 2 Profile)
$templateMap = @{
    "ClientWeb" = "C:\Users\forth\Documents\antigravity\friendly-nobel\docs\templates\GEMINI-CLIENT-WEB.md"
    "App"       = "C:\Users\forth\Documents\antigravity\friendly-nobel\docs\templates\GEMINI-APP-DASHBOARD.md"
    "Tool"      = "C:\Users\forth\Documents\antigravity\friendly-nobel\docs\templates\GEMINI-APP-DASHBOARD.md"
}

$templatePath = $templateMap[$Type]
if (Test-Path $templatePath) {
    $geminiContent = Get-Content $templatePath -Raw -Encoding UTF8
    $geminiContent = $geminiContent -replace '\[PROJECT_NAME\]', $Name
    $geminiContent = $geminiContent -replace '\[PORT_NUMBER\]', $assignedPort
    
    $destGemini = Join-Path $targetDir "GEMINI.md"
    Set-Content -Path $destGemini -Value $geminiContent -Encoding UTF8
    Write-Host "[+] Generated tailored GEMINI.md profile ($Type) on port $assignedPort" -ForegroundColor Green
}

# 6. Generate Clean, Zero-Bleed content/data.json
$dataJsonPath = Join-Path (Join-Path $targetDir "content") "data.json"
if (-not (Test-Path $dataJsonPath)) {
    if ($Type -eq "ClientWeb") {
        $cleanData = @{
            client = @{
                id = $Name
                name = $Name
                dba = ""
                legalEntity = ""
                phone = $null
                email = "contact@$Name.com"
                address = $null
                hours = $null
            }
            brand = @{
                tagline = ""
                valueProposition = ""
                palette = @{
                    primary = "#0f172a"
                    secondary = "#475569"
                    accent = "#92400e"
                }
                themeDefault = "dark"
            }
            services = @()
            testimonials = @()
            dispatches = @()
            faqs = @()
        }
    } else {
        $cleanData = @{
            app = @{
                id = $Name
                name = $Name
                port = $assignedPort
                mode = "operational_dashboard"
                environment = "development"
            }
            endpoints = @{
                webhookUrl = ""
                streamUrl = ""
            }
            telemetry = @{
                refreshIntervalMs = 15000
                activeFilters = @("All", "Pending", "Verified")
            }
        }
    }

    $cleanData | ConvertTo-Json -Depth 5 | Set-Content -Path $dataJsonPath -Encoding UTF8
    Write-Host "[+] Injected pristine, zero-bleed content/data.json template" -ForegroundColor Green
}

# 7. Generate .gitignore & README.md
$gitignorePath = Join-Path $targetDir ".gitignore"
if (-not (Test-Path $gitignorePath)) {
    $giContent = @"
node_modules/
dist/
.venv/
.env
.env.local
scratch/
artifacts/*.png
artifacts/*.pdf
"@
    Set-Content -Path $gitignorePath -Value $giContent -Encoding UTF8
}

$readmePath = Join-Path $targetDir "README.md"
if (-not (Test-Path $readmePath)) {
    $rmContent = @"
# $Name

* **Archetype**: $Type
* **Port**: $assignedPort (see `~/.gemini/ports.json`)
* **Standard**: Eye Of Ru Enterprises Studio Operating Rules (`GEMINI.md`)
"@
    Set-Content -Path $readmePath -Value $rmContent -Encoding UTF8
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " [SUCCESS] $Name initialized successfully!" -ForegroundColor Green
Write-Host " Path: $targetDir" -ForegroundColor Cyan
Write-Host " Port: $assignedPort" -ForegroundColor Cyan
Write-Host " Type: $Type (Tailored GEMINI.md active)" -ForegroundColor Cyan
Write-Host " Zero foreign data: Ready for development." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
