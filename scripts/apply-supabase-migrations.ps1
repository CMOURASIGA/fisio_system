# Apply Supabase migrations script
# Usage: Open PowerShell, navigate to project root and run:
#   ./scripts/apply-supabase-migrations.ps1

param()

function Ensure-Command {
    param([string]$cmd)
    $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

Write-Host "This script will try to apply SQL files in supabase/migrations to your Supabase project." -ForegroundColor Cyan
Write-Host "It requires the Supabase CLI (https://supabase.com/docs/guides/cli) and that you are logged in (`supabase login`)." -ForegroundColor Yellow

if (-not (Ensure-Command -cmd 'supabase')) {
    Write-Host "Supabase CLI not found. Install with: npm i -g supabase" -ForegroundColor Red
    exit 1
}

# Project ref (replace if different)
$projectRef = 'ihmpiwkcrxxxamttyovi'

Write-Host "Linking to project: $projectRef" -ForegroundColor Cyan
supabase link --project-ref $projectRef
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to link project. Make sure you are logged in (run 'supabase login') and the project ref is correct." -ForegroundColor Red
    exit $LASTEXITCODE
}

# Migration files in order
$migrations = @(
    'supabase/migrations/001_init.sql',
    'supabase/migrations/002_auth.sql',
    'supabase/migrations/003_ownership.sql'
)

foreach ($file in $migrations) {
    if (-not (Test-Path $file)) {
        Write-Host "Migration file not found: $file" -ForegroundColor Red
        exit 2
    }
    Write-Host "Applying $file..." -ForegroundColor Cyan

    # Try supabase db query --file
    supabase db query --file $file
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Applied $file successfully (via supabase db query)." -ForegroundColor Green
        continue
    }

    Write-Host "supabase db query failed. Attempting to push using supabase db push (if you manage migrations via supabase)." -ForegroundColor Yellow
    supabase db push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Applied migrations via supabase db push." -ForegroundColor Green
        break
    }

    Write-Host "Automatic application failed. Please open Supabase Dashboard -> SQL Editor and run: $file" -ForegroundColor Red
    exit 3
}

Write-Host "All done. Verify in Supabase Dashboard -> Table Editor that tables/policies/triggers exist." -ForegroundColor Green
