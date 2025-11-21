# AdMob Setup Quick Reference

## 🎯 **WHERE DO YOUR ADMOB IDS GO?**

Your AdMob ad units go in **2 files**:

---

## **FILE #1: `.env` (Project Root)**

### What goes here:
- ✅ **App IDs** (2 total: iOS + Android)
- ✅ **Ad Unit IDs** (6 total: 3 for iOS, 3 for Android)

### Required Variables:
```env
# AdMob App IDs (from AdMob console - Apps section)
ADMOB_APP_ID_IOS=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
ADMOB_APP_ID_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX

# iOS Ad Unit IDs (from AdMob console - Ad units section)
ADMOB_REWARDED_AD_UNIT_IOS=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_INTERSTITIAL_AD_UNIT_IOS=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_BANNER_AD_UNIT_IOS=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX

# Android Ad Unit IDs (from AdMob console - Ad units section)
ADMOB_REWARDED_AD_UNIT_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_INTERSTITIAL_AD_UNIT_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_BANNER_AD_UNIT_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
```

### Format:
- **App ID format:** `ca-app-pub-1234567890123456~1234567890` (has a `~` tilde)
- **Ad Unit ID format:** `ca-app-pub-1234567890123456/1234567890` (has a `/` slash)

---

## **FILE #2: `app.json` (Project Root)**

### What goes here:
- ✅ **App IDs ONLY** (same 2 App IDs from .env)

### Location:
Inside the `plugins` array, I've already added this section:

```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
    "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
  }
]
```

### ⚠️ **IMPORTANT:**
- Replace `XXXXXXXXXXXXXXXX~XXXXXXXXXX` with your **actual App IDs**
- Use the **SAME App IDs** from your `.env` file
- These are **NOT** ad unit IDs (no `/` slash - they have `~` tilde)

---

## 📋 **CHECKLIST:**

### ✅ Step 1: Create AdMob Account
1. Go to https://admob.google.com
2. Sign in with Google account
3. Click "Get Started"

### ✅ Step 2: Create Your Apps
1. Click "Apps" → "Add App"
2. Create **iOS app** → Copy App ID (with `~` tilde)
3. Create **Android app** → Copy App ID (with `~` tilde)

### ✅ Step 3: Create Ad Units (3 per platform = 6 total)

**For iOS App:**
1. Rewarded Video → Name: "Continue Reward" → Copy ID
2. Interstitial → Name: "Game Over" → Copy ID
3. Banner → Name: "Game Screen" → Copy ID

**For Android App:**
1. Rewarded Video → Name: "Continue Reward" → Copy ID
2. Interstitial → Name: "Game Over" → Copy ID
3. Banner → Name: "Game Screen" → Copy ID

### ✅ Step 4: Update Your Files

**Update `.env`:**
- Add all 8 AdMob IDs (2 App IDs + 6 Ad Unit IDs)
- Make sure format is correct (no quotes, no spaces)

**Update `app.json`:**
- Replace the placeholder `androidAppId` with your Android App ID
- Replace the placeholder `iosAppId` with your iOS App ID
- These should match the App IDs in your `.env` file

### ✅ Step 5: Restart Dev Server
After updating `.env`, you MUST restart:
```bash
# Stop your current server (Ctrl+C)
npm start -- --reset-cache
```

---

## 🧪 **TESTING:**

### Option 1: Use Test IDs (Recommended First)
Use Google's official test ad units in your `.env`:

```env
# iOS Test IDs
ADMOB_REWARDED_AD_UNIT_IOS=ca-app-pub-3940256099942544/1712485313
ADMOB_INTERSTITIAL_AD_UNIT_IOS=ca-app-pub-3940256099942544/4411468910
ADMOB_BANNER_AD_UNIT_IOS=ca-app-pub-3940256099942544/2934735716

# Android Test IDs
ADMOB_REWARDED_AD_UNIT_ANDROID=ca-app-pub-3940256099942544/5224354917
ADMOB_INTERSTITIAL_AD_UNIT_ANDROID=ca-app-pub-3940256099942544/1033173712
ADMOB_BANNER_AD_UNIT_ANDROID=ca-app-pub-3940256099942544/6300978111
```

**Note:** You still need your real App IDs in `app.json` and `.env`

### Option 2: Use Your Real IDs
- Ads may take 24-48 hours to start showing
- "No fill" errors are normal for new ad units
- Don't click your own ads (will get you banned!)

---

## ❌ **COMMON MISTAKES:**

