#requires -Version 7
<#
.SYNOPSIS
  Discovers local AI apps/agents on Windows and wires Hugging Face MCP into each.
.DESCRIPTION
  - Never writes a Hugging Face token to disk. Configs reference env vars
    (or a VS Code password prompt). Token is never persisted by this script;
    run `hf auth login` or set HF_TOKEN yourself.
  - Every modified file is backed up and recorded in a manifest so -Rollback works.
  - Idempotent; no WSL/bash/curl|bash install paths.
.EXAMPLE
  pwsh -File .\Setup-HfEverywhere.ps1 -DryRun
  pwsh -File .\Setup-HfEverywhere.ps1
  pwsh -File .\Setup-HfEverywhere.ps1 -Rollback
#>
[CmdletBinding()]
param(
  [switch]$DryRun,
  [switch]$InstallMissing,
  [switch]$Rollback
)
$ErrorActionPreference = 'Continue'
$McpUrl   = 'https://huggingface.co/mcp'
$Home_    = $HOME
$AppData  = $env:APPDATA
$StateDir = Join-Path $Home_ '.hf-everywhere'
$Manifest = Join-Path $StateDir 'manifest.json'
$Report   = [System.Collections.Generic.List[object]]::new()

function Has($cmd) { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
function Log($m, $c = 'Gray') { Write-Host $m -ForegroundColor $c }
function Add-Report($n, $a) { $Report.Add([pscustomobject]@{ App = $n; Action = $a }) }

function Get-Manifest { if (Test-Path $Manifest) { @(Get-Content $Manifest -Raw | ConvertFrom-Json -AsHashtable) } else { @() } }
function Save-Manifest($entries) {
  New-Item -ItemType Directory -Force $StateDir | Out-Null
  ConvertTo-Json -InputObject @($entries) -Depth 5 | Set-Content $Manifest -Encoding utf8
}
# Records original state (backup path, or $null when the file did not exist) once per path per run
$script:Touched = @{}
function Backup($path) {
  if ($DryRun -or $script:Touched.ContainsKey($path)) { return }
  $bak = $null
  if (Test-Path $path) { $bak = "$path.bak-$(Get-Date -Format yyyyMMddHHmmss)"; Copy-Item $path $bak -Force }
  $script:Touched[$path] = $bak
  $m = @(Get-Manifest) + @{ path = $path; backup = $bak; time = (Get-Date).ToString('o') }
  Save-Manifest $m
}

if ($Rollback) {
  $entries = Get-Manifest
  if (-not $entries.Count) { Log 'Nothing to roll back.' Yellow; return }
  [array]::Reverse($entries)
  foreach ($e in $entries) {
    if ($e.backup -and (Test-Path $e.backup)) { Copy-Item $e.backup $e.path -Force; Log "Restored $($e.path)" Green }
    elseif (-not $e.backup -and (Test-Path $e.path)) { Remove-Item $e.path -Force; Log "Removed created $($e.path)" Green }
  }
  Remove-Item $Manifest -Force
  return
}

function Atomic-Write($path, $text) {
  $tmp = "$path.tmp"
  Set-Content $tmp $text -Encoding utf8
  Move-Item $tmp $path -Force
}

function Merge-JsonConfig {
  param($Path, $Key, $Entry, $Inputs)
  if ($DryRun) { Log "  [dry-run] would update $Path" Yellow; return $true }
  New-Item -ItemType Directory -Force (Split-Path $Path) | Out-Null
  $obj = @{}
  if (Test-Path $Path) {
    $raw = Get-Content $Path -Raw
    if ($raw.Trim()) {
      try { $obj = $raw | ConvertFrom-Json -AsHashtable } catch { Log "  Cannot parse $Path (JSON with comments?); skipped untouched." Red; return $false }
    }
    if (-not $obj) { $obj = @{} }
  }
  if (-not $obj.ContainsKey($Key)) { $obj[$Key] = @{} }
  $obj[$Key]['huggingface'] = $Entry
  if ($Inputs) {
    $obj['inputs'] = @($obj['inputs']) | Where-Object { $_ }
    if (-not ($obj['inputs'] | Where-Object { $_.id -eq $Inputs.id })) { $obj['inputs'] = @($obj['inputs']) + $Inputs }
  }
  Backup $Path
  Atomic-Write $Path ($obj | ConvertTo-Json -Depth 20)
  Log "  Updated $Path" Green
  $true
}

function Write-TextFile($Path, $Content) {
  if ($DryRun) { Log "  [dry-run] would write $Path" Yellow; return }
  New-Item -ItemType Directory -Force (Split-Path $Path) | Out-Null
  Backup $Path
  Atomic-Write $Path $Content
  Log "  Wrote $Path" Green
}

# Append a block to a text config unless a marker pattern already exists
function Add-TextBlock($Path, $Marker, $Block) {
  if ($DryRun) { Log "  [dry-run] would append to $Path" Yellow; return $true }
  if ((Test-Path $Path) -and (Select-String -Path $Path -Pattern $Marker -Quiet)) { Log '  Already configured.'; return $true }
  New-Item -ItemType Directory -Force (Split-Path $Path) | Out-Null
  Backup $Path
  Add-Content $Path $Block -Encoding utf8
  Log "  Updated $Path" Green
  $true
}

# 1) Discovery
Log '== Discovering installed software ==' Cyan
$wingetList = if (Has winget) { winget list 2>$null | Out-String } else { '' }
$apps = [ordered]@{
  'VS Code'          = { (Has code) -or (Test-Path "$AppData\Code") }
  'VS Code Insiders' = { (Has code-insiders) -or (Test-Path "$AppData\Code - Insiders") }
  'Cursor'           = { (Has cursor) -or (Test-Path "$Home_\.cursor") }
  'Windsurf'         = { (Has windsurf) -or (Test-Path "$Home_\.codeium\windsurf") }
  'Claude Code'      = { Has claude }
  'Claude Desktop'   = { Test-Path "$AppData\Claude" }
  'Gemini CLI'       = { (Has gemini) -or (Test-Path "$Home_\.gemini") }
  'Codex CLI'        = { (Has codex) -or (Test-Path "$Home_\.codex") }
  'Copilot CLI'      = { (Has copilot) -or (Test-Path "$Home_\.copilot") }
  'Pi agent'         = { Has pi }
  'OpenClaw'         = { Has openclaw }
  'Hermes'           = { (Has hermes) -or (Test-Path "$Home_\.hermes") }
  'Ollama'           = { Has ollama }
  'LM Studio'        = { (Has lms) -or ($wingetList -match 'LM Studio') }
  'Node.js'          = { Has node }
  'Python'           = { Has python }
  'uv'               = { Has uv }
  'HF CLI'           = { Has hf }
}
$found = @{}
foreach ($k in $apps.Keys) {
  $found[$k] = [bool](& $apps[$k])
  Log ('  {0,-18} {1}' -f $k, $(if ($found[$k]) { 'found' } else { '-' })) $(if ($found[$k]) { 'Green' } else { 'DarkGray' })
}

# 2) Optional installs (winget / npm / pip only; never bash)
if ($InstallMissing) {
  Log "`n== Installing missing tools ==" Cyan
  function WingetInstall($id) { if ($DryRun) { Log "  [dry-run] winget install $id" Yellow } else { winget install --id $id -e --accept-source-agreements --accept-package-agreements } }
  if (-not $found['Node.js']) { WingetInstall 'OpenJS.NodeJS.LTS' }
  if (-not $found['Python'])  { WingetInstall 'Python.Python.3.12' }
  if (-not $found['uv'])      { WingetInstall 'astral-sh.uv' }
  if (-not $found['HF CLI'] -and $found['uv']) { if ($DryRun) { Log '  [dry-run] uv tool install huggingface_hub' Yellow } else { uv tool install huggingface_hub } }
  Log '  Restart the terminal so PATH refreshes, then re-run to configure newly installed apps.' Yellow
}

if (-not $env:HF_TOKEN) {
  Log "`nNote: HF_TOKEN is not set in this session. Configs reference it by name; set it (or run 'hf auth login') before using them. This script never stores it." Yellow
}

# 3) Shared agent definition
$agentMd = @'
---
name: hf-local-ai
description: Finds Hugging Face models and gives local run commands (llama.cpp, Ollama, vLLM, MLX, LM Studio).
---
You help choose and run Hugging Face models locally and through Inference Providers.
- Use the Hugging Face MCP tools to search models, datasets, Spaces and papers.
- GGUF: `llama serve -hf <repo>:<quant>` or `ollama run hf.co/<repo>:<quant>`.
- safetensors text-generation: `vllm serve "<repo>"` (Linux + GPU).
- Never print, log or commit tokens.
'@

# 4) Configure
Log "`n== Configuring Hugging Face MCP (no secrets written) ==" Cyan
$vsInput = @{ type = 'promptString'; id = 'hf_token'; description = 'Hugging Face token'; password = $true }
$vsEntry = { @{ type = 'http'; url = $McpUrl; headers = @{ Authorization = 'Bearer ${input:hf_token}' } } }
$envAuth = 'Bearer ${env:HF_TOKEN}'

foreach ($v in @(@('VS Code', "$AppData\Code"), @('VS Code Insiders', "$AppData\Code - Insiders"))) {
  if ($found[$v[0]]) {
    Log $v[0]
    $ok = Merge-JsonConfig "$($v[1])\User\mcp.json" 'servers' (& $vsEntry) $vsInput
    if ($v[0] -eq 'VS Code') { Write-TextFile "$($v[1])\User\prompts\hf-local-ai.agent.md" $agentMd }
    Add-Report $v[0] $(if ($ok) { 'MCP + prompt-for-token' } else { 'failed' })
  }
}
$jsonTargets = @(
  @('Cursor',      "$Home_\.cursor\mcp.json",                  'mcpServers', @{ url = $McpUrl; headers = @{ Authorization = $envAuth } }),
  @('Windsurf',    "$Home_\.codeium\windsurf\mcp_config.json", 'mcpServers', @{ serverUrl = $McpUrl; headers = @{ Authorization = $envAuth } }),
  @('Gemini CLI',  "$Home_\.gemini\settings.json",             'mcpServers', @{ httpUrl = $McpUrl; headers = @{ Authorization = 'Bearer $HF_TOKEN' } }),
  @('Copilot CLI', "$Home_\.copilot\mcp-config.json",          'mcpServers', @{ type = 'http'; url = $McpUrl; headers = @{ Authorization = 'Bearer $HF_TOKEN' }; tools = @('*') }),
  @('Claude Desktop', "$AppData\Claude\claude_desktop_config.json", 'mcpServers', @{
      command = 'npx'; args = @('-y', 'mcp-remote', $McpUrl, '--header', 'Authorization:${HF_AUTH}') })
)
foreach ($t in $jsonTargets) {
  if ($found[$t[0]]) {
    Log $t[0]
    $ok = Merge-JsonConfig $t[1] $t[2] $t[3]
    if ($t[0] -eq 'Copilot CLI') { Write-TextFile "$Home_\.copilot\agents\hf-local-ai.agent.md" $agentMd }
    $note = if ($t[0] -eq 'Claude Desktop') { 'MCP (set user env HF_AUTH="Bearer <token>" yourself)' } else { 'MCP (env ref)' }
    Add-Report $t[0] $(if ($ok) { $note } else { 'failed' })
  }
}
if ($found['Claude Code']) {
  Log 'Claude Code'
  if ($DryRun) { Log '  [dry-run] claude mcp add ...' Yellow }
  else {
    $existing = claude mcp list 2>&1 | Out-String
    if ($existing -notmatch 'huggingface') { claude mcp add --transport http --scope user huggingface $McpUrl --header 'Authorization: Bearer ${HF_TOKEN}' 2>&1 | Out-Null }
  }
  Write-TextFile "$Home_\.claude\agents\hf-local-ai.md" $agentMd
  Add-Report 'Claude Code' 'MCP + agent (env ref)'
}
if ($found['Codex CLI']) {
  Log 'Codex CLI'
  $ok = Add-TextBlock "$Home_\.codex\config.toml" '\[mcp_servers\.huggingface\]' "`n[mcp_servers.huggingface]`nurl = `"$McpUrl`"`nbearer_token_env_var = `"HF_TOKEN`"`n"
  Add-Report 'Codex CLI' 'MCP (env ref)'
}

# Pi / OpenClaw
if ($found['OpenClaw']) {
  Log 'OpenClaw'
  if ($DryRun) { Log '  [dry-run] openclaw mcp set huggingface ...' Yellow }
  else {
    $json = (@{ url = $McpUrl; headers = @{ Authorization = 'Bearer ${HF_TOKEN}' } } | ConvertTo-Json -Compress)
    openclaw mcp set huggingface $json 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Log '  openclaw mcp set failed; add the server manually (see openclaw docs).' Yellow }
  }
  Add-Report 'OpenClaw' 'MCP via CLI (env ref)'
}
if ($found['Pi agent']) {
  Log 'Pi agent (no native MCP; installing guidance context)'
  Write-TextFile "$Home_\.pi\agent\hf-local-ai.md" $agentMd
  Add-Report 'Pi agent' 'agent notes (use `hf` CLI for HF access)'
}

