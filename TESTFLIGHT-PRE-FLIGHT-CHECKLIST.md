# ✈️ TestFlight Pre-Flight Checklist

**Before you start the TestFlight submission, fill this out!**

---

## 🔐 STEP 1: Gather Your Credentials

### Apple Developer Account
- [ ] I have an Apple Developer account (or I'm ready to pay $99)
- [ ] My account email: `_________________________@____________`
- [ ] My account is **Active** (check: https://developer.apple.com/account/)

### Apple Team ID
- [ ] Go to: https://developer.apple.com/account/#/membership/
- [ ] Copy your Team ID: `______________________________`

---

## ✅ STEP 2: Verify Current Setup

### EAS Account
- [x] ✅ Logged into EAS as: `turntopia`
- [x] ✅ Project ID: `952e850a-61d0-46d1-a926-6eb791e88023`

### App Configuration
- [x] ✅ Bundle ID: `com.blocktopia.app`
- [x] ✅ App Name: `Blocktopia`
- [x] ✅ Version: `1.0.0`

### Build Status
- [x] ✅ Development build works on iOS device
- [ ] ⏳ Ready to create production build

---

## 📝 STEP 3: Update eas.json

Before building, update these values in `eas.json`:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "YOUR_EMAIL_HERE",           ← Put your Apple ID here
      "ascAppId": "WILL_BE_FILLED_AUTOMATICALLY",
      "appleTeamId": "YOUR_TEAM_ID_HERE"      ← Put Team ID here
    }
  }
}
```

**Fill these in:**
- [ ] Apple ID (email): `_________________________@____________`
- [ ] Team ID: `______________________________`

---

## 🚀 STEP 4: Ready to Build Commands

Once you've filled in the above, run these commands:

```bash
# 1. Make sure you're in the project directory
cd C:\Users\Unmap\Downloads\blocktopia

# 2. Verify you're logged into EAS
eas whoami
# Should show: turntopia

# 3. Build for TestFlight
eas build --platform ios --profile production

# 4. Wait 15-20 minutes...

# 5. Submit to TestFlight
eas submit --platform ios --latest
```

---

## 📱 STEP 5: TestFlight App

- [ ] TestFlight app installed on iPhone
  - Download: https://apps.apple.com/app/testflight/id899247664

---

## ⏱️ Expected Timeline

| Task | Time |
|------|------|
| Fill out this checklist | 5 minutes |
| Update eas.json | 2 minutes |
| Run production build | 15-20 minutes |
| Submit to TestFlight | 5 minutes |
| Apple processing | 5-10 minutes |
| **Total** | **~35-45 minutes** |

---

## ✅ Before You Start

Make sure all these are checked:

- [ ] Apple Developer account ready
- [ ] Team ID copied
- [ ] Apple ID email ready
- [ ] eas.json updated with credentials
- [ ] Logged into EAS (`eas whoami` = turntopia)
- [ ] Terminal open in project directory

**All checked?** → Start with the full guide: `TESTFLIGHT-SUBMISSION-GUIDE.md`

---

## 🆘 Need Help?

- **Full Guide:** `TESTFLIGHT-SUBMISSION-GUIDE.md`
- **EAS Dashboard:** https://expo.dev/accounts/turntopia/projects/blocktopia/builds
- **Apple Developer:** https://developer.apple.com/account/
- **App Store Connect:** https://appstoreconnect.apple.com/

---

**Ready?** Open `TESTFLIGHT-SUBMISSION-GUIDE.md` and follow Step 1! 🚀

