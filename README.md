# 🎮 Blocktopia v0

**A modern block puzzle game with comprehensive monetization system**

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.22-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)

---

## 📖 Overview

Blocktopia is a premium block puzzle game built with React Native and Expo, featuring a complete monetization system including in-app purchases, subscriptions, rewarded ads, and virtual currency. The game uses Skia for high-performance rendering and follows industry-standard UI/UX principles.

### 🎯 Key Features

- **Addictive Gameplay**: Classic block puzzle mechanics with modern polish
- **Premium Graphics**: Skia-powered rendering with smooth animations
- **Full Monetization**: IAP, subscriptions, ads, and virtual currency
- **Cloud Sync**: Supabase backend for cross-device progress
- **Social Features**: Leaderboards and achievements
- **Customization**: Themes, skins, and cosmetic items

---

## 🚀 Tech Stack

### Core
- **React Native** 0.81.5 - Mobile framework
- **Expo** 54.0.22 - Development platform
- **TypeScript** 5.9.2 - Type safety
- **Expo Router** 6.0.13 - File-based routing
- **Zustand** 5.0.8 - State management
- **React Native Skia** 2.3.13 - High-performance rendering

### Backend & Services
- **Supabase** - Database, authentication, real-time
- **RevenueCat** - In-app purchase management
- **AdMob** - Rewarded video & interstitial ads
- **Firebase Analytics** - User analytics

### Monetization
- Virtual currency (gems)
- Power-ups (Magic Wand, Piece Swap, Undo, Line Blaster)
- Premium subscriptions (monthly/yearly)
- Cosmetic items (themes, skins, effects)
- Daily rewards system
- A/B testing framework

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.18.0 or higher
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **EAS CLI** (`npm install -g eas-cli`)
- **Git** configured with your GitHub credentials
- **iOS**: Xcode 16.1+ (Mac only)
- **Android**: Android Studio with Android SDK

### Required Accounts

- **Supabase** account (for database)
- **RevenueCat** account (for IAP - optional initially)
- **AdMob** account (for ads - optional initially)
- **Apple Developer** account (for iOS builds)
- **Google Play Console** account (for Android builds)

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/turntopia/blocktopia-v0.git
cd blocktopia-v0
```

### 2. Install Dependencies

```bash
npm install
```

**Note:** If you encounter peer dependency warnings, use:
```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# RevenueCat (Required for IAP)
REVENUECAT_API_KEY_IOS=your-ios-key
REVENUECAT_API_KEY_ANDROID=your-android-key

# AdMob (Required for ads)
ADMOB_APP_ID_IOS=ca-app-pub-XXXX~XXXX
ADMOB_APP_ID_ANDROID=ca-app-pub-XXXX~XXXX
ADMOB_REWARDED_AD_UNIT_IOS=ca-app-pub-XXXX/XXXX
ADMOB_REWARDED_AD_UNIT_ANDROID=ca-app-pub-XXXX/XXXX
ADMOB_INTERSTITIAL_AD_UNIT_IOS=ca-app-pub-XXXX/XXXX
ADMOB_INTERSTITIAL_AD_UNIT_ANDROID=ca-app-pub-XXXX/XXXX

# Google Sign-In (Optional)
GOOGLE_WEB_CLIENT_ID=
GOOGLE_CLIENT_ID_IOS=
GOOGLE_CLIENT_ID_ANDROID=
```

**Important:** The `.env` file is already in `.gitignore` - never commit your keys!

### 4. Set Up Supabase Database

Run the SQL migrations in your Supabase project:

1. Go to your Supabase dashboard → SQL Editor
2. Run `supabase-schema.sql` (creates all tables)
3. Run `supabase-premium-migration.sql` (adds daily rewards)
4. Run `supabase-remote-config-migration.sql` (adds remote config)

### 5. Verify Configuration

Test that everything is set up correctly:

```bash
# Test EAS build compatibility
Remove-Item -Recurse -Force node_modules
npm ci --include=dev

# Check TypeScript
npx tsc --noEmit
```

Both commands should complete without errors.

---

## 🏗️ Build Instructions

### Development Build (Local)

#### iOS (Mac only)
```bash
npx expo run:ios
```

#### Android
```bash
npx expo run:android
```

### EAS Build (Cloud)

#### Development Build
```bash
# iOS
eas build --platform ios --profile development

# Android
eas build --platform android --profile development

