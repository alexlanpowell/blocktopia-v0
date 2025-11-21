# 🚀 Quick Debug Reference Card

## Clear All Caches (Run This First!)

### Windows PowerShell:
```powershell
.\clear-cache.ps1
```

### Windows CMD:
```cmd
clear-cache.cmd
```

### macOS/Linux:
```bash
./clear-cache.sh
```

### Manual (if scripts don't work):
```bash
npx watchman watch-del-all
# Windows: Remove-Item -Recurse -Force node_modules\.cache
# Mac/Linux: rm -rf node_modules/.cache
npx expo start --clear
```

---

## What To Look For

### 1. Debug Output (should appear at startup):
```
=== 🔍 ENV DEBUG: Checking @env imports ===
SUPABASE_URL: { type: 'string', hasValue: true, ... }
...
=== END ENV DEBUG ===
```

### 2. If You See:
- **`type: 'undefined'`** → Cache wasn't cleared, try again
- **`hasValue: false`** → .env file issue, check format
- **`hasValue: true`** but still errors → Keys are wrong/invalid

---

## .env File Checklist

Location: `C:\Users\Unmap\Downloads\blocktopia\.env`

Format:
```env
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
GOOGLE_WEB_CLIENT_ID=123...
```

Rules:
- ❌ No spaces around `=`
- ❌ No quotes
- ❌ No inline comments
- ❌ No trailing spaces

---

## Still Getting Errors?

Share:
1. Screenshot of `=== 🔍 ENV DEBUG ===` section
2. Screenshot of error messages
3. Confirm you cleared all caches

---

## Get Supabase Keys

1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`

⚠️ NEVER use `service_role` key in your app!

---

## Files With Debug Info

- `DEBUG-ENV-VARS.md` - Full troubleshooting guide
- `ENV-VAR-DEBUG-COMPLETE.md` - Complete implementation summary
- `QUICK-DEBUG-REFERENCE.md` - This file

