# Complete AdMob & RevenueCat Setup Guide for Blocktopia

## Overview
This guide walks you through setting up both AdMob (for ads) and RevenueCat (for in-app purchases and subscriptions) for your Blocktopia game.

---

# Part 1: Google AdMob Setup

## Step 1: Create AdMob Account

1. Go to [https://admob.google.com](https://admob.google.com)
2. Sign in with your Google account
3. Click "Get Started" or "Sign Up"
4. Accept terms and conditions
5. Select your country and timezone

---

## Step 2: Create Your App in AdMob

### For iOS App:

1. Click "Apps" in left sidebar
2. Click "Add App"
3. Select "iOS"
4. Choose "Yes" for "Is your app listed on a supported app store?"
5. Search for your app (if already on App Store) OR select "No" if not yet published
6. Enter app name: **Blocktopia**
7. Select app platform: **iOS**
8. Click "Add App"
9. **Copy your iOS App ID** (format: `ca-app-pub-XXXXX~XXXXX`)

### For Android App:

1. Click "Apps" in left sidebar
2. Click "Add App"
3. Select "Android"
4. Choose "Yes" for "Is your app listed on a supported app store?"
5. Search for your app (if already on Play Store) OR select "No" if not yet published
6. Enter app name: **Blocktopia**
7. Enter package name: **com.blocktopia.app** (must match your app.json)
8. Click "Add App"
9. **Copy your Android App ID** (format: `ca-app-pub-XXXXX~XXXXX`)

---

## Step 3: Create Ad Units

You need to create 3 ad unit types × 2 platforms = 6 total ad units:

### iOS Ad Units:

#### 1. Rewarded Video Ad (iOS)
1. Select your iOS app
2. Click "Ad units" tab
3. Click "Add ad unit"
4. Select "Rewarded"
5. Name: **Continue Reward**
6. Click "Create ad unit"
7. **Copy the Ad unit ID** (format: `ca-app-pub-XXXXX/XXXXX`)
8. Save this as `ADMOB_REWARDED_AD_UNIT_IOS`

#### 2. Interstitial Ad (iOS)
1. Click "Add ad unit"
2. Select "Interstitial"
3. Name: **Game Over Interstitial**
4. Click "Create ad unit"
5. **Copy the Ad unit ID**
6. Save this as `ADMOB_INTERSTITIAL_AD_UNIT_IOS`

#### 3. Banner Ad (iOS)
1. Click "Add ad unit"
2. Select "Banner"
3. Name: **Game Screen Banner**
4. Click "Create ad unit"
5. **Copy the Ad unit ID**
6. Save this as `ADMOB_BANNER_AD_UNIT_IOS`

### Android Ad Units:

Repeat the same process for your Android app:
- **Continue Reward** → `ADMOB_REWARDED_AD_UNIT_ANDROID`
- **Game Over Interstitial** → `ADMOB_INTERSTITIAL_AD_UNIT_ANDROID`
- **Game Screen Banner** → `ADMOB_BANNER_AD_UNIT_ANDROID`

---

## Step 4: Configure App Settings

1. Go to "App settings" for each app
2. Enable "App-level ad settings"
3. Set **Maximum ad content rating:** PG
4. Enable **Tag for child-directed treatment:** No
5. Enable **Tag for users under age of consent:** No
6. Save settings

---

## Step 5: Set Up Payment Information

1. Click "Payments" in left sidebar
2. Click "Add payment method"
3. Enter your business/personal information
4. Add bank account or wire transfer details
5. Set payment threshold (minimum $100)
6. Verify your address (AdMob will send a PIN)

---

## Step 6: Update Your .env File

Add all the IDs you copied to your `.env` file:

```env
# AdMob App IDs
ADMOB_APP_ID_IOS=ca-app-pub-1234567890~1234567890
ADMOB_APP_ID_ANDROID=ca-app-pub-1234567890~9876543210

# AdMob Ad Unit IDs - iOS
ADMOB_REWARDED_AD_UNIT_IOS=ca-app-pub-1234567890/1111111111
ADMOB_INTERSTITIAL_AD_UNIT_IOS=ca-app-pub-1234567890/2222222222
ADMOB_BANNER_AD_UNIT_IOS=ca-app-pub-1234567890/3333333333

# AdMob Ad Unit IDs - Android
ADMOB_REWARDED_AD_UNIT_ANDROID=ca-app-pub-1234567890/4444444444
ADMOB_INTERSTITIAL_AD_UNIT_ANDROID=ca-app-pub-1234567890/5555555555
ADMOB_BANNER_AD_UNIT_ANDROID=ca-app-pub-1234567890/6666666666
```

---

## Step 7: Update app.json

Add AdMob plugin configuration if not already present:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-1234567890~9876543210",
          "iosAppId": "ca-app-pub-1234567890~1234567890"
        }
      ]
    ]
  }
}
```

---

## Step 8: Test with Test Ads

Before using your real ad units, test with AdMob test IDs:

**Test Ad Unit IDs (use these during development):**
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

---

# Part 2: RevenueCat Setup

## Step 1: Create RevenueCat Account

1. Go to [https://www.revenuecat.com](https://www.revenuecat.com)
2. Click "Sign Up" or "Get Started"
3. Create account with email
4. Verify your email address
5. Complete onboarding questionnaire

---

## Step 2: Create a Project

1. Click "Create new project"
2. Project name: **Blocktopia**
3. Select your app category: **Games**
4. Click "Create"

---

## Step 3: Add iOS App

1. In your project, click "Apps"
2. Click "Add new app"
3. Select platform: **iOS**
4. App name: **Blocktopia iOS**
5. Bundle ID: **com.blocktopia.app** (must match Xcode)
6. Click "Save"
7. **Copy your iOS API Key** (starts with `rcb_`)
8. Save this as `REVENUECAT_API_KEY_IOS`

---

## Step 4: Add Android App

1. Click "Add new app"
2. Select platform: **Android**
3. App name: **Blocktopia Android**
4. Package name: **com.blocktopia.app** (must match app.json)
5. Click "Save"
6. **Copy your Android API Key** (starts with `rcb_`)
7. Save this as `REVENUECAT_API_KEY_ANDROID`

---

## Step 5: Connect to App Store Connect (iOS)

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "Users and Access"
3. Click "Integrations" tab
4. Click "+" to generate App Store Connect API Key
5. Name: **RevenueCat**
6. Access: **Admin** (or Sales and Finance)
7. Download the `.p8` key file
8. Copy the **Key ID** and **Issuer ID**

9. Back in RevenueCat:
   - Go to your iOS app settings
   - Click "App Store Connect"
   - Upload the `.p8` file
   - Enter Key ID and Issuer ID
   - Click "Save"

---

## Step 6: Connect to Google Play Console (Android)

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (or create it)
3. Go to "Setup" → "API access"
4. Click "Create new service account"
5. Follow link to Google Cloud Console
6. Create service account: **revenuecat-service**
7. Grant role: **Pub/Sub Admin**
8. Create JSON key
9. Download the JSON file

10. Back in RevenueCat:
    - Go to your Android app settings
    - Click "Google Play"
    - Upload the JSON service account file
    - Click "Save"

---

## Step 7: Create Products in App Stores

### iOS Products (App Store Connect):

1. Go to App Store Connect
2. Select your app
3. Go to "Features" → "In-App Purchases"
4. Click "+" to create new product

**Create these products:**

#### 1. Gem Pack Small
- Type: **Consumable**
- Reference Name: **100 Gems**
- Product ID: **com.blocktopia.app.gems.small**
- Price: **$0.99**

#### 2. Gem Pack Medium
- Type: **Consumable**
- Reference Name: **500 Gems**
- Product ID: **com.blocktopia.app.gems.medium**
- Price: **$4.99**

#### 3. Gem Pack Large
- Type: **Consumable**
- Reference Name: **1200 Gems**
- Product ID: **com.blocktopia.app.gems.large**
- Price: **$9.99**

#### 4. Remove Ads
- Type: **Non-Consumable**
- Reference Name: **Remove Ads Forever**
- Product ID: **com.blocktopia.app.removeads**
- Price: **$2.99**

#### 5. Premium Subscription
- Type: **Auto-Renewable Subscription**
- Reference Name: **Premium Monthly**
- Product ID: **com.blocktopia.app.premium.monthly**
- Subscription Group: **Premium**
- Duration: **1 month**
- Price: **$4.99/month**

### Android Products (Google Play Console):

1. Go to Google Play Console
2. Select your app
3. Go to "Monetize" → "Products" → "In-app products"
4. Click "Create product"

Create the same products with matching IDs.

---

## Step 8: Configure Products in RevenueCat

1. In RevenueCat, go to "Products"
2. Click "Add new product"
3. For each product:
   - Enter Product ID (must match App Store/Play Store)
   - Select product type
   - Add to both iOS and Android
   - Click "Save"

**Products to add:**
- `com.blocktopia.app.gems.small`
- `com.blocktopia.app.gems.medium`
- `com.blocktopia.app.gems.large`
- `com.blocktopia.app.removeads`
- `com.blocktopia.app.premium.monthly`

---

## Step 9: Create Entitlements

1. In RevenueCat, go to "Entitlements"
2. Click "Add new entitlement"

**Create these entitlements:**

### 1. Premium Entitlement
- Entitlement ID: **premium**
- Display name: **Premium Access**
- Description: **Full premium features**
- Attach product: **com.blocktopia.app.premium.monthly**

### 2. Ad-Free Entitlement
- Entitlement ID: **ad_free**
- Display name: **Ad-Free Experience**
- Description: **Remove all ads**
- Attach products: 
  - **com.blocktopia.app.removeads**
  - **com.blocktopia.app.premium.monthly** (premium includes ad-free)

---

## Step 10: Create Offerings

1. In RevenueCat, go to "Offerings"
2. Click "Create new offering"

**Create "Default" offering:**
- Offering ID: **default**
- Description: **Main monetization offering**
- Packages:
  - **Monthly Premium** → `com.blocktopia.app.premium.monthly`
  - **Remove Ads** → `com.blocktopia.app.removeads`
  - **Small Gems** → `com.blocktopia.app.gems.small`
  - **Medium Gems** → `com.blocktopia.app.gems.medium`
  - **Large Gems** → `com.blocktopia.app.gems.large`

---

## Step 11: Update Your .env File

Add RevenueCat API keys:

```env
# RevenueCat API Keys
REVENUECAT_API_KEY_IOS=rcb_XXXXXXXXXXXXXXXXXXXXXXXX
REVENUECAT_API_KEY_ANDROID=rcb_YYYYYYYYYYYYYYYYYYYYYYYY
```

---

## Step 12: Test Purchases

### iOS Testing:
1. Add test user in App Store Connect ("Users and Access" → "Sandbox Testers")
2. Sign out of App Store on device
3. Run your app
4. Make a purchase
5. Sign in with sandbox tester account
6. Complete test purchase

### Android Testing:
1. Add test user in Google Play Console ("Setup" → "License testing")
2. Add email to internal testing track
3. Install app from internal testing
4. Make test purchase
5. Verify in RevenueCat dashboard

---

## Step 13: Monitor Revenue

### RevenueCat Dashboard:
- **Overview:** Real-time revenue, subscribers, trials
- **Customers:** Individual purchase history
- **Charts:** Revenue trends, conversion rates
- **Experiments:** A/B test pricing

### AdMob Dashboard:
- **Overview:** Daily earnings, impressions, eCPM
- **Reports:** Ad unit performance
- **Optimization:** Ad placement recommendations

---

## Troubleshooting

### Common AdMob Issues:
1. **"Ad failed to load"** → Check internet, verify ad unit IDs
2. **"No fill"** → Normal for new apps, improves over time
3. **"Invalid request"** → Check app ID in app.json matches AdMob

### Common RevenueCat Issues:
1. **"Product not found"** → Verify product IDs match exactly
2. **"Unable to connect"** → Check API keys, internet connection
3. **"Receipt validation failed"** → Ensure App Store Connect is linked

---

## Production Checklist

Before launching:
- [ ] Replace all test ad unit IDs with production IDs
- [ ] Verify all products are approved in App Store/Play Store
- [ ] Test purchases with sandbox accounts
- [ ] Verify RevenueCat webhook is receiving events
- [ ] Set up payment methods in AdMob
- [ ] Add privacy policy URL to app stores
- [ ] Enable GDPR consent if targeting EU
- [ ] Test on physical devices (iOS and Android)
- [ ] Monitor first 24 hours closely

---

## Support Resources

**AdMob:**
- Help Center: https://support.google.com/admob
- Community: https://groups.google.com/g/google-admob-ads-sdk

**RevenueCat:**
- Documentation: https://docs.revenuecat.com
- Community: https://community.revenuecat.com
- Support: support@revenuecat.com

---

## Estimated Setup Time

- **AdMob Setup:** 30-60 minutes
- **RevenueCat Setup:** 1-2 hours
- **Product Creation:** 1-2 hours
- **Testing:** 1-2 hours
- **Total:** 4-7 hours

---

## Next Steps

After setup is complete:
1. Test all ad types and purchases
2. Monitor analytics for first week
3. Optimize based on data
4. Scale user acquisition

**You're ready to monetize! 🚀**

