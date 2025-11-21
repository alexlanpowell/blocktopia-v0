# 🍎 Your Apple Developer Setup - Blocktopia

**Apple ID:** turntopia@gmail.com  
**Expo Account:** turntopia  
**Developer:** Alexander Powell  
**Status:** ✅ Apple Developer Account Active (from Unmap)

---

## ✅ What's Already Configured

### Your Existing Setup (from Unmap)
- ✅ Apple Developer Account: **Active**
- ✅ Apple ID: **turntopia@gmail.com**
- ✅ Expo Owner: **turntopia**
- ✅ Unmap Bundle ID: `com.unmap.app`
- ✅ Unmap Project ID: `80fe35ab-1440-4666-938b-f06290b85901`

### Blocktopia Configuration
- ✅ Bundle ID: `com.blocktopia.app`
- ✅ Project ID: `952e850a-61d0-46d1-a926-6eb791e88023`
- ✅ Apple ID in eas.json: **turntopia@gmail.com**
- ⏳ Apple Team ID: **Need to add** (see below)

---

## 🎯 ONE THING YOU NEED: Apple Team ID

Since you already have an Apple Developer account from Unmap, you just need to get your **Team ID** and add it to Blocktopia's `eas.json`.

### How to Get Your Team ID (2 minutes)

**Option 1: From Apple Developer Portal (Easiest)**

1. Go to: https://developer.apple.com/account/#/membership/
2. Sign in with: **turntopia@gmail.com**
3. Look for **"Team ID"**
4. It's a 10-character code like: `ABC123DEFG`
5. Copy it!

**Option 2: From App Store Connect**

1. Go to: https://appstoreconnect.apple.com/
2. Click **"Users and Access"**
3. Your Team ID is displayed at the top

**Option 3: From Xcode (if you have it)**

1. Open Xcode
2. Go to Preferences → Accounts
3. Select your Apple ID
4. Your Team ID is shown next to your name

---

## 🔧 Add Team ID to Blocktopia

Once you have your Team ID, update `eas.json`:

### Current (lines 34-38):
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "turntopia@gmail.com",
      "ascAppId": "WILL_BE_FILLED_AUTOMATICALLY",
      "appleTeamId": "GET_FROM_APPLE_DEVELOPER_PORTAL"  ← Replace this
    }
  }
}
```

### Updated (YOUR Team ID):
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "turntopia@gmail.com",
      "ascAppId": "WILL_BE_FILLED_AUTOMATICALLY",
      "appleTeamId": "YOUR_ACTUAL_TEAM_ID_HERE"  ← Paste your Team ID here
    }
  }
}
```

**Example (if your Team ID is ABC123DEFG):**
```json
"appleTeamId": "ABC123DEFG"
```

---

## ✅ After You Add Team ID

Once you've updated `eas.json` with your Team ID, you're **100% ready** to build for TestFlight!

### Run These Commands:

```bash
# 1. Navigate to project
cd C:\Users\Unmap\Downloads\blocktopia

# 2. Verify you're logged into EAS
eas whoami
# Should show: turntopia ✅

# 3. Build for TestFlight (15-20 min)
eas build --platform ios --profile production

# 4. Submit to TestFlight (5 min)
eas submit --platform ios --latest
```

---

## 📱 Create Blocktopia App in App Store Connect

Before you can submit to TestFlight, you need to create the Blocktopia app in App Store Connect (just like you did for Unmap).

### Steps (10 minutes):

1. **Go to App Store Connect**
   - URL: https://appstoreconnect.apple.com/
   - Sign in with: **turntopia@gmail.com**

2. **Click "My Apps"** → Click the **"+"** button

3. **Select "New App"**

4. **Fill Out the Form:**

   | Field | Value |
   |-------|-------|
   | Platform | ✅ iOS |
   | Name | `Blocktopia` |
   | Primary Language | English (U.S.) |
   | Bundle ID | `com.blocktopia.app` |
   | SKU | `blocktopia-ios-2025` |
   | User Access | Full Access |

5. **If Bundle ID is missing:**
   - Go to: https://developer.apple.com/account/resources/identifiers/list
   - Click **"+"** button
   - Select **"App IDs"** → Continue
   - Select **"App"** → Continue
   - **Description:** Blocktopia
   - **Bundle ID:** `com.blocktopia.app` (Explicit)
   - Select **Capabilities:**
     - ✅ Associated Domains
     - ✅ Push Notifications  
     - ✅ Sign In with Apple
     - ✅ In-App Purchase
   - Click **"Continue"** → **"Register"**
   - Go back to App Store Connect and refresh