# Both
eas build --platform all --profile development
```

#### Production Build
```bash
eas build --platform all --profile production
```

### After Build

1. Download the build from EAS dashboard
2. Install on your device
3. Start development server:
   ```bash
   npx expo start --dev-client --tunnel
   ```
4. Scan QR code with your device

---

## 💰 Monetization Features

### Virtual Currency System
- **Gems**: Earned through gameplay, ads, or purchases
- **Power-Ups**: Purchasable with gems
- **Daily Rewards**: Free gems for returning players

### In-App Purchases
- **Gem Packs**: 100, 500, 1000, 2500, 5000 gems
- **Power-Ups**: Individual or bundles
- **Premium Pass**: Monthly/yearly subscriptions

### Premium Benefits
- Ad-free experience
- Daily gem rewards (50 gems/day)
- Daily power-up rewards
- Exclusive cosmetic items
- Cloud save sync
- Priority support

### Ad Integration
- **Rewarded Video Ads**: Watch to continue game or earn gems
- **Interstitial Ads**: Shown between games (configurable frequency)
- **Frequency Control**: Remote config for optimal user experience

### Cosmetic System
- **Block Skins**: 10+ unique designs
- **Board Themes**: 7+ color schemes
- **Particle Effects**: 4+ visual effects
- **Music Packs**: 3+ background music options

---

## 🏛️ Architecture

### Project Structure

```
blocktopia/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with service initialization
│   ├── index.tsx          # Main menu
│   └── game.tsx           # Game screen
├── src/
│   ├── game/              # Core game logic
│   │   ├── core/          # GameState, Board, Pieces
│   │   └── pieces/        # Piece definitions
│   ├── rendering/         # UI components
│   │   ├── components/    # Reusable components
│   │   └── screens/       # Full-screen views
│   ├── services/          # Business logic
│   │   ├── ads/          # AdMob integration
│   │   ├── iap/          # RevenueCat integration
│   │   ├── analytics/    # Analytics tracking
│   │   ├── auth/         # Authentication
│   │   ├── backend/      # Supabase client
│   │   ├── config/       # Remote config
│   │   ├── cosmetics/    # Cosmetic system
│   │   ├── currency/     # Virtual currency
│   │   ├── optimization/ # A/B testing
│   │   ├── powerups/     # Power-up system
│   │   └── subscription/ # Premium features
│   ├── store/            # Zustand stores
│   │   ├── gameStore.ts  # Game state
│   │   └── monetizationStore.ts # Monetization state
│   └── utils/            # Utilities
│       ├── theme.ts      # Design tokens
│       ├── ErrorTracker.ts
│       └── PerformanceMonitor.ts
├── assets/               # Images, icons, fonts
├── .env                  # Environment variables (not in git)
└── package.json
```

### Key Design Patterns

- **Singleton Services**: All services are singletons for easy access
- **Zustand State Management**: Centralized, type-safe state
- **Service Layer Architecture**: Clear separation of concerns
- **Error Boundaries**: Graceful error handling
- **Performance Monitoring**: Built-in performance tracking

---

## 🧪 Testing

### Run TypeScript Check
```bash
npx tsc --noEmit
```

### Test EAS Build Compatibility
```powershell
.\test-eas-build.ps1
```

### Manual Testing Checklist

- [ ] Game launches without crashes
- [ ] Authentication works (Apple/Anonymous)
- [ ] Gems are tracked correctly
- [ ] Power-ups can be purchased and used
- [ ] Ads show correctly (on physical device)
- [ ] Premium subscription activates benefits
- [ ] Cosmetics can be purchased and equipped
- [ ] Daily rewards work for premium users
- [ ] Leaderboard updates correctly
- [ ] Cloud save syncs across devices

---

## 🐛 Troubleshooting

### Build Fails with "Missing from lock file"

```bash
Remove-Item package-lock.json -Force
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
npm ci --include=dev
```

### TypeScript Errors

```bash
npx tsc --noEmit
```

Fix any errors shown, then rebuild.

### Supabase Connection Issues

1. Verify `.env` has correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`
2. Check Supabase dashboard for project status
3. Verify RLS policies are enabled

### Ads Not Showing

- Ads only work on **physical devices**, not simulators
- Verify AdMob app IDs in `app.json` and `.env`
- Check AdMob dashboard for ad unit status
- Test ads will show even without production setup

### IAP Not Working

- RevenueCat keys must be added to `.env`
- Products must be configured in RevenueCat dashboard
- Test with sandbox accounts on iOS/Android

---

## 📚 Documentation

- **[BLOCKTOPIA_EAS_BUILD_GUIDE.md](./BLOCKTOPIA_EAS_BUILD_GUIDE.md)** - Complete EAS build reference
- **[BLOCKTOPIA-BUILD-CHECKLIST.md](./BLOCKTOPIA-BUILD-CHECKLIST.md)** - Pre-build checklist
- **[PRE-BUILD-VERIFICATION-REPORT.md](./PRE-BUILD-VERIFICATION-REPORT.md)** - Comprehensive verification
- **[BLOCKTOPIA-MONETIZATION-MASTER-PLAN.md](./BLOCKTOPIA-MONETIZATION-MASTER-PLAN.md)** - Monetization architecture

---

## 🔐 Security

- Environment variables are never committed (`.env` in `.gitignore`)
- Supabase RLS policies protect user data
- API keys stored securely in environment variables
- RevenueCat handles secure payment processing
- AdMob test IDs used for development

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👥 Credits

**Developer:** turntopia  
**Built with:** React Native, Expo, Supabase, RevenueCat, AdMob

---

## 🚀 Getting Started Quick

```bash
# 1. Install dependencies
npm install

# 2. Set up .env file (see Setup Instructions)

# 3. Run database migrations in Supabase

# 4. Test configuration
npm ci --include=dev
npx tsc --noEmit

# 5. Start development
npm run dev:client

# 6. Build for device
eas build --platform ios --profile development
```

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review the documentation files
- Check Supabase logs for backend issues
- Review EAS build logs for build problems

---

**Version:** 1.0.0  
**Last Updated:** November 19, 2025  
**Status:** Production Ready ✅
