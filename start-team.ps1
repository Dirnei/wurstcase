# Starts the Wurst Case team: Docker, the web container, and five Claude sessions as tabs in
# ONE Windows Terminal window (a single wt call, so there is no window race). Every tab runs
# this same script with -Session, which waits its turn and then starts claude. The starts are
# staggered so the sessions don't race each other on ~/.claude.json at startup, and the tab
# stays open (-NoExit) so you can read any error. head-of-development starts last.
#
# Usage (PowerShell):  powershell -ExecutionPolicy Bypass -File .\start-team.ps1   (from the repo root)
# Options:             -SkipDocker   don't start Docker Desktop or the container
#                      -Model opus   pass a model to every session (default: your default)
#                      -DryRun       print the wt command instead of opening the window
#                      -Stagger 8    seconds between session starts

param(
    [string]$Session = '',
    [int]$Delay = 0,
    [switch]$SkipDocker,
    [string]$Model = '',
    [switch]$DryRun,
    [int]$Stagger = 8
)

$Repo = $PSScriptRoot  # the script sits in the repo root, wherever it is checked out
$Self = $MyInvocation.MyCommand.Path
# Full path, so wt never has to look powershell up on PATH (it fails with 0x80070002 if it can't).
$PowerShellExe = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'

# --- Tab mode: one session ---------------------------------------------------------------
if ($Session) {
    $Host.UI.RawUI.WindowTitle = $Session
    # wt can hand the tab a stripped PATH (no claude, git, node, docker), so rebuild it from the registry.
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
                [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($Delay -gt 0) {
        Write-Host "$Session starts in $Delay s..."
        Start-Sleep -Seconds $Delay
    }
    Set-Location $Repo
    $prompt = "You are the $Session session of the Wurst Case team. Read $Repo\TEAM-SETUP.md " +
              "and follow the kickoff for $Session in section 2. Your session name is already set."
    $claudeArgs = @('-n', $Session, '--permission-mode', 'auto')
    if ($Model) { $claudeArgs += @('--model', $Model) }
    $claudeArgs += $prompt
    & claude @claudeArgs
    Write-Host "claude exited with code $LASTEXITCODE. This tab stays open."
    return
}

# --- Launcher mode -------------------------------------------------------------------------
if (-not $SkipDocker -and -not $DryRun) {
    docker info *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Starting Docker Desktop...'
        Start-Process 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
        $up = $false
        for ($i = 0; $i -lt 60 -and -not $up; $i++) {
            Start-Sleep -Seconds 3
            docker info *> $null
            $up = ($LASTEXITCODE -eq 0)
        }
        if (-not $up) { throw 'Docker did not come up within 3 minutes.' }
    }
    Write-Host 'Starting the web container (never compose down)...'
    Push-Location $Repo
    docker compose up -d web
    Pop-Location
}

# head-of-development last, with an extra gap so the others are up when it checks in.
$order = 'product-owner', 'implementation-worker', 'ui-worker', 'validator', 'head-of-development'
$tabs = @()
for ($i = 0; $i -lt $order.Count; $i++) {
    $name = $order[$i]
    $wait = $i * $Stagger
    if ($name -eq 'head-of-development') { $wait += 2 * $Stagger }
    $extra = if ($Model) { " -Model $Model" } else { '' }
    $tabs += "new-tab --title $name -d `"$Repo`" `"$PowerShellExe`" -NoExit -ExecutionPolicy Bypass " +
             "-File `"$Self`" -Session $name -Delay $wait$extra"
}
$wtArgs = $tabs -join ' ; '

if ($DryRun) {
    Write-Host "wt.exe $wtArgs"
    return
}
Start-Process wt.exe -ArgumentList $wtArgs
Write-Host "Opened 5 tabs. The head starts in about $((($order.Count - 1) + 2) * $Stagger) s. Game: http://localhost:8234"
