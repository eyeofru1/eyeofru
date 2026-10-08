<#
.SYNOPSIS
    Antigravity Staging Queue Triage & Verification CLI
    Synchronizes, inspects, and actions AI Concierge staging proposals from the Google Sheet ledger.

.DESCRIPTION
    Pulls proposals from the master webhook, renders colorized terminal diffs,
    and supports approval/deployment, 2-step phone verification flagging, and rejection.

.EXAMPLE
    .\scripts\Sync-StagingQueue.ps1
    .\scripts\Sync-StagingQueue.ps1 -ClientName "Eye Of Ru Enterprises"
#>

[CmdletBinding()]
param(
    [string]$ClientName = "Eye Of Ru Enterprises",
    [string]$WebhookUrl = "https://script.google.com/macros/s/AKfycbxd4tTo4oWLRYo-j6w3M0Lbz0qCUPIckDxcn_uqimr7VAPf8IeiqeNXBmau_o91kWztzg/exec"
)

$ErrorActionPreference = "Stop"

function Write-Header {
    Clear-Host
    Write-Host "==========================================================================" -ForegroundColor DarkYellow
    Write-Host "       EYE OF RU ENTERPRISES — AI CONCIERGE STAGING QUEUE TRIAGE          " -ForegroundColor Yellow -NoNewline
    Write-Host " [AIR-GAPPED]" -ForegroundColor Green
    Write-Host "==========================================================================" -ForegroundColor DarkYellow
    Write-Host " Target Client : $ClientName" -ForegroundColor Cyan
    Write-Host " Webhook URL   : $WebhookUrl" -ForegroundColor DarkGray
    Write-Host " Synchronized  : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray
    Write-Host "==========================================================================`n" -ForegroundColor DarkYellow
}

Write-Header
Write-Host "Fetching staging queue proposals from Google Apps Script..." -ForegroundColor Cyan

try {
    $uri = "$WebhookUrl?action=GET_STAGING_QUEUE&clientName=$([System.Uri]::EscapeDataString($ClientName))"
    $response = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 15
} catch {
    Write-Host "Failed to reach Google Apps Script webhook: $_" -ForegroundColor Red
    Write-Host "Verify internet connectivity or webhook URL." -ForegroundColor DarkGray
    exit 1
}

if (-not $response -or -not $response.items -or $response.items.Count -eq 0) {
    Write-Host "No proposals found in the staging queue for '$ClientName'." -ForegroundColor Green
    Write-Host "Queue is 100% clean and up to date." -ForegroundColor DarkGreen
    exit 0
}

function Test-IsUrgentProposal($proposal) {
    $text = "$($proposal.status) $($proposal.targetSection) $($proposal.field) $($proposal.proposedValue) $($proposal.clientRationale) $($proposal.operatorNotes)"
    return ($text -match "(?i)(EXPEDITED|tomorrow|urgent|24H\s*SLA|ASAP)")
}

$allItems = $response.items
$pendingItems = $allItems | Where-Object { 
    $_.status -in @("PENDING_REVIEW", "UNDER_REVIEW", "REQUIRES_2STEP", "EXPEDITED", "EXPEDITED_SLA") 
} | Sort-Object {
    # Surface urgent / expedited proposals at the top of the queue (0 before 1)
    if (Test-IsUrgentProposal $_) { 0 } else { 1 }
}

Write-Host "Total Queue Items : $($allItems.Count)" -ForegroundColor Gray
Write-Host "Pending Action    : $($pendingItems.Count)" -ForegroundColor Yellow
$urgentCount = ($pendingItems | Where-Object { Test-IsUrgentProposal $_ }).Count
if ($urgentCount -gt 0) {
    Write-Host "Urgent 24H SLA    : $urgentCount (prioritized at top of queue)" -ForegroundColor Red
}
Write-Host "--------------------------------------------------------------------------`n" -ForegroundColor DarkGray

if ($pendingItems.Count -eq 0) {
    Write-Host "All staged items have been resolved or deployed!" -ForegroundColor Green
    Write-Host "`nRecent History Summary:" -ForegroundColor DarkCyan
    $allItems | Select-Object -Last 5 | ForEach-Object {
        $color = if ($_.status -eq "DEPLOYED") { "Green" } elseif ($_.status -eq "REJECTED") { "DarkGray" } else { "Yellow" }
        Write-Host " • [$($_.status)] $($_.targetSection) › $($_.field) ($($_.timestamp))" -ForegroundColor $color
    }
    exit 0
}

