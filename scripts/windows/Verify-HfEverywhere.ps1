#requires -Version 7
<#
.SYNOPSIS
  Verifies Hugging Face MCP/agent setup on Windows and reports Hermes status.
.EXAMPLE
  pwsh -File .\Verify-HfEverywhere.ps1
  pwsh -File .\Verify-HfEverywhere.ps1 -FixHermes
#>
[CmdletBinding()]
param([switch]$FixHermes)
$Home_ = $HOME; $AppData = $env:APPDATA
$McpUrl = 'https://huggingface.co/mcp'
$rows = [System.Collections.Generic.List[object]]::new()
function Has($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
function Row($app, $installed, $configured, $detail) {
  $rows.Add([pscustomobject]@{ App = $app; Installed = $installed; HfMcp = $configured; Detail = $detail })
}

function Test-Json($path, $key) {
  if (-not (Test-Path $path)) { return @($false, 'config missing') }
  $raw = Get-Content $path -Raw
  try { $o = $raw | ConvertFrom-Json -AsHashtable } catch { return @($false, 'invalid JSON') }
  if (-not $o -or -not $o[$key] -or -not $o[$key]['huggingface']) { return @($false, "no huggingface in '$key'") }
  if ($raw -match 'hf_[A-Za-z0-9]{20,}') { return @($true, 'WARNING: plaintext token found in file') }
  @($true, 'ok')
}
function Test-Text($path, $pattern) {
  if (-not (Test-Path $path)) { return @($false, 'config missing') }
  $raw = Get-Content $path -Raw
  if ($raw -notmatch $pattern) { return @($false, 'no huggingface entry') }
  if ($raw -match 'hf_[A-Za-z0-9]{20,}') { return @($true, 'WARNING: plaintext token found in file') }
  @($true, 'ok')
}

# Hugging Face CLI
$hf = Has hf
$hfDetail = if ($hf) { (hf version 2>&1 | Out-String).Trim() } else { 'not found: install with `uv tool install huggingface_hub`' }
Row 'HF CLI' $hf $hf $hfDetail
if ($hf) {
  $who = (hf auth whoami 2>&1 | Out-String).Trim()
  Row 'HF auth' $true ($LASTEXITCODE -eq 0) $(if ($LASTEXITCODE -eq 0) { 'logged in' } else { 'not logged in: run `hf auth login`' })
}
Row 'HF_TOKEN env' $true ([bool]$env:HF_TOKEN) $(if ($env:HF_TOKEN) { 'set in this session' } else { 'not set (configs referencing it will fail)' })

$json = @(
  @('VS Code',         'code',          "$AppData\Code\User\mcp.json",                  'servers'),
  @('VS Code Insiders','code-insiders', "$AppData\Code - Insiders\User\mcp.json",       'servers'),
  @('Cursor',          'cursor',        "$Home_\.cursor\mcp.json",                      'mcpServers'),
  @('Windsurf',        'windsurf',      "$Home_\.codeium\windsurf\mcp_config.json",     'mcpServers'),
  @('Gemini CLI',      'gemini',        "$Home_\.gemini\settings.json",                 'mcpServers'),
  @('Copilot CLI',     'copilot',       "$Home_\.copilot\mcp-config.json",              'mcpServers'),
  @('Claude Desktop',  $null,           "$AppData\Claude\claude_desktop_config.json",   'mcpServers')
)
foreach ($j in $json) {
  $inst = if ($j[1]) { (Has $j[1]) -or (Test-Path (Split-Path $j[2])) } else { Test-Path (Split-Path $j[2]) }
  if ($inst) { $r = Test-Json $j[2] $j[3]; Row $j[0] $true $r[0] $r[1] } else { Row $j[0] $false $false 'not installed' }
}
if (Has codex) { $r = Test-Text "$Home_\.codex\config.toml" '\[mcp_servers\.huggingface\]'; Row 'Codex CLI' $true $r[0] $r[1] } else { Row 'Codex CLI' $false $false 'not installed' }
if (Has claude) { $l = claude mcp list 2>&1 | Out-String; Row 'Claude Code' $true ($l -match 'huggingface') $(if ($l -match 'huggingface') { 'ok' } else { 'no huggingface server' }) } else { Row 'Claude Code' $false $false 'not installed' }
if (Has openclaw) { $l = openclaw mcp list 2>&1 | Out-String; Row 'OpenClaw' $true ($l -match 'huggingface') $(if ($l -match 'huggingface') { 'ok' } else { 'no huggingface server' }) } else { Row 'OpenClaw' $false $false 'not installed' }
if (Has pi) { Row 'Pi agent' $true (Test-Path "$Home_\.pi\agent\hf-local-ai.md") 'notes file (Pi has no native MCP)' } else { Row 'Pi agent' $false $false 'not installed' }
foreach ($rt in 'node', 'python', 'uv', 'npx') { Row $rt (Has $rt) (Has $rt) $(if (Has $rt) { 'found' } else { 'missing' }) }

# Hermes
$hermesCfg = "$Home_\.hermes\config.yaml"
$hermesBin = Has hermes
$hermesDir = Test-Path "$Home_\.hermes"
if (-not $hermesBin -and -not $hermesDir) {
  $wslNote = if (Has wsl) { ' (a WSL install, if any, is not checked or managed here)' } else { '' }
  Row 'Hermes' $false $false "not installed on Windows$wslNote"
} else {
  $r = Test-Text $hermesCfg '(?m)^\s+huggingface:'
  $detail = @()
  if (-not $hermesBin) { $detail += 'config found but `hermes` not on PATH' }
  if (-not $r[0]) { $detail += $r[1] } else { $detail += $r[1] }
  Row 'Hermes' $hermesBin $r[0] ($detail -join '; ')
  if ($FixHermes -and -not $r[0]) {
    $block = "`nmcp_servers:`n  huggingface:`n    url: `"$McpUrl`"`n    headers:`n      Authorization: `"Bearer `${HF_TOKEN}`"`n"
    if ((Test-Path $hermesCfg) -and (Select-String -Path $hermesCfg -Pattern '^\s*mcp_servers:' -Quiet)) {
      Write-Host "Hermes: $hermesCfg already has mcp_servers; add under it:`n  huggingface:`n    url: `"$McpUrl`"`n    headers:`n      Authorization: `"Bearer `${HF_TOKEN}`"" -ForegroundColor Yellow
    } else {
      New-Item -ItemType Directory -Force (Split-Path $hermesCfg) | Out-Null
      if (Test-Path $hermesCfg) { Copy-Item $hermesCfg "$hermesCfg.bak-$(Get-Date -Format yyyyMMddHHmmss)" -Force }
      Add-Content $hermesCfg $block -Encoding utf8
      Write-Host "Hermes: added huggingface MCP entry to $hermesCfg (backup kept)." -ForegroundColor Green
    }
  } elseif (-not $r[0]) { Write-Host 'Hermes misconfigured: re-run with -FixHermes (or Setup-HfEverywhere.ps1).' -ForegroundColor Yellow }
}

$rows | Format-Table -AutoSize -Wrap
$problems = @($rows | Where-Object { $_.Installed -and -not $_.HfMcp -or $_.Detail -like 'WARNING*' })
if ($problems.Count) { Write-Host "$($problems.Count) item(s) need attention." -ForegroundColor Yellow; exit 1 }
Write-Host 'All detected apps look connected.' -ForegroundColor Green
