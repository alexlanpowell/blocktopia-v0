# Supabase Configuration Instructions

## ⚠️ IMPORTANT: Required Setup Steps

Before the anonymous authentication and account deletion features will work, you **MUST** complete these Supabase configuration steps.

---

## Step 1: Enable Anonymous Sign-Ins

### Instructions:

1. **Open your Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your Blocktopia project

2. **Navigate to Authentication Settings**
   - Click on **"Authentication"** in the left sidebar
   - Click on **"Settings"** tab

3. **Enable Anonymous Sign-Ins**
   - Scroll down to the **"User Signups"** section
   - Find the **"Anonymous Sign-Ins"** toggle
   - **Turn it ON** (enable it)
   - Click **"Save"** at the bottom of the page

### What This Does:
- Allows users to sign in without email/password
- Creates temporary accounts with unique IDs
- Enables "Continue as Guest" functionality
- Lets users play immediately without registration

### Verification:
After enabling, test by clicking "Continue as Guest" in the app. You should see:
- No error messages
- Successful sign-in
- Username like "Guest123456"
- Ability to play the game

---

## Step 2: Run Database Migration for Account Deletion

### Instructions:

1. **Open Supabase SQL Editor**
   - In your Supabase Dashboard
   - Click on **"SQL Editor"** in the left sidebar
   - Click **"New query"**

2. **Copy Migration SQL**
   - Open the file: `supabase-account-deletion-migration.sql`
   - Copy the entire contents

3. **Paste and Execute**
   - Paste the SQL into the SQL Editor
   - Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verify Success**
   - You should see messages about policies created
   - Check the output for any errors
   - If you see "insufficient_privilege" for the trigger, that's OK (the app handles it)

### What This Does:
- Creates Row Level Security (RLS) policies
- Allows users to delete their own data
- Sets up proper permissions for account deletion
- Enables cascading deletes (if permissions allow)

### Tables Affected:
- `profiles`
- `game_stats`
- `power_ups_inventory`
- `cosmetics_owned`
- `user_settings`

### Verification:
After running the migration:
1. Check that RLS is enabled on all tables:
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('profiles', 'game_stats', 'power_ups_inventory', 'cosmetics_owned', 'user_settings');
   ```
   All should show `rowsecurity = true`

2. Check that DELETE policies exist:
   ```sql
   SELECT tablename, policyname, cmd
   FROM pg_policies
   WHERE cmd = 'DELETE'
   AND tablename IN ('profiles', 'game_stats', 'power_ups_inventory', 'cosmetics_owned', 'user_settings');
   ```
   Should show 5 DELETE policies (one per table)

---

## Step 3: Test the Implementation

### Test Anonymous Sign-In:
1. Open your app
2. Click "Continue as Guest"
3. ✅ Should sign in successfully
4. ✅ Should see username like "Guest123456"
5. ✅ Should be able to play the game

### Test Settings Screen:
1. Click "Settings" button on main menu
2. ✅ Should open settings modal
3. ✅ Should see account information
4. ✅ Should see "Upgrade Account" prompt (for guest users)

### Test Account Upgrade:
1. As a guest user, click "Upgrade to Full Account"
2. Enter a test email (e.g., test@example.com)
3. Enter a password (min 6 characters)
4. ✅ Should upgrade successfully
5. ✅ Should no longer see "Guest" indicator
6. ✅ Should keep all progress (gems, etc.)

### Test Account Deletion:
1. In Settings, click "Delete Account"
2. Confirm first dialog
3. Confirm second dialog (final confirmation)
4. ✅ Should delete account
5. ✅ Should sign out automatically
6. ✅ Should not be able to sign in with deleted account

### Test Navigation:
1. Open Settings
2. Click "Privacy Policy"
3. ✅ Should show privacy policy screen
4. Click back, then click "Terms of Service"
5. ✅ Should show terms of service screen
6. ✅ All screens should navigate properly

---

## Optional Step 4: Customize Legal Content

### Privacy Policy:
- Edit `app/privacy.tsx`
- Update company information
- Replace `privacy@blocktopia.app` with your email
- Update data collection practices
- Add any additional sections

### Terms of Service:
- Edit `app/terms.tsx`
- Update company information
- Replace `legal@blocktopia.app` with your email
- Update billing/refund policies
- Add jurisdiction information

---

## Troubleshooting

### Issue: "Anonymous sign-in error" when clicking "Continue as Guest"

**Solution:**
- Verify anonymous sign-ins are enabled in Supabase Dashboard
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in `.env`
- Clear app cache and restart

### Issue: "Failed to delete account" error

**Solution:**
- Run the database migration (Step 2)
- Verify RLS policies are in place
- Check console logs for specific errors
- User may have data in additional tables not covered by migration

### Issue: Settings button not appearing

**Solution:**
- Clear Metro bundler cache: `npx expo start -c`
- Rebuild the app
- Check that route is registered in `app/_layout.tsx`

### Issue: Account upgrade not working

**Solution:**
- Verify user is actually anonymous (check `isAnonymousUser()`)
- Ensure email is valid format
- Password must be at least 6 characters
- Check Supabase authentication logs

---

## Security Considerations

### Anonymous Accounts:
- ⚠️ Anonymous accounts have no email/password
- ⚠️ If user loses device, account cannot be recovered
- ✅ Encourage users to upgrade to permanent accounts
- ✅ Show upgrade prompts prominently

### Account Deletion:
- ⚠️ Deletion is irreversible
- ⚠️ All data is permanently lost
- ✅ Double confirmation prevents accidents
- ✅ Clear warnings shown to users

### Data Privacy:
- ✅ Users control their data
- ✅ Can view what data is collected
- ✅ Can delete account anytime
- ✅ GDPR/CCPA compliant approach

---

## Monitoring

### Analytics to Track:
- Anonymous sign-in success rate
- Anonymous → Full account conversion rate
- Account deletion rate
- Settings screen engagement
- Privacy policy views

### Metrics to Watch:
- Time to first game (anonymous vs full account)
- Retention rate (anonymous vs full account)
- Average session length by account type
- Feature usage by account type

---

## Support

If you encounter issues:
1. Check console logs for errors
2. Verify Supabase configuration
3. Review migration execution
4. Test with fresh account
5. Contact development team

---

*Setup should take approximately 10-15 minutes*

**Status After Setup:**
- ✅ Anonymous authentication working
- ✅ Settings screen accessible
- ✅ Account management functional
- ✅ Legal pages available
- ✅ Ready for production testing

---

*Last Updated: November 19, 2025*