$counter = 0
foreach ($item in $pendingItems) {
    $counter++
    $isUrgent = Test-IsUrgentProposal $item

    Write-Header
    Write-Host "Proposal $counter of $($pendingItems.Count)" -ForegroundColor White -NoNewline
    Write-Host "  (Row index in Sheet: $($item.rowIndex))" -ForegroundColor DarkGray
    Write-Host "--------------------------------------------------------------------------" -ForegroundColor DarkGray

    # Illuminated Urgent 24H SLA Banner & Drive Asset Instructions
    if ($isUrgent) {
        Write-Host "`n==========================================================================" -ForegroundColor Red
        Write-Host " [🔥 URGENT 24H SLA: NEEDED BY TOMORROW] " -ForegroundColor White -BackgroundColor DarkRed
        Write-Host " PRIORITY: EXPEDITED PHOTO / ASSET REPLACEMENT REQUIRED WITHIN 24 HOURS  " -ForegroundColor Yellow -BackgroundColor DarkRed
        Write-Host "==========================================================================" -ForegroundColor Red
        Write-Host " [ACTION REQUIRED FOR DEVELOPER / OPERATOR]:" -ForegroundColor Yellow
        Write-Host "  1. Open Google Drive: Eye Of Ru Enterprises / Clients / $ClientName / 02_Brand Assets & Media" -ForegroundColor Cyan
        Write-Host "  2. Pull the newly uploaded client raw photo(s) from Drive." -ForegroundColor White
        Write-Host "  3. Compress & convert images to high-performance WebP format." -ForegroundColor White
        Write-Host "  4. Place converted files into assets/ or public/ and update component references." -ForegroundColor White
        Write-Host "  5. Build & deploy to Cloudflare Pages edge, then verify live diff." -ForegroundColor White
        Write-Host "--------------------------------------------------------------------------" -ForegroundColor Red
    }

    # Status formatting
    switch ($item.status) {
        "REQUIRES_2STEP" {
            Write-Host "`n[!] CRITICAL: 2-STEP CLIENT VERIFICATION REQUIRED" -ForegroundColor White -BackgroundColor DarkRed
            Write-Host "    Agency engineering must call the client to confirm before release!" -ForegroundColor Red
            if ($item.operatorNotes) {
                Write-Host "    Trigger notes: $($item.operatorNotes)" -ForegroundColor DarkRed
            }
        }
        "EXPEDITED" {
            Write-Host "`n[🔥] STATUS: EXPEDITED 24H SLA (TURNAROUND BY TOMORROW)" -ForegroundColor White -BackgroundColor DarkRed
        }
        "EXPEDITED_SLA" {
            Write-Host "`n[🔥] STATUS: EXPEDITED 24H SLA (TURNAROUND BY TOMORROW)" -ForegroundColor White -BackgroundColor DarkRed
        }
        "UNDER_REVIEW" {
            Write-Host "`n[*] STATUS: Currently Under Review by Operator" -ForegroundColor DarkYellow
        }
        default {
            if ($isUrgent) {
                Write-Host "`n[🔥] STATUS: Expedited Review (Flagged for Turnaround by Tomorrow)" -ForegroundColor Yellow
            } else {
                Write-Host "`n[*] STATUS: Pending Engineering Review" -ForegroundColor Yellow
            }
        }
    }

    Write-Host "`n• Component Target : " -NoNewline -ForegroundColor DarkGray
    Write-Host "$($item.targetSection) " -ForegroundColor Cyan -NoNewline
    Write-Host "› $($item.field)" -ForegroundColor White

    Write-Host "• Staged By        : " -NoNewline -ForegroundColor DarkGray
    Write-Host "$($item.submittedBy)" -ForegroundColor White

    Write-Host "• Timestamp        : " -NoNewline -ForegroundColor DarkGray
    Write-Host "$($item.timestamp)" -ForegroundColor White

    Write-Host "• Client Rationale : " -NoNewline -ForegroundColor DarkGray
    Write-Host "$($item.clientRationale)" -ForegroundColor DarkCyan

    if ($item.operatorNotes) {
        Write-Host "• Operator Notes   : " -NoNewline -ForegroundColor DarkGray
        Write-Host "$($item.operatorNotes)" -ForegroundColor Yellow
    }

    Write-Host "`n--- DIFF COMPARISON ------------------------------------------------------" -ForegroundColor DarkYellow

    Write-Host "[CURRENT BASELINE]" -ForegroundColor Red
    Write-Host $item.currentValue -ForegroundColor DarkRed

    Write-Host "`n[PROPOSED MODIFICATION]" -ForegroundColor Green
    Write-Host $item.proposedValue -ForegroundColor DarkGreen

    Write-Host "--------------------------------------------------------------------------" -ForegroundColor DarkYellow

    # Prompt Operator
    Write-Host "`nAvailable Actions:" -ForegroundColor White
    Write-Host " [A] Approve & Mark DEPLOYED (triggers automated client confirmation email)" -ForegroundColor Green
    Write-Host " [E] Mark EXPEDITED 24H SLA (flags urgent turnaround in sheet)" -ForegroundColor DarkYellow
    Write-Host " [2] Flag for 2-STEP PHONE VERIFICATION (marks REQUIRES_2STEP)" -ForegroundColor Magenta
    Write-Host " [U] Mark UNDER_REVIEW (investigating architectural impact)" -ForegroundColor DarkYellow
    Write-Host " [R] Reject proposal (logs reason in sheet)" -ForegroundColor Red
    Write-Host " [S] Skip to next item" -ForegroundColor Gray
    Write-Host " [Q] Quit triage CLI`n" -ForegroundColor DarkGray

    $action = Read-Host "Select operator action [A / E / 2 / U / R / S / Q]"

    switch ($action.ToUpper().Trim()) {
        "A" {
            Write-Host "`nMarking as DEPLOYED and notifying client..." -ForegroundColor Green
            $payload = @{
                action        = "UPDATE_STAGING_STATUS"
                clientName    = $ClientName
                rowIndex      = $item.rowIndex
                newStatus     = "DEPLOYED"
                submittedBy   = $item.submittedBy
                targetSection = $item.targetSection
                field         = $item.field
                proposedValue = $item.proposedValue
                operatorNotes = "Approved & deployed via Antigravity operator CLI"
            } | ConvertTo-Json

            $res = Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $payload -ContentType "application/json; charset=utf-8"
            Write-Host "✓ Status updated to DEPLOYED. Client email dispatched: $($res.clientNotified)" -ForegroundColor Green
            Start-Sleep -Seconds 2
        }
        "E" {
            Write-Host "`nMarking proposal as EXPEDITED (24H SLA)..." -ForegroundColor Yellow
            $payload = @{
                action        = "UPDATE_STAGING_STATUS"
                clientName    = $ClientName
                rowIndex      = $item.rowIndex
                newStatus     = "EXPEDITED"
                submittedBy   = $item.submittedBy
                targetSection = $item.targetSection
                field         = $item.field
                proposedValue = $item.proposedValue
                operatorNotes = "Expedited 24h SLA flagged by operator CLI"
            } | ConvertTo-Json

            $res = Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $payload -ContentType "application/json; charset=utf-8"
            Write-Host "✓ Status updated to EXPEDITED in Google Sheet ledger." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
        "2" {
            $notes = Read-Host "`nEnter reason for 2-step verification call"
            Write-Host "Flagging proposal for 2-step verification..." -ForegroundColor Magenta
            $payload = @{
                action        = "UPDATE_STAGING_STATUS"
                clientName    = $ClientName
                rowIndex      = $item.rowIndex
                newStatus     = "REQUIRES_2STEP"
                submittedBy   = $item.submittedBy
                operatorNotes = "2-Step Flagged: $notes"
            } | ConvertTo-Json

            $res = Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $payload -ContentType "application/json; charset=utf-8"
            Write-Host "✓ Status updated to REQUIRES_2STEP in Google Sheet ledger." -ForegroundColor Magenta
            Start-Sleep -Seconds 2
        }
        "U" {
            Write-Host "Marking proposal as UNDER_REVIEW..." -ForegroundColor Yellow
            $payload = @{
                action        = "UPDATE_STAGING_STATUS"
                clientName    = $ClientName
                rowIndex      = $item.rowIndex
                newStatus     = "UNDER_REVIEW"
                submittedBy   = $item.submittedBy
                operatorNotes = "Under engineering evaluation in Antigravity"
            } | ConvertTo-Json

            $res = Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $payload -ContentType "application/json; charset=utf-8"
            Write-Host "✓ Status updated to UNDER_REVIEW in Google Sheet ledger." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
        "R" {
            $reason = Read-Host "`nEnter rejection rationale for client ledger"
            Write-Host "Rejecting proposal..." -ForegroundColor Red
            $payload = @{
                action        = "UPDATE_STAGING_STATUS"
                clientName    = $ClientName
                rowIndex      = $item.rowIndex
                newStatus     = "REJECTED"
                submittedBy   = $item.submittedBy
                operatorNotes = "Rejected: $reason"
            } | ConvertTo-Json

            $res = Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $payload -ContentType "application/json; charset=utf-8"
            Write-Host "✓ Status updated to REJECTED in Google Sheet ledger." -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
        "Q" {
            Write-Host "`nExiting staging queue triage CLI." -ForegroundColor Yellow
            exit 0
        }
        default {
            Write-Host "Skipping proposal." -ForegroundColor Gray
            Start-Sleep -Seconds 1
        }
    }
}

Write-Host "`nAll pending items reviewed! Returning to prompt." -ForegroundColor Green
