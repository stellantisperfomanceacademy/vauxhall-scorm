$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "vauxhall-scorm-external-review"
$zip = Join-Path $root "vauxhall-scorm-external-review.zip"

if (!(Test-Path $src)) {
  throw "Build folder not found: $src. Run: node tools/build-external-review-copy.mjs"
}

$mustExist = @(
  (Join-Path $src "index.html"),
  (Join-Path $src "css\styles.css"),
  (Join-Path $src "js\engine.js")
)
foreach ($f in $mustExist) {
  if (!(Test-Path $f)) { throw "Missing required file in build: $f" }
}

if (Test-Path $zip) { Remove-Item $zip -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($src, $zip)

$archive = [System.IO.Compression.ZipFile]::OpenRead($zip)
$entries = $archive.Entries | ForEach-Object { $_.FullName.Replace("\", "/") }
$archive.Dispose()

$check = @("index.html", "css/styles.css", "js/engine.js")
foreach ($c in $check) {
  if ($entries -notcontains $c) {
    throw "Zip verification failed: missing $c"
  }
}

Write-Host "Created zip: $zip"
Write-Host "Zip entries: $($entries.Count)"
Write-Host "Verified: index.html, css/styles.css, js/engine.js"
