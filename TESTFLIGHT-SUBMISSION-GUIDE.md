# 🚀 TestFlight Submission Guide - Blocktopia

**Status:** Ready to Submit to TestFlight  
**Date:** November 21, 2025  
**Based On:** Proven Unmap App Configuration

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [x] ✅ Working development build on iOS device
- [x] ✅ EAS account set up (turntopia)
- [x] ✅ Bundle ID configured: `com.blocktopia.app`
- [x] ✅ EAS Project ID: `952e850a-61d0-46d1-a926-6eb791e88023`
- [ ] ⏳ Apple Developer Account ($99/year)
- [ ] ⏳ App Store Connect app created
- [ ] ⏳ Production build profile configured

---

## 🎯 Overview: What We're Doing

```
Current Status → TestFlight → App Store
    ↓              ↓             ↓
Development    Internal      Public
Build          Testing       Release
(Working ✅)   (Next Step)   (Future)
```

**Today's Goal:** Get Blocktopia on TestFlight for internal testing!

---

## STEP 1: Apple Developer Account Setup

### 1.1 Check If You Already Have One

**Do you have an Apple Developer account from Unmap?**
- If YES → Go to Step 1.3
- If NO → Continue to Step 1.2

### 1.2 Create Apple Developer Account (if needed)

**Cost:** $99/year USD

1. Go to: https://developer.apple.com/programs/enroll/
2. Click **"Enroll"**
3. Sign in with your Apple ID
4. Choose **"Individual"** or **"Organization"**
   - Individual: Faster (instant approval)
   - Organization: Requires business verification (3-5 days)
5. Pay $99 fee
6. Wait for approval (usually instant for Individual)

### 1.3 Verify Your Account is Active

1. Go to: https://developer.apple.com/account/
2. Make sure you see:
   - ✅ "Membership" section showing active status
   - ✅ "Certificates, Identifiers & Profiles" menu

**✅ Once verified, continue to Step 2**

---

## STEP 2: App Store Connect Setup

### 2.1 Access App Store Connect

1. Go to: https://appstoreconnect.apple.com/
2. Sign in with same Apple ID from Step 1
3. You should see the App Store Connect dashboard

### 2.2 Create New App in App Store Connect

1. Click **"My Apps"**
2. Click the **"+"** button (top left)
3. Select **"New App"**

### 2.3 Fill Out App Information

**Required Fields:**

| Field | Value | Notes |
|-------|-------|-------|
| **Platform** | iOS | ✅ Check this box |
| **Name** | Blocktopia | Max 30 characters |
| **Primary Language** | English (U.S.) | Or your preference |
| **Bundle ID** | `com.blocktopia.app` | ⚠️ MUST match app.json! |
| **SKU** | `blocktopia-ios-2025` | Unique identifier (any string) |
| **User Access** | Full Access | Default is fine |

**Bundle ID CRITICAL:**
- The Bundle ID **MUST** be: `com.blocktopia.app`
- This matches your `app.json` line 19
- If it's not in the dropdown, create it in Developer Portal first (see Step 2.4)

### 2.4 Create Bundle ID (if not in dropdown)

If `com.blocktopia.app` isn't available in the dropdown:

1. Open new tab: https://developer.apple.com/account/resources/identifiers/list
2. Click **"+"** button
3. Select **"App IDs"** → Continue
4. Select **"App"** → Continue
5. Fill out:
   - **Description:** Blocktopia
   - **Bundle ID:** `com.blocktopia.app` (Explicit)
6. Select **Capabilities** (scroll down):
   - ✅ Associated Domains (if using deep links)
   - ✅ Push Notifications (if using)
   - ✅ Sign In with Apple (you're using this!)
   - ✅ In-App Purchase (you're using RevenueCat)
7. Click **"Continue"** → **"Register"**
8. Go back to App Store Connect and refresh the page
9. Now `com.blocktopia.app` should be in the Bundle ID dropdown!

### 2.5 Complete App Creation

1. After filling all fields, click **"Create"**
2. You'll be redirected to your new app's page
3. ✅ **App created!** You'll see it in "My Apps"

**✅ Once app is created, continue to Step 3**

---

## STEP 3: Configure EAS for TestFlight Builds

### 3.1 Update eas.json for Production

We need to add a TestFlight-ready build profile.

**Current eas.json** (you have development working):
```json
{
  "build": {
    "development": {
      // ... your working config
    }
  }
}
```

**We're adding this:**

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
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "node": "20.18.0",
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
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "WILL_BE_FILLED_AUTOMATICALLY",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

**Key Changes for TestFlight:**
- `"distribution": "store"` → This is for App Store/TestFlight
- `"resourceClass": "m-medium"` → Matches your working Unmap config
- `"node": "20.18.0"` → Matches your working Unmap config
- `"image": "latest"` → Ensures latest Xcode (16.1)

### 3.2 Find Your Apple Team ID

You need this for the submit section:

1. Go to: https://developer.apple.com/account/#/membership/
2. Look for **"Team ID"**
3. It's usually a 10-character code like: `ABC123DEFG`
4. Copy it!

### 3.3 Update eas.json Submit Section

Replace these values in the `submit.production.ios` section:
- `"appleId"`: Your Apple ID email (same one you log into App Store Connect with)
- `"appleTeamId"`: The Team ID you just copied

**Example:**
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "yourname@email.com",
      "ascAppId": "WILL_BE_FILLED_AUTOMATICALLY",
      "appleTeamId": "ABC123DEFG"
    }
  }
}
```

**Note:** `ascAppId` will be auto-filled by EAS on first submit!

**✅ Once eas.json is updated, continue to Step 4**

---

## STEP 4: Build for TestFlight

### 4.1 Verify You're Logged Into EAS

```bash
# Check if logged in
eas whoami

