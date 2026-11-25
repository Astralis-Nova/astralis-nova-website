# Read-only inspection of an ACCPP .7z package after checksum verification.
# This script DOES NOT extract, load Docker images, or modify your ACE server.
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$ArchivePath,
  [string]$ReportDirectory = 'D:\AC\Archives\ACInfo-Inventory',
  [string]$SevenZipPath = '7z.exe'
)
$ErrorActionPreference = 'Stop'
$archive = (Get-Item -LiteralPath $ArchivePath -ErrorAction Stop).FullName
$verify = Join-Path $PSScriptRoot 'verify-preservation-archive.ps1'
& $verify -ArchivePath $archive
if ($LASTEXITCODE -ne 0) { throw 'Archive verification failed.' }
$exe = Get-Command $SevenZipPath -ErrorAction Stop
New-Item -ItemType Directory -Path $ReportDirectory -Force | Out-Null
$listingPath = Join-Path $ReportDirectory '7zip-listing.txt'
$summaryPath = Join-Path $ReportDirectory 'archive-summary.json'
# -slt gives paths and sizes as text. The archive is never extracted or run.
& $exe.Source l -slt -- $archive | Set-Content -LiteralPath $listingPath -Encoding utf8
if ($LASTEXITCODE -ne 0) { throw '7-Zip could not list the archive.' }
$paths = [System.Collections.Generic.List[string]]::new()
$badPaths = [System.Collections.Generic.List[string]]::new()
foreach ($line in [System.IO.File]::ReadLines($listingPath)) {
  if ($line -match '^Path = (.+)$') {
    $p = $Matches[1]
    # Only actual archive entries after the listing separator are included.
    if ($p -eq $archive) { continue }
    $paths.Add($p)
    if ($p -match '(^[\\/]|^[A-Za-z]:|(^|[\\/])\.\.([\\/]|$))') { $badPaths.Add($p) }
  }
}
$possibleData = @($paths | Where-Object { $_ -match '(?i)\.((sql|xml|bz2|gz|json|jsonl|tar|zst|7z|zip))$' })
$possibleMedia = @($paths | Where-Object { $_ -match '(?i)\.((png|jpg|jpeg|gif|webp|svg))$' })
$docker = @($paths | Where-Object { $_ -match '(?i)(docker-compose|compose\.ya?ml|load-images|README)' })
$summary = [ordered]@{
  archive = $archive
  verified_sha256 = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
  entry_count = $paths.Count
  suspicious_paths = @($badPaths)
  possible_database_or_export_files = @($possibleData | Select-Object -First 100)
  possible_media_files = $possibleMedia.Count
  docker_and_readme_files = @($docker | Select-Object -First 100)
  note = 'Read-only inventory. Inspect contents and licenses before extraction or publication.'
}
$summary | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $summaryPath -Encoding utf8
Write-Host "Inventory saved: $summaryPath" -ForegroundColor Green
Write-Host "Entries: $($paths.Count); possible media files: $($possibleMedia.Count)"
if ($badPaths.Count -gt 0) {
  Write-Warning 'Potential unsafe extraction paths detected. Do not extract until reviewed.'
}
