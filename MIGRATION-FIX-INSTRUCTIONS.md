# 🔧 Database Migration Fix - Instructions

## Problem Found ✅
Your anonymous sign-ins are **enabled correctly**, but the migration failed because:
- The script referenced `game_stats` table
- Your database actually has `game_sessions` table

## Solution ✅
I've created a **fixed migration file** and updated the AuthService code.

---

## Step 1: Run the Fixed Migration

### In Supabase SQL Editor:

1. **Open SQL Editor** in your Supabase Dashboard
2. **Click "New query"**
3. **Copy ALL the contents** from this file:
   ```
   supabase-account-deletion-migration-FIXED.sql
   ```
4. **Paste into SQL Editor**
5. **Click "Run"** (or press Ctrl+Enter / Cmd+Enter)

### Expected Result:
You should see at the bottom:
```
✅ Total DELETE policies created: 8
✅ Account deletion support enabled!
Users can now safely delete their accounts and all associated data.
```

---

## Step 2: Verify It Worked

Run this query to check:
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE cmd = 'DELETE'
AND tablename IN (
  'profiles', 
  'game_sessions', 
  'transactions',
  'power_ups_inventory', 
  'cosmetics_owned', 
  'user_settings',
  'leaderboard',
  'analytics_events'
)
ORDER BY tablename;
```

You should see **8 DELETE policies** listed.

---

## What Was Fixed

### Code Changes:
1. ✅ Updated `supabase-account-deletion-migration-FIXED.sql`
   - Changed `game_stats` → `game_sessions`
   - Added missing tables: `transactions`, `leaderboard`, `analytics_events`

2. ✅ Updated `src/services/auth/AuthService.ts`
   - Fixed table names in `deleteAccount()` method
   - Now deletes from all 8 tables correctly

### Tables Now Covered:
- ✅ profiles
- ✅ game_sessions (was wrong: game_stats)
- ✅ transactions (was missing)
- ✅ power_ups_inventory
- ✅ cosmetics_owned
- ✅ user_settings
- ✅ leaderboard (was missing)
- ✅ analytics_events (was missing)

---

## Test It

After running the migration:

1. **Start your app**
2. **Sign in as guest**
3. **Go to Settings**
4. **Click "Delete Account"**
5. **Confirm twice**
6. ✅ Should delete successfully

---

## Status Summary

| Item | Status |
|------|--------|
| Anonymous Sign-Ins Enabled | ✅ Done |
| Migration Script Fixed | ✅ Done |
| AuthService Updated | ✅ Done |
| Ready to Test | ✅ Yes |

---

## If You Still Get Errors

### Error: "policy already exists"
**Solution:** This is OK! It means some policies were already created. The script will skip them.

### Error: "table does not exist"
**Solution:** Run the main schema first:
```sql
-- In Supabase SQL Editor, run:
-- supabase-schema.sql
```

Then run the fixed migration.

### Error: "insufficient privilege"
**Solution:** The trigger creation might fail, but that's OK. The manual deletion in the app will handle it.

---

## Quick Checklist

- [x] Anonymous sign-ins enabled ✅
- [ ] Run `supabase-account-deletion-migration-FIXED.sql` ⏳
- [ ] Verify 8 DELETE policies created ⏳
- [ ] Test account deletion in app ⏳

---

*Once the migration runs successfully, everything will work perfectly!* 🎉