6. **Click "Create"**

✅ **Done!** Your Blocktopia app is now created!

---

## 🎯 Your Complete Configuration

### Blocktopia eas.json
```json
{
  "cli": {
    "version": ">= 13.2.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "node": "20.18.0",
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "image": "latest",
        "resourceClass": "m-medium",
        "simulator": false
      }
    },
    "production": {
      "node": "20.18.0",
      "distribution": "store",
      "ios": {
        "image": "latest",
        "resourceClass": "m-medium",
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "turntopia@gmail.com",
        "ascAppId": "WILL_BE_FILLED_AUTOMATICALLY",
        "appleTeamId": "[YOUR_TEAM_ID_HERE]"
      }
    }
  }
}
```

### Blocktopia app.json
```json
{
  "expo": {
    "name": "Blocktopia",
    "slug": "blocktopia",
    "owner": "turntopia",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.blocktopia.app"
    }
  }
}
```

---

## 📊 Side-by-Side Comparison

| Item | Unmap | Blocktopia |
|------|-------|------------|
| **Apple ID** | turntopia@gmail.com | turntopia@gmail.com |
| **Team ID** | [Your Team ID] | [Same Team ID] |
| **Expo Owner** | turntopia | turntopia |
| **Bundle ID** | com.unmap.app | com.blocktopia.app |
| **Project ID** | 80fe35ab-1440-4666-938b-f06290b85901 | 952e850a-61d0-46d1-a926-6eb791e88023 |
| **Status** | ✅ On TestFlight | 🟡 Ready to submit |

---

## ⏱️ Expected Timeline

| Task | Time |
|------|------|
| Get Apple Team ID | 2 minutes |
| Update eas.json | 1 minute |
| Create app in App Store Connect | 10 minutes |
| Run production build | 15-20 minutes |
| Submit to TestFlight | 5 minutes |
| Apple processing | 5-10 minutes |
| **TOTAL** | **~35-50 minutes** |

---

## 🚀 Quick Start Checklist

- [ ] Get Apple Team ID from: https://developer.apple.com/account/#/membership/
- [ ] Update `eas.json` line 37 with your Team ID
- [ ] Create Blocktopia app in App Store Connect
- [ ] Run `eas build --platform ios --profile production`
- [ ] Run `eas submit --platform ios --latest`
- [ ] Wait for TestFlight processing
- [ ] Install via TestFlight app on iPhone

---

## 🔗 Important Links

### Your Accounts
- **Apple Developer:** https://developer.apple.com/account/
- **App Store Connect:** https://appstoreconnect.apple.com/
- **EAS Dashboard (Blocktopia):** https://expo.dev/accounts/turntopia/projects/blocktopia/builds
- **EAS Dashboard (Unmap):** https://expo.dev/accounts/turntopia/projects/unmap/builds

### Documentation
- **Full TestFlight Guide:** `TESTFLIGHT-SUBMISSION-GUIDE.md`
- **Pre-Flight Checklist:** `TESTFLIGHT-PRE-FLIGHT-CHECKLIST.md`
- **Summary:** `TESTFLIGHT-READY-SUMMARY.md`

---

## ✅ You're Almost There!

**What you already have:**
- ✅ Apple Developer Account (from Unmap)
- ✅ Apple ID configured in eas.json
- ✅ Working development builds
- ✅ Proven configuration (based on Unmap)

**What you need to do:**
1. ⏳ Get Team ID (2 minutes)
2. ⏳ Update eas.json (1 minute)
3. ⏳ Create app in App Store Connect (10 minutes)
4. ⏳ Build and submit! (25 minutes)

**Total time to TestFlight: ~40 minutes** 🚀

---

## 🆘 Need Help?

Check these files in order:
1. **This file** - Your specific setup
2. **TESTFLIGHT-PRE-FLIGHT-CHECKLIST.md** - Fill this out
3. **TESTFLIGHT-SUBMISSION-GUIDE.md** - Complete walkthrough

**You've got this!** You already did it successfully with Unmap! 💪

---

**Next Step:** Get your Team ID from https://developer.apple.com/account/#/membership/ and add it to `eas.json`!

