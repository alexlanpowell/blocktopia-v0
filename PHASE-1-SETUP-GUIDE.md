# Phase 1 Setup Guide: Authentication & Infrastructure

## ✅ What's Been Implemented

Phase 1 of the Blocktopia monetization system is now complete! Here's what has been integrated:

### Core Services
- ✅ **Supabase Client** - Secure backend connection with MMKV storage
- ✅ **Authentication Service** - Apple Sign-In, Google Sign-In, Anonymous Auth
- ✅ **Monetization Store** - Zustand store for all monetization state
- ✅ **Analytics Service** - Event tracking foundation
- ✅ **Service Layer Architecture** - Modular, scalable structure

### UI Components
- ✅ **Auth Modal** - Beautiful sign-in modal with multiple auth providers
- ✅ **Index Screen Updates** - Shows user profile, gems, premium status
- ✅ **App Initializer** - Automatic service initialization on app start

### Directory Structure Created
```
src/services/
├── ads/           (ready for Phase 2)
├── analytics/     ✅ AnalyticsService.ts
├── auth/          ✅ AuthService.ts
├── backend/       ✅ SupabaseClient.ts, config.ts
├── cosmetics/     (ready for Phase 6)
├── currency/      (ready for Phase 3)
├── iap/           (ready for Phase 3)
├── powerups/      (ready for Phase 4)
└── subscription/  (ready for Phase 5)
```

---

## 🔧 Required Setup Steps

To complete Phase 1, you need to configure external services:

### 1. Supabase Setup

#### Step 1.1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `blocktopia-production`
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
5. Wait for project to be created (~2 minutes)

#### Step 1.2: Get Supabase Credentials
1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

#### Step 1.3: Run Database Migrations
1. In Supabase, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the SQL schema from `BLOCKTOPIA-MONETIZATION-MASTER-PLAN.md` (Section 1.3)
4. Click "Run" to execute
5. Verify tables created: Go to **Table Editor** and confirm you see:
   - profiles
   - game_sessions
   - transactions
   - power_ups_inventory
   - cosmetics_owned
   - user_settings
   - leaderboard
   - analytics_events
   - ab_experiments

#### Step 1.4: Enable Authentication Providers

**Enable Apple Sign-In:**
1. In Supabase, go to **Authentication** → **Providers**
2. Find "Apple" and click to expand
3. Enable Apple provider
4. You'll need to configure Apple Developer settings (see section below)

**Enable Google Sign-In:**
1. In Supabase, go to **Authentication** → **Providers**
2. Find "Google" and click to expand
3. Enable Google provider
4. You'll need to configure Google Cloud settings (see section below)

---

### 2. Apple Sign-In Configuration

