# ============================================
# EAS Build Pre-Flight Test Script
# ============================================
# This script tests if your build will succeed on EAS
# by running the EXACT command that EAS uses.
#
# CRITICAL: EAS uses "npm ci --include=dev" (NOT --legacy-peer-deps!)
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "EAS BUILD PRE-FLIGHT TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This script will test if your build will succeed on EAS." -ForegroundColor Yellow
Write-Host "It runs the EXACT command that EAS uses: npm ci --include=dev`n" -ForegroundColor Yellow

# Step 1: Check if node_modules exists
Write-Host "[1/4] Checking environment..." -ForegroundColor Green
if (Test-Path "node_modules") {
    Write-Host "  -> node_modules found, will be deleted" -ForegroundColor Gray
} else {
    Write-Host "  -> node_modules not found (clean slate)" -ForegroundColor Gray
}

# Step 2: Clean node_modules
Write-Host "`n[2/4] Cleaning node_modules..." -ForegroundColor Green
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Write-Host "  -> Cleaned successfully" -ForegroundColor Gray

# Step 3: Run the EXACT EAS command
Write-Host "`n[3/4] Running EAS test command: npm ci --include=dev..." -ForegroundColor Green
Write-Host "  -> This is the EXACT command EAS uses" -ForegroundColor Yellow
Write-Host "  -> If this fails, EAS will fail too!`n" -ForegroundColor Yellow

try {
    npm ci --include=dev
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "`n[4/4] SUCCESS!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "BUILD WILL SUCCEED ON EAS" -ForegroundColor Green
        Write-Host "========================================`n" -ForegroundColor Green
        
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Make sure all changes are committed:" -ForegroundColor White
        Write-Host "     git add ." -ForegroundColor Gray
        Write-Host "     git commit -m 'Ready for build'" -ForegroundColor Gray
        Write-Host "`n  2. Verify working tree is clean:" -ForegroundColor White
        Write-Host "     git status" -ForegroundColor Gray
        Write-Host "`n  3. Build on EAS:" -ForegroundColor White
        Write-Host "     eas build --platform ios --profile development" -ForegroundColor Gray
        Write-Host "     eas build --platform android --profile development`n" -ForegroundColor Gray
        
        exit 0
    } else {
        throw "npm ci failed with exit code $exitCode"
    }
} catch {
    Write-Host "`n[4/4] FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "BUILD WILL FAIL ON EAS" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    
    Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Red
    
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "  1. Missing dependencies in package.json" -ForegroundColor White
    Write-Host "  2. package-lock.json out of sync" -ForegroundColor White
    Write-Host "  3. Peer dependency conflicts`n" -ForegroundColor White
    
    Write-Host "To fix:" -ForegroundColor Cyan
    Write-Host "  1. Check the error message above" -ForegroundColor White
    Write-Host "  2. Look for 'Missing: package-name' lines" -ForegroundColor White
    Write-Host "  3. Add missing packages to package.json" -ForegroundColor White
    Write-Host "  4. Regenerate lock file:" -ForegroundColor White
    Write-Host "     Remove-Item package-lock.json -Force" -ForegroundColor Gray
    Write-Host "     npm install --legacy-peer-deps" -ForegroundColor Gray
    Write-Host "  5. Run this test script again`n" -ForegroundColor White
    
    exit 1
}