# Hermes (Windows-native only; never installs via bash/WSL)
if ($found['Hermes']) {
  Log 'Hermes'
  $cfg = "$Home_\.hermes\config.yaml"
  $block = "`nmcp_servers:`n  huggingface:`n    url: `"$McpUrl`"`n    headers:`n      Authorization: `"Bearer `${HF_TOKEN}`"`n"
  if ((Test-Path $cfg) -and (Select-String -Path $cfg -Pattern '^\s*mcp_servers:' -Quiet) -and -not (Select-String -Path $cfg -Pattern '^\s+huggingface:' -Quiet)) {
    Log "  $cfg already has an mcp_servers section; add a 'huggingface' entry manually (see Verify-HfEverywhere.ps1 -FixHermes output)." Yellow
    Add-Report 'Hermes' 'manual merge needed'
  } else {
    $ok = Add-TextBlock $cfg '^\s+huggingface:' $block
    Add-Report 'Hermes' $(if ($ok) { 'MCP (env ref)' } else { 'failed' })
  }
}

Log "`n== Summary ==" Cyan
$Report | Format-Table -AutoSize
Log "Undo any change with: pwsh -File .\Setup-HfEverywhere.ps1 -Rollback" Green
Log "Verify with:          pwsh -File .\Verify-HfEverywhere.ps1" Green
