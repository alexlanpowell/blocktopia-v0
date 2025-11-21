# Quick Ad Setup Guide for Blocktopia

## What's Already Done ✅

All code is implemented and working:
- ✅ Banner ads on game screen
- ✅ Interstitial ads every 3 games
- ✅ Rewarded video ads for continue feature
- ✅ Premium user bypass system
- ✅ Error handling and analytics
- ✅ TypeScript compilation passes
- ✅ No linting errors

## What You Need to Do

### 1. Create AdMob Account (15 minutes)

1. Go to https://admob.google.com
2. Sign in with Google account
3. Click "Get Started"
4. Accept terms and conditions

### 2. Add Your Apps (10 minutes)

**iOS App:**
1. Click "Apps" → "Add App"
2. Select "iOS"
3. Enter app name: "Blocktopia"
4. Copy the App ID (starts with `ca-app-pub-`)

**Android App:**
1. Click "Apps" → "Add App"
2. Select "Android"
3. Enter app name: "Blocktopia"
4. Enter package: `com.blocktopia.app`
5. Copy the App ID

### 3. Create Ad Units (20 minutes)

For **iOS app**, create:
1. **Rewarded Video** → Name: "Continue Reward" → Copy ID
2. **Interstitial** → Name: "Game Over Interstitial" → Copy ID
3. **Banner** → Name: "Game Screen Banner" → Copy ID

For **Android app**, create:
1. **Rewarded Video** → Name: "Continue Reward" → Copy ID
2. **Interstitial** → Name: "Game Over Interstitial" → Copy ID
3. **Banner** → Name: "Game Screen Banner" → Copy ID

### 4. Update .env File (5 minutes)

Add all the IDs you copied:

```env
# AdMob App IDs
ADMOB_APP_ID_IOS=ca-app-pub-1234567890~1234567890
ADMOB_APP_ID_ANDROID=ca-app-pub-1234567890~9876543210

# iOS Ad Units
ADMOB_REWARDED_AD_UNIT_IOS=ca-app-pub-1234567890/1111111111
ADMOB_INTERSTITIAL_AD_UNIT_IOS=ca-app-pub-1234567890/2222222222
ADMOB_BANNER_AD_UNIT_IOS=ca-app-pub-1234567890/3333333333

# Android Ad Units
ADMOB_REWARDED_AD_UNIT_ANDROID=ca-app-pub-1234567890/4444444444
ADMOB_INTERSTITIAL_AD_UNIT_ANDROID=ca-app-pub-1234567890/5555555555
ADMOB_BANNER_AD_UNIT_ANDROID=ca-app-pub-1234567890/6666666666
```

### 5. Update app.json (2 minutes)

Replace test IDs with your real App IDs:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "YOUR_ANDROID_APP_ID_HERE",
          "iosAppId": "YOUR_IOS_APP_ID_HERE"
        }
      ]
    ]
  }
}
```

### 6. Set Up Payment (10 minutes)

1. Go to AdMob → "Payments"
2. Add payment method (bank account)
3. Enter tax information
4. Set payment threshold ($100 minimum)
5. Verify address (PIN will be mailed)

---

## Testing

### Use Test Ads First

While developing, the app automatically uses test ad IDs. You'll see "Test Ad" labels.

### Test on Device

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### Verify Ads Work

1. ✅ Banner appears at bottom during game
2. ✅ Interstitial shows after clicking "Play Again" (every 3rd game)
3. ✅ Continue button appears when game ends
4. ✅ Rewarded video plays when clicking "Watch Ad to Continue"
5. ✅ Game continues after watching full ad

---

## Revenue Expectations

### At 1,000 Daily Users:
- **Total:** $1,100-1,800/month from ads

### At 10,000 Daily Users:
- **Total:** $11,000-18,000/month from ads

### At 100,000 Daily Users:
- **Total:** $110,000-180,000/month from ads

---

## Troubleshooting

### "Ad failed to load"
- Check internet connection
- Verify ad unit IDs are correct
- Wait a few hours for new ad units to activate

### "No fill"
- Normal for new apps
- Improves as you get more users
- Usually 90%+ fill rate after a few days

### Ads not showing
- Check `.env` file has correct IDs
- Verify `app.json` has correct App IDs
- Make sure you're not a premium user
- Check AdMob account is approved

---

## Support

- Full setup guide: `ADMOB-REVENUECAT-SETUP-GUIDE.md`
- Implementation details: `AD-INTEGRATION-COMPLETE.md`
- AdMob help: https://support.google.com/admob

---

**Total Setup Time:** ~1 hour  
**Start Earning:** Within 24 hours of approval


