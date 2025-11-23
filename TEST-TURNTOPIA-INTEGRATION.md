# 🧪 TURNTOPIA INTEGRATION - QUICK TEST GUIDE

## ⚡ Fast Setup (Do This First!)

### 1. Get Unmap's Supabase Anon Key
```bash
# Open Unmap's Supabase Dashboard
# Go to: Settings → API → Project API keys
# Copy the "anon" key (public key)
```

### 2. Add to Blocktopia EAS Secrets
```bash
cd C:\Users\Unmap\Downloads\blocktopia

# Add the key
eas secret:create --scope project --name UNMAP_SUPABASE_ANON_KEY --value YOUR_ANON_KEY_HERE --type string

# Verify it was added
eas secret:list
```

### 3. Test Locally
```bash
# Start Unmap (Terminal 1)
cd C:\Users\Unmap\Downloads\unmap-app-v5.1-production-build-main
npx expo start

# Start Blocktopia (Terminal 2)
cd C:\Users\Unmap\Downloads\blocktopia
npx expo start
```

---

## 🎯 5-Minute Integration Test

### Test 1: Anonymous Play (30 seconds)
1. Open Blocktopia
2. Tap "Play"
3. Play a quick game
4. Check gems (should earn some)
5. ✅ **Expected**: Game works, gems increment

### Test 2: Sign-In Banner Visibility (15 seconds)
1. Go back to main menu
2. Look for "🎁 Sign In to Earn Rewards" banner
3. Check it shows current gem count
4. ✅ **Expected**: Banner visible for anonymous users

### Test 3: Sign-In Flow (2 minutes)
1. Tap "Sign In to Earn Rewards" banner
2. **Intro Screen**: See benefits listed
3. Tap "Get Started"
4. **Phone Screen**: Enter +1 555-123-4567
5. Tap "Send Code"
6. **OTP Screen**: Check your phone for code
7. Enter 6-digit code
8. **Age Screen**: Select birthdate (must be 13+)
9. Tap "Confirm"
10. **Linking Screen**: See "Converting Diamonds..."
11. **Success Screen**: See "Account Linked!"
12. ✅ **Expected**: All screens transition smoothly, no errors

### Test 4: Unmap Partial Onboarding (1 minute)
1. Close Blocktopia
2. Open Unmap
3. Log in with same phone number from Test 3
4. ✅ **Expected**: Should skip phone/age steps, go directly to profile name

### Test 5: T Tokens Display (30 seconds)
1. In Unmap, tap "Wallet" tab (bottom navigation)
2. Scroll to top
3. See "T Tokens" card with gradient background
4. ✅ **Expected**: Balance matches gems from Blocktopia (e.g., 500)

### Test 6: Profile Sync (1 minute)
1. In Blocktopia, go to Settings (⚙️)
2. Scroll to "Turntopia Profile" section
3. See T Tokens balance
4. Enter display name: "TestSync123"
5. Tap "Sync Across All Apps"
6. See success message
7. Open Unmap → Check profile name
8. ✅ **Expected**: Name is "TestSync123" in Unmap

---

## 🐛 Quick Debug Checks

### If "Sign In to Earn Rewards" doesn't show:
```javascript
// Check in Blocktopia main menu
console.log('Is Anonymous:', user.isAnonymous); // Should be true
console.log('Is Authenticated:', user.isAuthenticated); // Should be true
```

### If OTP doesn't send:
1. Check Unmap's Supabase Dashboard → Authentication → Settings
2. Verify Phone Auth is enabled
3. Check provider (Twilio/MessageBird) is configured

### If Edge Function fails:
```bash
# Check logs in Unmap's Supabase Dashboard
# Go to: Edge Functions → link-blocktopia-account → Logs
```

### If T Tokens don't show in Unmap:
```sql
-- Run in Unmap's Supabase SQL Editor
SELECT * FROM public.universal_wallets WHERE user_id = 'YOUR_USER_ID';
```

---

## 📊 Verification Checklist

### Database (Unmap's Supabase)
- [ ] `universal_wallets` table exists
- [ ] `game_blocktopia_profiles` table exists
- [ ] RPC functions exist: `add_t_tokens`, `spend_t_tokens`, `get_t_token_balance`
- [ ] `handle_new_user` trigger creates wallet entries

### Edge Functions (Unmap's Supabase)
- [ ] `link-blocktopia-account` is ACTIVE
- [ ] `sync-profile` is ACTIVE
- [ ] `get-ecosystem-profile` is ACTIVE