#### Step 2.1: Apple Developer Portal
1. Go to [developer.apple.com](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **App IDs**
4. Select your Blocktopia app ID
5. Check "Sign in with Apple" capability
6. Click "Save"

#### Step 2.2: Generate Service ID
1. In Apple Developer Portal, click **Identifiers** → **Services IDs**
2. Click the **+** button
3. Enter:
   - Description: "Blocktopia Sign In"
   - Identifier: `com.yourdomain.blocktopia.signin`
4. Check "Sign in with Apple"
5. Click "Configure"
6. Add your Supabase callback URL:
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
   ```
7. Save and continue

#### Step 2.3: Update Supabase with Apple Credentials
1. In Supabase, go back to **Authentication** → **Providers** → **Apple**
2. Enter your **Service ID** from step 2.2
3. Upload your **Private Key** (.p8 file from Apple)
4. Enter your **Key ID** and **Team ID**
5. Save configuration

---

### 3. Google Sign-In Configuration

#### Step 3.1: Google Cloud Console
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**

#### Step 3.2: Configure OAuth Consent Screen
1. Click **Configure Consent Screen**
2. Choose **External** (unless you have Google Workspace)
3. Fill in required fields:
   - App name: "Blocktopia"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Save and continue

#### Step 3.3: Create OAuth Credentials
Create **3 separate** OAuth client IDs:

**iOS Client ID:**
1. Application type: **iOS**
2. Name: "Blocktopia iOS"
3. Bundle ID: Your app's bundle ID (from app.json)
4. Copy the **Client ID** (format: `xxxxx.apps.googleusercontent.com`)

**Android Client ID:**
1. Application type: **Android**
2. Name: "Blocktopia Android"
3. Package name: Your app's package (from app.json)
4. SHA-1 certificate fingerprint:
   ```bash
   # Debug keystore (for development)
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
5. Copy the **Client ID**

**Web Client ID (for Supabase):**
1. Application type: **Web application**
2. Name: "Blocktopia Web"
3. Authorized redirect URIs: Add your Supabase callback URL:
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
   ```
4. Copy the **Client ID** and **Client Secret**

#### Step 3.4: Update Supabase with Google Credentials
1. In Supabase, go to **Authentication** → **Providers** → **Google**
2. Enter **Client ID** (Web client ID from step 3.3)
3. Enter **Client Secret** (from Web client)
4. Save configuration

---

### 4. Environment Configuration

Create a `.env` file in your project root:

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxx...

# Google Sign-In
GOOGLE_WEB_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_ID_IOS=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_ID_ANDROID=xxxxx.apps.googleusercontent.com

# RevenueCat (Phase 3)
REVENUECAT_API_KEY_IOS=
REVENUECAT_API_KEY_ANDROID=

# AdMob (Phase 2)
ADMOB_APP_ID_IOS=
ADMOB_APP_ID_ANDROID=
ADMOB_REWARDED_AD_UNIT_IOS=
ADMOB_REWARDED_AD_UNIT_ANDROID=
ADMOB_INTERSTITIAL_AD_UNIT_IOS=
ADMOB_INTERSTITIAL_AD_UNIT_ANDROID=
```

---

### 5. Update app.json

Add Google Sign-In configuration to `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourdomain.blocktopia",
      "googleServicesFile": "./GoogleService-Info.plist",
      "config": {
        "googleSignIn": {
          "reservedClientId": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID_REVERSED"
        }
      }
    },
    "android": {
      "package": "com.yourdomain.blocktopia",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

---

### 6. Test Authentication

#### Build and Test on Device

```bash
# Rebuild the app (required for new native modules)
eas build --platform all --profile development

# Or test locally with development build
npm run dev:client
```

#### Testing Checklist

1. **Anonymous Sign-In**
   - ✅ Click "Sign In" on index screen
   - ✅ Click "Continue as Guest"
   - ✅ Verify username appears (e.g., "Guest123456")
   - ✅ Verify gems show as 0

2. **Apple Sign-In** (iOS only)
   - ✅ Click "Sign In"
   - ✅ Click Apple Sign-In button
   - ✅ Complete Apple authentication
   - ✅ Verify profile appears with your Apple ID name
   - ✅ Check Supabase dashboard for new user

3. **Google Sign-In**
   - ✅ Click "Sign In"
   - ✅ Click "Continue with Google"
   - ✅ Complete Google authentication
   - ✅ Verify profile appears with your Google name
   - ✅ Check Supabase dashboard for new user

4. **Account Persistence**
   - ✅ Close and reopen app
   - ✅ Verify you're still signed in
   - ✅ Verify gems balance persists

5. **Sign Out**
   - ✅ (You'll add a sign-out button in Phase 2)

---

## 📊 Verify Database

Check your Supabase dashboard:

1. Go to **Authentication** → **Users**
   - You should see test users you created

2. Go to **Table Editor** → **profiles**
   - Each user should have a profile entry
   - Default gems: 0
   - Premium status: false

3. Go to **Table Editor** → **user_settings**
   - Each user should have settings entry
   - Default cosmetics: "default"

---

## 🐛 Troubleshooting

### "Supabase URL not configured"
- Check that `.env` file exists
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
- Restart development server

### Apple Sign-In not showing (iOS)
- Verify device supports Apple Sign-In (iOS 13+)
- Check that Apple Sign-In is enabled in app capabilities
- Rebuild app with `eas build`

### Google Sign-In error
- Check that all 3 OAuth client IDs are created
- Verify Web Client ID is in `.env` as `GOOGLE_WEB_CLIENT_ID`
- Verify iOS/Android client IDs match your bundle/package name
- For Android, check SHA-1 fingerprint is correct

### "User not found in profiles table"
- Check RLS policies in Supabase
- Verify profile creation logic in `AuthService.ts`
- Check Supabase logs: **Logs** → **Auth Logs**

### Anonymous auth not working
- Check that anonymous emails are being generated
- Verify Supabase allows email/password signup
- Check for conflicts with existing anonymous users

---

## 🎯 What's Next: Phase 2

Once Phase 1 is working, you'll implement:
- 💰 **Rewarded Video Ads** (Continue feature)
- 📺 **Interstitial Ads** (Between games)
- 🔧 **AdMob Integration**
- 📊 **Ad Analytics**

**Expected Revenue:** $1,100/month at 1K DAU

See `BLOCKTOPIA-MONETIZATION-MASTER-PLAN.md` for full Phase 2 details.

---

## 📝 Notes

- **Development vs Production**: Use separate Supabase projects for dev/prod
- **Security**: Never commit `.env` file to git (already in `.gitignore`)
- **Anonymous Users**: Can be migrated to full accounts using `linkAccount()`
- **Data Sync**: User data automatically syncs between device and Supabase
- **Offline Support**: MMKV provides local cache for offline play

---

## ✨ Success Metrics

You'll know Phase 1 is successful when:
- ✅ Users can sign in with Apple/Google/Anonymous
- ✅ User profiles are created in Supabase
- ✅ Gems balance displays correctly
- ✅ Authentication persists across app restarts
- ✅ No authentication errors in console
- ✅ All Supabase tables have correct RLS policies

**Phase 1 is complete!** 🎉

Ready to move on to Phase 2 (Ads) when you are!