### 1. Wrong ID in Wrong Place
- ❌ **WRONG:** Ad unit ID in `app.json` (should be App ID)
- ✅ **RIGHT:** App IDs in `app.json`, Ad Unit IDs only in `.env`

### 2. Swapped iOS and Android IDs
- ❌ **WRONG:** iOS ID in Android field
- ✅ **RIGHT:** Match platform labels in AdMob console

### 3. Forgot to Restart Server
- ❌ **WRONG:** Edit `.env` and expect hot reload to work
- ✅ **RIGHT:** Always restart with `npm start -- --reset-cache`

### 4. Using Quotes in .env
- ❌ **WRONG:** `ADMOB_APP_ID_IOS="ca-app-pub-123..."`
- ✅ **RIGHT:** `ADMOB_APP_ID_IOS=ca-app-pub-123...`

### 5. Extra Spaces
- ❌ **WRONG:** `ADMOB_APP_ID_IOS = ca-app-pub-123...`
- ✅ **RIGHT:** `ADMOB_APP_ID_IOS=ca-app-pub-123...`

---

## 🔍 **HOW TO VERIFY IT WORKS:**

### 1. Check Console Logs
When app starts, you should see:
```
BannerAdService initialized with unit ID: ca-app-pub-...
RewardedAdService initialized with unit ID: ca-app-pub-...
InterstitialAdService initialized with unit ID: ca-app-pub-...
```

### 2. Check Ad Display
- **Banner ad:** Should appear at bottom of game screen
- **Interstitial ad:** Shows after 3rd game (every 3 games)
- **Rewarded ad:** Triggered by "Watch Ad for Extra Try" button

### 3. Check AdMob Dashboard
- Wait 24 hours after setup
- Should see impressions, requests, fill rate
- Revenue starts accumulating

---

## 💡 **PRO TIPS:**

### Development:
- Use test ad IDs during development
- Switch to real IDs before production build
- Never click your own real ads

### Production:
- Monitor AdMob dashboard daily for first week
- Check fill rates (should be >90%)
- Watch for policy violations
- Set up payment method when you hit $10

### Optimization:
- Let ads run for 1-2 weeks before changing anything
- A/B test ad frequency (currently every 3 games)
- Monitor user retention (should stay >40%)
- Balance revenue vs user experience

---

## 📊 **EXPECTED RESULTS:**

### Timeline:
- **Hour 1:** Ads show with test IDs
- **Day 1:** Real ads may show "no fill" (normal)
- **Day 2-3:** Fill rate improves to 50-70%
- **Week 1:** Fill rate stabilizes at 80-95%
- **Week 2+:** Consistent revenue

### Revenue (Per 1,000 Daily Users):
- **Month 1:** $500-800
- **Month 2:** $800-1,200
- **Month 3+:** $1,100-1,800

---

## 🆘 **TROUBLESHOOTING:**

### "Ad failed to load"
- ✅ Check internet connection
- ✅ Verify IDs in `.env` are correct
- ✅ Restart dev server
- ✅ Try test IDs first

### "No fill"
- ✅ Normal for new ad units
- ✅ Wait 24-48 hours
- ✅ Check AdMob console for approval status

### "Invalid request"
- ✅ Check App ID in `app.json` matches AdMob
- ✅ Verify bundle ID matches: `com.blocktopia.app`
- ✅ Restart app completely

### Ads not showing at all
- ✅ Check if you're premium (premium users see no ads)
- ✅ Verify `.env` file exists
- ✅ Check console for error messages
- ✅ Verify AdMob SDK is installed

---

## 📞 **NEED HELP?**

### AdMob Support:
- Help Center: https://support.google.com/admob
- Community: https://groups.google.com/g/google-admob-ads-sdk

### In-App Documentation:
- Full setup guide: `ADMOB-REVENUECAT-SETUP-GUIDE.md`
- Quick setup: `QUICK-AD-SETUP-GUIDE.md`
- Implementation details: `COMPLETE-AD-INTEGRATION-SUMMARY.md`

---

## ✅ **SUMMARY:**

### You need to add AdMob IDs to:
1. **`.env`** → 2 App IDs + 6 Ad Unit IDs = 8 total
2. **`app.json`** → 2 App IDs only (I've already added the config section)

### After adding IDs:
1. Save both files
2. Restart dev server: `npm start -- --reset-cache`
3. Build and test on device
4. Watch the revenue roll in! 💰

---

**Last Updated:** November 20, 2024  
**Status:** ✅ Ready to Configure

