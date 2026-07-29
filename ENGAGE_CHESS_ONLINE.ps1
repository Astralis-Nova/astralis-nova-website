param(
  [string]$DatabaseName = "astralis-nova-chess",
  [string]$VerifyUrl = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Stage([string]$Message) {
  Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Invoke-Wrangler([string[]]$Arguments) {
  & npx --yes wrangler @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Wrangler command failed: npx wrangler $($Arguments -join ' ')"
  }
}

if ($VerifyUrl) {
  $HealthUrl = $VerifyUrl.TrimEnd('/') + "/api/chess?action=health"
  Write-Stage "Verifying Astralis Nova Chess at $HealthUrl"
  try {
    $Result = Invoke-RestMethod -Uri $HealthUrl -Method Get -TimeoutSec 30
    $Result | ConvertTo-Json -Depth 6
    if ($Result.ok -eq $true -and $Result.storage -eq "D1") {
      Write-Host "`nONLINE CHESS MEMORY CORE: ACTIVE" -ForegroundColor Green
      exit 0
    }
    throw "The endpoint responded, but D1 is not active yet."
  }
  catch {
    Write-Host "`nVerification failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Confirm the DB binding, redeploy the Pages project, then try again." -ForegroundColor Yellow
    exit 1
  }
}

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$SchemaPath = Join-Path $RepoRoot "database/chess-schema.sql"

Write-Host "ASTRALIS NOVA ONLINE CHESS ENGAGEMENT" -ForegroundColor Magenta
Write-Host "Database: $DatabaseName"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js is required. Install Node.js, reopen PowerShell, and run this script again."
}

if (-not (Test-Path $SchemaPath)) {
  throw "Schema file not found: $SchemaPath. Run this script from the cloned website repository."
}

Write-Stage "Checking Cloudflare login"
try {
  Invoke-Wrangler @("whoami")
}
catch {
  Write-Host "Cloudflare login is required. A browser window will open." -ForegroundColor Yellow
  Invoke-Wrangler @("login")
  Invoke-Wrangler @("whoami")
}

Write-Stage "Creating the D1 database"
$CreateOutput = & npx --yes wrangler d1 create $DatabaseName 2>&1
$CreateText = ($CreateOutput | Out-String)
$CreateOutput | ForEach-Object { Write-Host $_ }

if ($LASTEXITCODE -ne 0) {
  if ($CreateText -match "already exists|already in use|duplicate") {
    Write-Host "Database already exists. Continuing with schema installation." -ForegroundColor Yellow
  }
  else {
    throw "Unable to create D1 database. Review the Wrangler output above."
  }
}

Write-Stage "Installing the chess schema"
Invoke-Wrangler @("d1", "execute", $DatabaseName, "--remote", "--file=$SchemaPath")

Write-Host "`nDATABASE AND SCHEMA: READY" -ForegroundColor Green
Write-Host "`nOne dashboard binding remains:" -ForegroundColor Cyan
Write-Host "  1. Open Cloudflare > Workers & Pages"
Write-Host "  2. Select the Astralis Nova Pages project"
Write-Host "  3. Open Settings > Bindings"
Write-Host "  4. Add a D1 database binding"
Write-Host "  5. Variable name: DB"
Write-Host "  6. Database: $DatabaseName"
Write-Host "  7. Save and redeploy"

$OpenDashboard = Read-Host "`nOpen the Cloudflare Workers & Pages dashboard now? (Y/N)"
if ($OpenDashboard -match '^[Yy]') {
  Start-Process "https://dash.cloudflare.com/?to=/:account/workers-and-pages"
}

Write-Host "`nAfter redeployment, verify with:" -ForegroundColor Cyan
Write-Host ".\ENGAGE_CHESS_ONLINE.ps1 -VerifyUrl 'https://YOUR-SITE'"
Write-Host "`nEngagement sequence complete. Local mode remains available until the binding is active." -ForegroundColor Magenta