### Blocktopia App
- [ ] `TurntopiaSignInModal.tsx` exists
- [ ] `PhoneInput.tsx`, `OTPInput.tsx`, `AgeVerification.tsx` exist
- [ ] "Sign In" banner shows on main menu
- [ ] app.config.js has `UNMAP_SUPABASE_URL` and `UNMAP_SUPABASE_ANON_KEY`

### Unmap App
- [ ] T Tokens card shows in Wallet tab
- [ ] Smart onboarding routing works (skips completed steps)

---

## 🚨 Common Issues & Fixes

### Issue: "UNMAP_SUPABASE_ANON_KEY is undefined"
**Solution**:
```bash
# Make sure you added the EAS Secret
eas secret:create --scope project --name UNMAP_SUPABASE_ANON_KEY --value YOUR_KEY --type string

# Restart Expo
npx expo start --clear
```

### Issue: "Not authenticated" error
**Solution**: User must complete phone + OTP verification before linking

### Issue: Age verification shows even though already done
**Solution**: Check `profiles` table in Unmap's Supabase:
```sql
UPDATE public.profiles
SET age_verified = true, birth_date = '2000-01-01'
WHERE id = 'YOUR_USER_ID';
```

### Issue: T Tokens balance is 0 after linking
**Solution**: Check Edge Function logs for errors. Ensure Diamonds were > 0 before linking.

---

## 🎬 Video Walkthrough Script

### Recording Tips:
1. Use screen recorder (OBS, QuickTime)
2. Show both apps side-by-side if possible
3. Narrate each step
4. Show success messages

### Script:
```
1. "Here's Blocktopia, a Tetris-style game"
2. "I'm playing anonymously as a guest"
3. "I earned 500 gems playing"
4. "Now I see this banner: Sign In to Earn Rewards"
5. "I tap it and see the benefits"
6. "I enter my phone number"
7. "I receive an OTP code"
8. "I verify my age"
9. "My account is now linked!"
10. "My 500 gems became 500 T Tokens"
11. "Now I open Unmap"
12. "I log in with the same phone number"
13. "It skips phone and age verification"
14. "I just need to add my name and location"
15. "And here's my wallet - 500 T Tokens!"
16. "These T Tokens work across all Turntopia apps"
```

---

## 🏆 Success Metrics

After testing, you should see:

### Blocktopia
- ✅ Anonymous play works
- ✅ Sign-in banner shows
- ✅ Complete onboarding flow works
- ✅ Banner disappears after sign-in
- ✅ Settings shows Turntopia Profile section

### Unmap
- ✅ Partial onboarding skips completed steps
- ✅ T Tokens display in Wallet tab
- ✅ Balance matches converted Diamonds
- ✅ Profile sync works

### Database
- ✅ New entry in `universal_wallets` for user
- ✅ New entry in `game_blocktopia_profiles` for user
- ✅ T Tokens balance is correct

### Edge Functions
- ✅ `link-blocktopia-account` successful call
- ✅ `sync-profile` successful call
- ✅ `get-ecosystem-profile` successful call

---

## 📞 Need Help?

### Check Edge Function Logs:
1. Go to Unmap's Supabase Dashboard
2. Edge Functions → [function-name] → Logs
3. Look for errors in last 24 hours

### Check Database State:
```sql
-- Check if wallet exists
SELECT * FROM public.universal_wallets WHERE user_id = 'YOUR_USER_ID';

-- Check if Blocktopia profile exists
SELECT * FROM public.game_blocktopia_profiles WHERE user_id = 'YOUR_USER_ID';

-- Check if profile has age verified
SELECT age_verified, birth_date FROM public.profiles WHERE id = 'YOUR_USER_ID';
```

### Check Auth State in App:
```javascript
// In Blocktopia
import { supabase } from './path/to/unmapSupabase';
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

---

## ✅ Final Checklist Before Production

- [ ] Test on iOS device (not just simulator)
- [ ] Test on Android device (not just emulator)
- [ ] Test with real phone number (not test number)
- [ ] Verify OTP delivery time (should be < 30 seconds)
- [ ] Test age verification rejection (< 13 years old)
- [ ] Test profile sync in both directions
- [ ] Monitor Edge Function performance (response time < 2 seconds)
- [ ] Check for memory leaks (play for 10+ minutes)
- [ ] Test with slow network (airplane mode on/off)
- [ ] Verify COPPA compliance (terms of service, privacy policy)

---

## 🎉 You're Done!

If all tests pass, your Turntopia ecosystem is fully functional and ready for production!

**Next Steps**:
1. Submit to TestFlight / Google Play Beta
2. Gather user feedback
3. Monitor Edge Function logs
4. Optimize based on analytics

🚀 **Happy Launching!**

