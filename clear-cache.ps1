# ============================================================
# 🧹 Blocktopia - Clear All Caches Script (Windows PowerShell)
# ============================================================

Write-Host "🧹 Starting comprehensive cache clearing..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Clear Watchman
Write-Host "Step 1/4: Clearing Watchman cache..." -ForegroundColor Yellow
try {
    npx watchman watch-del-all
    Write-Host "✅ Watchman cache cleared!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Watchman not found or error occurred. Continuing..." -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Clear node_modules/.cache
Write-Host "Step 2/4: Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✅ node_modules\.cache deleted!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  node_modules\.cache doesn't exist (already clean)" -ForegroundColor Cyan
}
Write-Host ""

# Step 3: Clear .expo cache
Write-Host "Step 3/4: Clearing .expo cache..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo"
    Write-Host "✅ .expo cache deleted!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .expo doesn't exist (already clean)" -ForegroundColor Cyan
}
Write-Host ""

# Step 4: Clear Metro bundler cache
Write-Host "Step 4/4: Clearing Metro bundler cache..." -ForegroundColor Yellow
npx expo start --clear --no-dev --minify

Write-Host ""
Write-Host "🎉 All caches cleared! Metro is starting with --clear flag..." -ForegroundColor Green
Write-Host ""
Write-Host "👀 Look for the debug output in the console:" -ForegroundColor Cyan
Write-Host "   === 🔍 ENV DEBUG: Checking @env imports ===" -ForegroundColor White
Write-Host ""
Write-Host "📸 Take a screenshot of the debug section and share it!" -ForegroundColor Yellow

