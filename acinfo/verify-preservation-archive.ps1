# Verify the official ACCPP v1.1 offline wiki archive before extraction.
# Usage: .\verify-preservation-archive.ps1 -ArchivePath "D:\\AC\\Archives\\accppwiki-docker-mediawiki-1.46-offline-release-v1.1.7z"
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [string]$ArchivePath
)
$ErrorActionPreference = 'Stop'
$expectedName = 'accppwiki-docker-mediawiki-1.46-offline-release-v1.1.7z'
$expectedSHA256 = 'B075562C54C326A899AA27EB98E4BB73850E0103DC104E7803165A8205B6AD0F'
$archive = Get-Item -LiteralPath $ArchivePath -ErrorAction Stop
if ($archive.PSIsContainer) { throw "Expected a .7z file, not a folder." }
if ($archive.Name -ne $expectedName) {
  Write-Warning "Filename differs from official release; checksum comparison remains mandatory."
}
Write-Host "Checking ACCPP v1.1 archive integrity (this reads the entire 4.1 GB file)..." -ForegroundColor Cyan
$actual = (Get-FileHash -LiteralPath $archive.FullName -Algorithm SHA256).Hash.ToUpperInvariant()
if ($actual -ne $expectedSHA256) {
  Write-Host "Expected: $expectedSHA256"
  Write-Host "Actual:   $actual"
  throw "FAILED: archive checksum does not match the publisher. Do not extract or execute this file."
}
Write-Host "PASS: publisher's SHA-256 matches." -ForegroundColor Green
Write-Host "File: $($archive.FullName)"
Write-Host "Bytes: $($archive.Length)"
Write-Host "Next: inspect README.md and docker-compose.yml after extraction."
Write-Host "Keep this package out of the public website repository."
