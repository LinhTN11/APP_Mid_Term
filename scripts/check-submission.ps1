[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repoRoot = (git rev-parse --show-toplevel 2>$null)
if (-not $repoRoot) {
  throw 'Run this script from inside a Git repository.'
}

$trackedFiles = @(git -C $repoRoot ls-files)
if ($LASTEXITCODE -ne 0) {
  throw 'Could not read the Git tracked-file list.'
}

$violations = [System.Collections.Generic.List[string]]::new()
foreach ($file in $trackedFiles) {
  $path = $file.Replace('\', '/')
  $name = [System.IO.Path]::GetFileName($path)
  if ($path -match '(^|/)(node_modules|Pods|build|DerivedData|\.gradle|\.cxx|\.kotlin)(/|$)') {
    $violations.Add("Generated or dependency path is tracked: $file")
  }
  if ($name -ieq 'local.properties') {
    $violations.Add("Local SDK settings are tracked: $file")
  }
  if (($name -match '^\.env($|\.)') -and $name -notin @('.env.example', '.env.template')) {
    $violations.Add("Environment secret file is tracked: $file")
  }
  if ($name -match '(?i)(secret|credential|service[-_]?account|private[-_]?key)') {
    $violations.Add("Potential secret file is tracked: $file")
  }
  if ($name -match '(?i)\.(jks|keystore|p12|pfx|pem|key)$' -and $name -ine 'debug.keystore') {
    $violations.Add("Signing/private key file is tracked: $file")
  }
}

if ($violations.Count -gt 0) {
  $violations | ForEach-Object { Write-Error $_ }
  throw 'Submission file checks failed.'
}
Write-Host "Tracked-file check passed ($($trackedFiles.Count) files inspected)."

$appDir = Join-Path $repoRoot 'LibraryApp'
if (-not (Test-Path -LiteralPath (Join-Path $appDir 'package.json'))) {
  throw 'LibraryApp/package.json was not found.'
}

Push-Location $appDir
try {
  npm.cmd test -- --runInBand
  if ($LASTEXITCODE -ne 0) { throw 'Jest failed.' }

  npx.cmd tsc --noEmit
  if ($LASTEXITCODE -ne 0) { throw 'TypeScript check failed.' }

  npm.cmd run lint
  if ($LASTEXITCODE -ne 0) { throw 'ESLint failed.' }
} finally {
  Pop-Location
}

Write-Host 'Submission checks passed.'
