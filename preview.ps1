param(
  [int]$Port = 8000
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = "http://localhost:$Port"
$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
$pyCommand = Get-Command py -ErrorAction SilentlyContinue
$pythonSearchRoot = Join-Path $env:LocalAppData "Programs\Python"
$pythonExe = $null

if ($pythonCommand) {
  $pythonExe = $pythonCommand.Source
} elseif ($pyCommand) {
  $pythonExe = $pyCommand.Source
} elseif (Test-Path $pythonSearchRoot) {
  $pythonExe = Get-ChildItem -Path $pythonSearchRoot -Filter python.exe -Recurse -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName
}

if (-not $pythonExe) {
  Write-Error "Python was not found. Reopen your terminal after installing Python, or edit preview.ps1 with your python.exe path."
  exit 1
}

Set-Location $root
Write-Host "Using Python at $pythonExe"
Write-Host "Serving $root at $url"
Start-Process $url
& $pythonExe -m http.server $Port