# If not logged in, login:
eas login
```

You should see: `turntopia` ✅

### 4.2 Build Production iOS Build

**⚠️ IMPORTANT:** This will take 15-20 minutes!

```bash
# Navigate to project
cd C:\Users\Unmap\Downloads\blocktopia

# Build for production (TestFlight)
eas build --platform ios --profile production
```

### 4.3 EAS Will Ask You Some Questions

**Question 1: Generate a new Apple Distribution Certificate?**
```
? Generate a new Apple Distribution Certificate? (Y/n)
```
**Answer:** `Y` (Yes) ✅

**Question 2: Generate a new Apple Provisioning Profile?**
```
? Generate a new Apple Provisioning Profile? (Y/n)
```
**Answer:** `Y` (Yes) ✅

**Question 3: Log in to your Apple account?**
```
? Log in to your Apple account (Y/n)
```
**Answer:** `Y` (Yes) ✅

Then enter:
- Apple ID: your-email@example.com
- Password: your-apple-password
- 2FA Code: (if prompted, check your iPhone)

**EAS will now:**
1. ✅ Create distribution certificate
2. ✅ Create provisioning profile
3. ✅ Start building your app (~15-20 min)

### 4.4 Wait for Build to Complete

You'll see:
```
✔ Build finished
Build ID: abc123-def456-ghi789
Build URL: https://expo.dev/accounts/turntopia/projects/blocktopia/builds/abc123
```

**Track Progress:**
- Dashboard: https://expo.dev/accounts/turntopia/projects/blocktopia/builds
- You'll get an email when complete!

**✅ Once build is complete, continue to Step 5**

---

## STEP 5: Submit to TestFlight

### 5.1 Automatic Submit (Recommended)

EAS can automatically submit to TestFlight!

```bash
# Submit the build you just created
eas submit --platform ios --latest
```

**EAS will:**
1. ✅ Find your latest production build
2. ✅ Upload to App Store Connect
3. ✅ Submit to TestFlight
4. ✅ Wait for Apple processing (~5-10 minutes)

### 5.2 Alternative: Manual Upload (if auto-submit fails)

If automatic submit doesn't work:

1. Download IPA from EAS dashboard
2. Open **Transporter** app (Mac only)
   - Download: https://apps.apple.com/us/app/transporter/id1450874784
3. Drag IPA file into Transporter
4. Click **"Deliver"**

### 5.3 Complete Required Info in App Store Connect

1. Go to: https://appstoreconnect.apple.com/
2. Click **"My Apps"** → **"Blocktopia"**
3. Click **"TestFlight"** tab (top)
4. You should see your build processing!

**Wait for "Processing" to complete** (~5-10 minutes)

**✅ Once processing is done, continue to Step 6**

---

## STEP 6: Configure TestFlight Settings

### 6.1 Add Test Information

1. In App Store Connect → TestFlight tab
2. Click **"Test Information"** (left sidebar)
3. Fill out:

**Required Fields:**
- **Feedback Email:** your-email@example.com
- **First Name:** Your name
- **Last Name:** Your name
- **Phone Number:** Your phone (optional but recommended)

**Test Information:**
- **What to Test:** 
  ```
  Welcome to Blocktopia Beta!
  
  Please test:
  - Core gameplay mechanics
  - Sound effects and music
  - Power-ups
  - In-app purchases
  - AdMob ads (rewarded video)
  - Settings and audio controls
  ```

- **Description:**
  ```
  Blocktopia is a puzzle block game with power-ups, 
  achievements, and premium features.
  ```

4. Click **"Save"**

### 6.2 Enable External Testing (Optional)

If you want to share with friends/family:

1. Click **"External Testing"** (left sidebar)
2. Click **"+"** to add external testers
3. Enter their email addresses
4. They'll get TestFlight invite!

### 6.3 Internal Testing (You + Team)

For just yourself and teammates:

1. Click **"Internal Testing"** (left sidebar)
2. Click **"+"** to create a test group
3. Name it: "Blocktopia Dev Team"
4. Add yourself by email
5. Select the build you just uploaded
6. Click **"Start Testing"**

**✅ TestFlight is now configured!**

---

## STEP 7: Install TestFlight on Your iPhone

### 7.1 Download TestFlight App

1. On your iPhone, open App Store
2. Search for **"TestFlight"**
3. Download the official Apple TestFlight app (it's free!)

### 7.2 Accept Invitation

**Option A: If you added yourself as internal tester:**
1. Check your email for TestFlight invite
2. Open email on your iPhone
3. Tap **"View in TestFlight"**
4. Tap **"Accept"**

**Option B: If you're signed in with same Apple ID:**
1. Open TestFlight app
2. You should automatically see "Blocktopia"
3. Tap **"Install"**

### 7.3 Install and Test!

1. Tap **"Install"** in TestFlight
2. Wait for download (~8 MB)
3. Open Blocktopia from TestFlight
4. Test all features!

**✅ You're now testing your app via TestFlight!** 🎉

---

## STEP 8: Iterate and Update

### 8.1 Make Changes to Your App

After testing, if you find bugs or want to add features:

1. Make code changes locally
2. Test in development build first
3. When ready, build new production version

### 8.2 Build New TestFlight Version

**Update version number first:**

Edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",  // ← Increment this!
    "ios": {
      "buildNumber": "2" // ← Add this and increment
    }
  }
}
```

