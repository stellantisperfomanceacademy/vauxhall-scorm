# build.ps1 — package the SCORM module into a deployable .zip
# Usage: ./build.ps1
# Output: dist/vauxhall-scorm.zip

$root    = $PSScriptRoot
$dist    = Join-Path $root "dist"
$zipName = "vauxhall-scorm.zip"
$out     = Join-Path $dist $zipName

# files/folders to include in the SCORM package
$include = @(
  "index.html",
  "imsmanifest.xml",
  "css",
  "js",
  "assets",
  "images"
)

# clean / create dist
if (Test-Path $dist) { Remove-Item $dist -Recurse -Force }
New-Item -ItemType Directory -Path $dist | Out-Null

# copy included items into a temp staging folder
$stage = Join-Path $dist "_stage"
New-Item -ItemType Directory -Path $stage | Out-Null

foreach ($item in $include) {
  $src = Join-Path $root $item
  if (Test-Path $src) {
    $dst = Join-Path $stage $item
    Copy-Item $src $dst -Recurse
  } else {
    Write-Warning "Skipping missing item: $item"
  }
}

# zip the staging folder contents
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $out -Force

# clean up staging
Remove-Item $stage -Recurse -Force

$size = [math]::Round((Get-Item $out).Length / 1KB, 1)
Write-Host ""
Write-Host "  SCORM package ready:" -ForegroundColor Green
Write-Host "  $out ($size KB)" -ForegroundColor Cyan
Write-Host ""
