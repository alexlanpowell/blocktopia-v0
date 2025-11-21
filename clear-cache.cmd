@echo off
REM ============================================================
REM 🧹 Blocktopia - Clear All Caches Script (Windows CMD)
REM ============================================================

echo 🧹 Starting comprehensive cache clearing...
echo.

REM Step 1: Clear Watchman
echo Step 1/4: Clearing Watchman cache...
npx watchman watch-del-all
if errorlevel 1 (
    echo ⚠️  Watchman error occurred. Continuing...
) else (
    echo ✅ Watchman cache cleared!
)
echo.

REM Step 2: Clear node_modules/.cache
echo Step 2/4: Clearing node_modules cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ node_modules\.cache deleted!
) else (
    echo ℹ️  node_modules\.cache doesn't exist (already clean)
)
echo.

REM Step 3: Clear .expo cache
echo Step 3/4: Clearing .expo cache...
if exist ".expo" (
    rmdir /s /q ".expo"
    echo ✅ .expo cache deleted!
) else (
    echo ℹ️  .expo doesn't exist (already clean)
)
echo.

REM Step 4: Clear Metro bundler cache
echo Step 4/4: Clearing Metro bundler cache...
npx expo start --clear

echo.
echo 🎉 All caches cleared! Metro is starting with --clear flag...
echo.
echo 👀 Look for the debug output in the console:
echo    === 🔍 ENV DEBUG: Checking @env imports ===
echo.
echo 📸 Take a screenshot of the debug section and share it!