Then build:
```bash
eas build --platform ios --profile production
```

### 8.3 Submit New Version

```bash
eas submit --platform ios --latest
```

TestFlight will automatically notify your testers of the update!

---

## 📊 Expected Timeline

| Step | Time | Status |
|------|------|--------|
| Apple Developer Account | 0-5 days | Instant for Individual |
| App Store Connect Setup | 15 minutes | One-time |
| EAS Configuration | 10 minutes | One-time |
| Production Build | 15-20 minutes | Per build |
| TestFlight Processing | 5-10 minutes | Per build |
| **Total First Time** | **~40-60 minutes** | (Assuming approved account) |
| **Future Updates** | **~25 minutes** | Just build + submit |

---

## 🐛 Troubleshooting

### Issue: "No Bundle ID found"

**Fix:**
1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Create App ID with Bundle ID: `com.blocktopia.app`
3. Go back to App Store Connect
4. Refresh page, Bundle ID should now appear

### Issue: "Authentication failed"

**Fix:**
1. Make sure you're using correct Apple ID
2. Check 2FA code (check your iPhone)
3. Try `eas logout` then `eas login` again

### Issue: "Build failed during compilation"

**Fix:**
1. Your Unmap config is proven to work
2. Double-check eas.json matches this guide
3. Make sure `"node": "20.18.0"` is set
4. Check build logs on EAS dashboard

### Issue: "App Store Connect upload failed"

**Fix:**
1. Try manual upload with Transporter app
2. Download IPA from EAS dashboard
3. Use Transporter (Mac only) to upload

### Issue: "TestFlight not showing my app"

**Fix:**
1. Wait 10-15 minutes for processing
2. Check App Store Connect → TestFlight for processing status
3. Make sure build passed Apple's automated review

---

## ✅ Success Checklist

After completing all steps, you should have:

- [x] ✅ Apple Developer Account active
- [x] ✅ Blocktopia app created in App Store Connect
- [x] ✅ Production build profile in eas.json
- [x] ✅ Successful production build on EAS
- [x] ✅ App uploaded to TestFlight
- [x] ✅ TestFlight configured with test info
- [x] ✅ TestFlight installed on your iPhone
- [x] ✅ Blocktopia running via TestFlight

**🎉 Congratulations! Your app is on TestFlight!**

---

## 🚀 Next Steps After TestFlight

### Phase 1: Internal Testing (1-2 weeks)
- Test all features thoroughly
- Invite dev team to test
- Fix critical bugs
- Polish UI/UX

### Phase 2: External Testing (2-4 weeks)
- Invite beta testers (up to 10,000!)
- Gather feedback
- Iterate on features
- Monitor crash reports

### Phase 3: App Store Submission
- Complete App Store listing (screenshots, description)
- Submit for App Store review
- Wait for approval (~1-3 days)
- **LAUNCH!** 🚀

---

## 📚 Important Links

**EAS Dashboard:**
- https://expo.dev/accounts/turntopia/projects/blocktopia/builds

**Apple Developer:**
- https://developer.apple.com/account/

**App Store Connect:**
- https://appstoreconnect.apple.com/

**TestFlight:**
- https://testflight.apple.com/

**Expo Docs:**
- https://docs.expo.dev/submit/ios/
- https://docs.expo.dev/build/setup/

---

## 💡 Pro Tips from Your Unmap Experience

Based on your Unmap app success:

1. ✅ **Stick to proven versions** - Don't change package versions that work
2. ✅ **Use `"node": "20.18.0"`** - Required for Supabase compatibility
3. ✅ **Keep `"image": "latest"`** - Ensures latest Xcode
4. ✅ **No prebuildCommand in production** - Causes issues
5. ✅ **Test in dev build first** - Catch issues before TestFlight
6. ✅ **Increment version numbers** - Required for TestFlight updates
7. ✅ **Monitor EAS build logs** - Catch issues early

---

**Ready to start?** Begin with Step 1! 🚀

**Questions?** Check troubleshooting section or refer to Expo docs!

**Good luck with your TestFlight submission!** 🎉

