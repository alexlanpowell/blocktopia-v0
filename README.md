# 🎮 Blocktopia v1.0

**A premium block puzzle game with comprehensive monetization and audio system**

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.22-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/turntopia/blocktopia)

---

## 📖 Overview

Blocktopia is a premium block puzzle game built with React Native and Expo, featuring a complete monetization system including in-app purchases, subscriptions, rewarded ads, virtual currency, and an immersive audio experience. The game uses Skia for high-performance rendering and follows industry-standard UI/UX principles from Apple HIG, Material Design, and top-tier tech companies.

### 🎯 Key Features

#### Gameplay
- **Addictive Block Puzzle Mechanics**: Classic gameplay with modern polish
- **Premium Graphics**: Skia-powered rendering with smooth 60fps animations
- **Power-Ups System**: Magic Wand, Piece Swap, Undo Move, Line Blaster
- **Extra Try Feature**: Continue playing after game over with rewarded ads
- **Haptic Feedback**: Tactile responses for enhanced gameplay feel

#### Audio & Visual Experience
- **🎵 Background Music System**: Dynamic music with fade in/out, looping, and music packs
- **🔊 Sound Effects**: Comprehensive SFX for all interactions (piece placement, line clears, power-ups, UI)
- **🎨 Customization**: 10+ block skins, 7+ board themes, 4+ particle effects, 3+ music packs
- **✨ Glassmorphism UI**: Modern, polished interface with blur effects
- **🎭 Theme System**: Dark mode, colorful themes, and premium exclusive themes

#### Monetization
- **💎 Virtual Currency**: Gem-based economy with earning and spending mechanics
- **🛒 In-App Purchases**: Gem packs, power-ups, cosmetics, and premium pass
- **💳 Subscriptions**: Monthly/yearly premium pass with exclusive benefits
- **📺 Ad Integration**: Rewarded, interstitial, and banner ads with smart frequency control
- **🎁 Daily Rewards**: Free gems and power-ups for returning players (premium enhanced)

#### Cloud & Social
- **☁️ Cloud Sync**: Supabase-powered cross-device progress synchronization
- **🏆 Leaderboards**: Global high scores with real-time updates
- **👤 Authentication**: Anonymous guest sessions, Apple Sign-In integration
- **💾 Persistent Storage**: MMKV for fast local-first data storage
- **📊 Analytics**: Comprehensive tracking for optimization and A/B testing

---

## 🚀 Tech Stack

### Core Technologies
- **React Native** 0.81.5 - Mobile framework with New Architecture enabled
- **Expo** 54.0.22 - Development platform and SDK
- **TypeScript** 5.9.2 - Strict type safety
- **Expo Router** 6.0.13 - File-based navigation
- **Zustand** 5.0.8 + **Immer** - State management with immutable updates
- **React Native Skia** 2.3.13 - High-performance graphics rendering
- **React Native Reanimated** 4.1.1 - Smooth UI animations
- **React Native Gesture Handler** 2.29.1 - Touch interactions

### Audio & Haptics
- **Expo AV** 16.0.7 - Background music and sound effects
- **Expo Haptics** 15.0.7 - Tactile feedback
- **@react-native-community/slider** 5.1.1 - Volume controls

### Backend & Services
- **Supabase** 2.83.0 - PostgreSQL database, authentication, real-time subscriptions
- **MMKV** 4.0.1 - Fast key-value storage for local-first architecture
- **RevenueCat** 9.6.6 - In-app purchase and subscription management
- **AdMob** 16.0.0 - Rewarded video, interstitial, and banner ads

### UI & Visual
- **Expo Blur** 15.0.7 - Glassmorphism effects
- **Expo Linear Gradient** 15.0.7 - Gradient backgrounds
- **Expo Image Picker** 17.0.8 - Profile avatar uploads
- **Safe Area Context** 5.6.2 - Device notch handling

### Development & Build
- **Expo Dev Client** 6.0.17 - Custom development builds
- **EAS Build** - Cloud build service
- **Expo Build Properties** 1.0.9 - Native build configuration
- **Hermes JS Engine** - Optimized JavaScript runtime

---

## 📋 Prerequisites

### Development Environment

- **Node.js** 20.18.0 (exact version required)
- **npm** 9.x or higher
- **Expo CLI** (`npm install -g expo-cli`)
- **EAS CLI** (`npm install -g eas-cli`)
- **Git** 2.x or higher

### Platform Requirements

#### iOS Development
- **macOS** 12.0+ (for local iOS builds)
- **Xcode** 16.1+ with Command Line Tools
- **CocoaPods** 1.12+
- **iOS Device/Simulator** running iOS 14.0+

#### Android Development
- **Android Studio** 2022.3.1+ (Flamingo or higher)
- **Android SDK** 33+ (API Level 33)
- **Java Development Kit** 17
- **Android Device/Emulator** running Android 5.0+

### Required Accounts

1. **Expo/EAS Account** - For cloud builds (required)
2. **Supabase Account** - For database and auth (required)
3. **RevenueCat Account** - For IAP management (optional for initial development)
4. **AdMob Account** - For ads (optional for initial development)
5. **Apple Developer Account** ($99/year) - For iOS App Store distribution
6. **Google Play Console Account** ($25 one-time) - For Android Play Store distribution

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/turntopia/blocktopia.git
cd blocktopia
```

### 2. Install Dependencies

```bash
# Clean install using the exact EAS command
npm install --legacy-peer-deps

# Verify EAS compatibility
npm ci --include=dev
```

**Important**: Always test with `npm ci --include=dev` before building on EAS!

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# ========== SUPABASE (REQUIRED) ==========
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# ========== REVENUECAT (Required for IAP) ==========
REVENUECAT_API_KEY_IOS=appl_xxxxxxxxxxxxx
REVENUECAT_API_KEY_ANDROID=goog_xxxxxxxxxxxxx

# ========== ADMOB (Required for Ads) ==========
# App IDs
ADMOB_APP_ID_IOS=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
ADMOB_APP_ID_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX

# Ad Unit IDs - Rewarded Ads
ADMOB_REWARDED_AD_UNIT_IOS=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_REWARDED_AD_UNIT_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX

# Ad Unit IDs - Interstitial Ads
ADMOB_INTERSTITIAL_AD_UNIT_IOS=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_INTERSTITIAL_AD_UNIT_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX

# Ad Unit IDs - Banner Ads  
ADMOB_BANNER_AD_UNIT_IOS=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_BANNER_AD_UNIT_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX

# Ad Unit IDs - Game Screen Banners
ADMOB_BANNER_AD_UNIT_GAME_IOS=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_BANNER_AD_UNIT_GAME_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX

# ========== GOOGLE SIGN-IN (Optional) ==========
GOOGLE_WEB_CLIENT_ID=
GOOGLE_CLIENT_ID_IOS=
GOOGLE_CLIENT_ID_ANDROID=
```

**🔐 Security Note**: The `.env` file is in `.gitignore` - NEVER commit your keys!

### 4. Set Up Supabase Database

Run these SQL migrations in your Supabase project (SQL Editor):

```bash
1. supabase-game-sessions-migration.sql    # Game sessions and persistence
2. supabase-high-scores-migration.sql      # Leaderboards and high scores
3. supabase-audio-settings-migration.sql   # Audio preferences sync
4. supabase-account-deletion-migration-FIXED.sql  # GDPR compliance
```

**Order matters!** Run them in the sequence above.

### 5. Configure Supabase RLS Policies

Enable Row Level Security on all tables:
- `user_settings` - Users can only access their own settings
- `game_sessions` - Users can only access their own sessions
- `high_scores` - Public read, authenticated write

See `docs/SUPABASE-SETUP-INSTRUCTIONS.md` for detailed policy setup.

### 6. Verify Configuration

```bash
# Test TypeScript compilation
npx tsc --noEmit

# Verify all dependencies are in sync
npm ci --include=dev

# Both should complete without errors!
```

---

## 🏗️ Building the App

### Development Builds (Recommended)

Development builds include the Expo Dev Client, allowing you to iterate quickly with hot reloading and debugging tools.

#### iOS Development Build

```bash
# Build on EAS
eas build --platform ios --profile development

# After build completes (~15-20 min):
# 1. Download .app from EAS dashboard
# 2. Install on iOS device or simulator
# 3. Start dev server:
npx expo start --dev-client

# 4. Scan QR code with installed app
```

#### Android Development Build

```bash
# Build on EAS
eas build --platform android --profile development

# After build completes (~15-20 min):
# 1. Download .apk from EAS dashboard
# 2. Install on Android device
# 3. Start dev server:
npx expo start --dev-client --tunnel

# 4. Scan QR code with installed app
```

#### Build Both Platforms

```bash
eas build --platform all --profile development
```

### Production Builds

Production builds are optimized for App Store/Play Store submission.

```bash
# iOS Production
eas build --platform ios --profile production

# Android Production
eas build --platform android --profile production

# Both Platforms
eas build --platform all --profile production
```

### Pre-Build Checklist

Before triggering any EAS build, ensure:

- [ ] All code changes committed to git
- [ ] `git status` shows clean working tree
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm ci --include=dev` completes successfully
- [ ] `.env` file configured with valid keys
- [ ] Supabase migrations applied
- [ ] EAS project configured (`eas init` run)

**See `BLOCKTOPIA-BUILD-CHECKLIST.md` for the complete pre-build verification process.**

---

## 🎮 Development Workflow

### Local Development

```bash
# Start Expo dev server
npm run start

# Start with dev client
npm run dev:client

# Start with tunnel (for testing on external devices)
npm run dev:client:tunnel

# Clear cache and restart
npm start -- --clear
```

### Common Commands

```bash
# TypeScript check
npx tsc --noEmit

# Clean dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Test EAS build compatibility
npm ci --include=dev

# Clear Expo cache
npx expo start --clear
```

---

## 🎵 Audio System

### Features

- **Background Music**: Dynamic music with fade in/out transitions
- **Sound Effects**: 10+ SFX for all game interactions
- **Volume Controls**: Separate sliders for music and SFX
- **Music Packs**: Multiple music tracks available as cosmetic items
- **Settings Persistence**: MMKV local storage + Supabase cloud sync
- **App Lifecycle**: Automatic pause/resume on app background/foreground

### Audio Files

Audio files are located in:
- `assets/sounds/` - Sound effects (MP3 format)
- `assets/music/` - Background music (MP3 format)

The app gracefully degrades if audio files are missing - it will run silently without crashes.

**See `docs/AUDIO-ASSETS-GUIDE.md` for sourcing and adding audio files.**

### Audio Settings

Users can control audio via **Settings → Audio Settings**:
- Music volume slider (0-100%)
- SFX volume slider (0-100%)
- Music on/off toggle
- SFX on/off toggle

Settings are saved locally (MMKV) and synced to cloud (Supabase) for cross-device consistency.

---

## 💰 Monetization System

### Virtual Currency (Gems)

**Earning Gems:**
- Playing games (score-based rewards)
- Watching rewarded ads (50-100 gems)
- Daily rewards (50-100 gems for premium users)
- Completing achievements
- Purchasing gem packs

**Spending Gems:**
- Power-ups (50-200 gems each)
- Cosmetic items (100-500 gems)
- Extra tries (100 gems)
- Music packs (200-300 gems)

### In-App Purchases

**Gem Packs:**
- Small: 100 gems - $0.99
- Medium: 500 gems - $2.99
- Large: 1000 gems - $4.99
- Mega: 2500 gems - $9.99
- Ultimate: 5000 gems - $14.99

**Premium Pass:**
- Monthly: $4.99/month
- Yearly: $39.99/year (save 33%)

**Power-Up Bundles:**
- Starter Pack: 5 of each - $2.99
- Pro Pack: 10 of each - $4.99

### Premium Benefits

✨ **Premium Pass includes:**
- ✅ Ad-free experience (no banner or interstitial ads)
- ✅ Daily gems (50 gems every 24 hours)
- ✅ Daily power-ups (1 random power-up daily)
- ✅ Exclusive cosmetics (themes, skins, effects, music)
- ✅ Cloud save priority sync
- ✅ Unlimited undo moves
- ✅ Priority customer support

### Ad Strategy

**Rewarded Ads** (User-initiated):
- Continue after game over (1 ad = 1 extra try)
- Earn gems (1 ad = 50 gems)
- Unlock premium features temporarily

**Interstitial Ads** (Auto-displayed):
- Between games (configurable frequency)
- Default: Every 3 games for non-premium users
- Skipped for premium subscribers

**Banner Ads** (Persistent):
- Bottom of game screen (non-intrusive placement)
- Disabled for premium subscribers
- Responsive sizing for all devices

**Ad Frequency Control:**
All ad frequencies are controlled via Supabase Remote Config for real-time optimization without app updates.

---

## 🎨 Customization & Cosmetics

### Block Skins (10+)
- Classic, Neon, Gradient, Glass, Metal, Wood, etc.
- Purchasable with gems or premium-exclusive

### Board Themes (7+)
- Dark Mode (default)
- Ocean Blue
- Sunset Orange
- Forest Green
- Royal Purple
- Monochrome
- Premium exclusive themes

### Particle Effects (4+)
- None (default)
- Sparkles
- Fire
- Ice
- Lightning (premium)

### Music Packs (3+)
- Ambient (default)
- Upbeat
- Chill
- Lo-Fi (premium)

**All cosmetics persist across devices via cloud sync.**

---

## 🏛️ Architecture

### Project Structure

```
blocktopia/
├── app/                           # Expo Router pages
│   ├── _layout.tsx               # Root layout, service initialization
│   ├── index.tsx                 # Main menu / home screen
│   ├── game.tsx                  # Main game screen
│   ├── settings.tsx              # Settings screen
│   ├── profile/                  # Profile management
│   ├── auth/                     # Authentication screens
│   ├── privacy.tsx               # Privacy policy
│   └── terms.tsx                 # Terms of service
│
├── src/
│   ├── game/                     # Core game logic
│   │   ├── core/                # GameState, Board, Pieces
│   │   │   ├── GameState.ts    # Main game state machine
│   │   │   ├── Board.ts        # Board logic and validation
│   │   │   └── Pieces.ts       # Piece generation and rotation
│   │   └── pieces/              # Piece definitions
│   │
│   ├── rendering/               # UI and visual components
│   │   ├── components/          # Reusable UI components
│   │   │   ├── GameBoard.tsx   # Skia-rendered game board
│   │   │   ├── HUD.tsx         # Game UI overlay
│   │   │   ├── Shop.tsx        # In-app purchase UI
│   │   │   ├── PowerUpBar.tsx  # Power-up selection
│   │   │   ├── AudioControls.tsx # Audio settings UI
│   │   │   ├── BannerAd.tsx    # Banner ad component
│   │   │   └── ...
│   │   ├── screens/             # Full-screen views
│   │   │   ├── SettingsScreen.tsx
│   │   │   ├── CustomizationScreen.tsx
│   │   │   └── ...
│   │   └── hooks/               # Custom React hooks
│   │       ├── useGestures.ts   # Touch gesture handling
│   │       └── useGesturesHelpers.ts
│   │
│   ├── services/                # Business logic (Singleton services)
│   │   ├── ads/                 # AdMob integration
│   │   │   ├── AdManager.ts    # Ad initialization
│   │   │   ├── RewardedAdService.ts
│   │   │   └── BannerAdService.ts
│   │   ├── audio/              # Audio system
│   │   │   ├── AudioManager.ts # SFX & music playback
│   │   │   └── AudioSettingsStorage.ts
│   │   ├── auth/               # Authentication
│   │   │   └── AuthService.ts  # Supabase auth wrapper
│   │   ├── backend/            # Supabase client
│   │   │   ├── SupabaseClient.ts
│   │   │   └── config.ts
│   │   ├── config/             # Remote config
│   │   │   └── RemoteConfigService.ts
│   │   ├── cosmetics/          # Cosmetic system
│   │   │   ├── CosmeticService.ts
│   │   │   └── CosmeticCatalog.ts
│   │   ├── currency/           # Virtual currency
│   │   │   └── CurrencyService.ts
│   │   ├── game/               # Game services
│   │   │   └── GamePersistenceService.ts
│   │   ├── iap/                # In-app purchases
│   │   │   └── RevenueCatService.ts
│   │   ├── optimization/       # A/B testing
│   │   │   └── OptimizationService.ts
│   │   ├── powerups/           # Power-up system
│   │   │   └── PowerUpGameIntegration.ts
│   │   ├── scoring/            # High scores
│   │   │   └── HighScoreService.ts
│   │   └── subscription/       # Premium features
│   │       └── PremiumService.ts
│   │
│   ├── store/                  # Zustand state management
│   │   ├── gameStore.ts        # Game state (score, level, pieces)
│   │   └── monetizationStore.ts # Monetization state (gems, premium, purchases)
│   │
│   ├── types/                  # TypeScript type definitions
│   │   └── database.types.ts   # Supabase generated types
│   │
│   └── utils/                  # Utility functions
│       ├── theme.ts            # Design tokens (colors, spacing, typography)
│       ├── ErrorTracker.ts     # Error logging and reporting
│       └── workletLogger.ts    # Worklet debugging utilities
│
├── assets/                     # Static assets
│   ├── sounds/                # Sound effects (MP3)
│   ├── music/                 # Background music (MP3)
│   ├── icon.png              # App icon
│   ├── splash-icon.png       # Splash screen
│   ├── adaptive-icon.png     # Android adaptive icon
│   └── ...
│
├── docs/                      # Documentation
│   ├── AUDIO-ASSETS-GUIDE.md
│   ├── SUPABASE-SETUP-INSTRUCTIONS.md
│   └── ...
│
├── .env                       # Environment variables (NOT in git)
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build configuration
├── babel.config.js           # Babel configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

### Design Patterns

**Singleton Services:**
All services are implemented as singletons with private constructors and `getInstance()` methods. This ensures:
- Single source of truth
- Easy access from any component
- Consistent state management
- Memory efficiency

**State Management (Zustand + Immer):**
- `useGameStore`: Game state (current game, score, pieces, board)
- `useMonetizationStore`: Monetization state (gems, premium status, purchases)
- Immer enables immutable updates with mutable syntax

**Service Layer Architecture:**
Clear separation of concerns:
- **Components**: Only handle UI rendering and user interactions
- **Services**: Handle business logic, API calls, data persistence
- **Stores**: Manage application state
- **Utils**: Provide utility functions

**Error Boundaries:**
- Global error boundary catches all React errors
- Graceful error handling with user-friendly messages
- Automatic error logging to analytics

**Local-First Architecture:**
- MMKV for instant local data access
- Supabase for cloud backup and sync
- Optimistic UI updates
- Background sync when online

---

## 🧪 Testing

### TypeScript Validation

```bash
# Check for type errors
npx tsc --noEmit
```

Fix all errors before building!

### EAS Build Compatibility Test

```powershell
# Windows PowerShell
.\test-eas-build.ps1

# Or manually:
Remove-Item -Recurse -Force node_modules
npm ci --include=dev
```

This tests with the **exact** command EAS uses. If this passes, your EAS build will succeed!

### Manual Testing Checklist

**Core Gameplay:**
- [ ] Game launches without crashes
- [ ] Pieces can be dragged and placed
- [ ] Lines clear correctly
- [ ] Score updates accurately
- [ ] Game over detection works
- [ ] Restart functionality works

**Audio:**
- [ ] Background music plays and loops
- [ ] Music fades in/out smoothly
- [ ] Sound effects play for all actions
- [ ] Volume controls work (music and SFX)
- [ ] Settings persist after app restart
- [ ] Audio pauses when app backgrounds

**Monetization:**
- [ ] Gems are tracked correctly
- [ ] Power-ups can be purchased with gems
- [ ] Power-ups function correctly
- [ ] IAP products load (gem packs, premium pass)
- [ ] Purchase flow works (use sandbox/test mode)
- [ ] Premium benefits activate after purchase
- [ ] Daily rewards work for premium users

**Ads (Test on physical device only!):**
- [ ] Rewarded ads show and award gems
- [ ] Interstitial ads show at correct frequency
- [ ] Banner ads display correctly
- [ ] Ads are hidden for premium users
- [ ] Ad frequency respects remote config

**Authentication:**
- [ ] Anonymous guest sessions work
- [ ] Apple Sign-In works (iOS only)
- [ ] User data persists after login
- [ ] Account deletion works

**Cloud Sync:**
- [ ] High scores sync to leaderboard
- [ ] Game progress saves to cloud
- [ ] Settings sync across devices
- [ ] Data loads correctly on new device

**Customization:**
- [ ] Cosmetics can be purchased
- [ ] Cosmetics can be equipped
- [ ] Visual changes apply immediately
- [ ] Selections persist after app restart

---

## 🐛 Troubleshooting

### Build Fails: "Missing from lock file"

```bash
# Solution:
Remove-Item package-lock.json -Force
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps

# Test:
npm ci --include=dev
```

### Build Fails: "npm ci can only install when in sync"

**Cause:** `package-lock.json` is out of sync with `package.json`

```bash
# Solution:
Remove-Item package-lock.json -Force
npm install --legacy-peer-deps
git add package-lock.json
git commit -m "Update package-lock.json"
```

### Build Uses Old Code

**Cause:** Forgot to commit changes (EAS builds from git, not working directory)

```bash
# Solution:
git status  # Check what's uncommitted
git add .
git commit -m "Your message"
git push  # Optional but recommended
```

### Ads Not Showing

**Common causes:**
- Ads only work on **physical devices** (not simulators/emulators)
- AdMob app IDs must be in both `app.json` and `.env`
- Ad units must be created in AdMob dashboard
- Test ads will show even without real ad units configured

### Audio Not Working

**Cause:** Missing expo-av native module

```bash
# Solution: Rebuild with EAS
eas build --platform ios --profile development
```

`expo-av` requires a native build - it won't work in Expo Go!

### Supabase Connection Errors

1. Verify `.env` has correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`
2. Check Supabase project status in dashboard
3. Verify RLS policies are enabled on all tables
4. Check if you're on Supabase free tier limits

### IAP Not Working

- RevenueCat API keys must be in `.env`
- Products must be configured in RevenueCat dashboard
- Link app bundle IDs in RevenueCat
- Use sandbox accounts for testing (iOS/Android)

### TypeScript Errors

```bash
# Check errors:
npx tsc --noEmit

# Common fixes:
# 1. Missing type definitions
npm install --save-dev @types/package-name

# 2. Version conflicts
# Check package.json versions match BLOCKTOPIA-BUILD-CONFIG.md
```

---

## 📚 Documentation

### Build & Configuration
- **[BLOCKTOPIA_EAS_BUILD_GUIDE.md](./BLOCKTOPIA_EAS_BUILD_GUIDE.md)** - Complete EAS build reference with troubleshooting
- **[BLOCKTOPIA-BUILD-CHECKLIST.md](./BLOCKTOPIA-BUILD-CHECKLIST.md)** - Step-by-step pre-build checklist
- **[BLOCKTOPIA-BUILD-CONFIG.md](./BLOCKTOPIA-BUILD-CONFIG.md)** - Working configuration reference
- **[EXPO-AV-INTEGRATION-READY.md](./EXPO-AV-INTEGRATION-READY.md)** - Audio system setup guide

### Feature Documentation
- **[docs/AUDIO-ASSETS-GUIDE.md](./docs/AUDIO-ASSETS-GUIDE.md)** - Sourcing and adding audio files
- **[AUDIO-INTEGRATION-COMPLETE.md](./AUDIO-INTEGRATION-COMPLETE.md)** - Audio system architecture
- **[QUICK-START-GUIDE.md](./QUICK-START-GUIDE.md)** - Getting started quickly

### Setup Guides
- **[SUPABASE-SETUP-INSTRUCTIONS.md](./SUPABASE-SETUP-INSTRUCTIONS.md)** - Database setup
- **[ADMOB-SETUP-QUICK-REFERENCE.md](./ADMOB-SETUP-QUICK-REFERENCE.md)** - AdMob configuration
- **[ADMOB-REVENUECAT-SETUP-GUIDE.md](./ADMOB-REVENUECAT-SETUP-GUIDE.md)** - Complete monetization setup

### Release Notes
- **[VERSION-1.0-RELEASE-NOTES.md](./VERSION-1.0-RELEASE-NOTES.md)** - What's new in v1.0

---

## 🔐 Security & Privacy

### Data Protection
- Environment variables never committed (`.env` in `.gitignore`)
- Supabase RLS policies protect all user data
- API keys stored securely in environment variables
- RevenueCat handles secure payment processing
- GDPR-compliant account deletion flow

### API Key Management
- **Development**: Use test keys in `.env` (not committed)
- **Production**: Use EAS Secrets for production keys
  ```bash
  eas secret:create --scope project --name SUPABASE_URL --value your-value
  ```

### User Privacy
- Anonymous authentication by default (no personal data required)
- Optional Apple Sign-In for cloud sync
- Clear privacy policy and terms of service
- Account deletion available in profile settings
- No tracking without user consent

---

## 📄 License

This project is private and proprietary. All rights reserved.

**Copyright © 2025 turntopia**

---

## 👥 Credits

**Developer:** turntopia  
**Version:** 1.0.0  
**Built with:** React Native, Expo, TypeScript, Skia, Supabase, RevenueCat, AdMob

### Open Source Libraries
This project uses numerous open-source libraries. See `package.json` for the complete list.

### Music Credits
See `MUSIC-CREDITS.md` for music and audio attribution.

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Clone and install
git clone https://github.com/turntopia/blocktopia.git
cd blocktopia
npm install --legacy-peer-deps

# 2. Create .env file (see Configuration section)
# 3. Run Supabase migrations (see Setup section)

# 4. Verify everything works
npx tsc --noEmit
npm ci --include=dev

# 5. Build for device
eas build --platform ios --profile development
eas build --platform android --profile development

# 6. Install build on device

# 7. Start dev server
npx expo start --dev-client
```

---

## 📞 Support & Contributing

### Getting Help
1. Check this README and documentation files
2. Review troubleshooting section
3. Check EAS build logs for build issues
4. Review Supabase logs for backend errors

### Reporting Issues
- Check existing documentation first
- Include steps to reproduce
- Attach relevant logs (EAS build, Metro bundler, Supabase)
- Specify platform (iOS/Android) and versions

### Contributing
This is a private project. Contact turntopia for collaboration opportunities.

---

## 🗺️ Roadmap

### Version 1.1 (Planned)
- [ ] Multiplayer mode
- [ ] Tournament system
- [ ] More cosmetic items
- [ ] Additional music tracks
- [ ] Advanced power-ups
- [ ] Social sharing features

### Version 2.0 (Future)
- [ ] Web version (Progressive Web App)
- [ ] Live events and challenges
- [ ] Player vs. Player battles
- [ ] Clan system
- [ ] Advanced analytics dashboard

---

**Version:** 1.0.0  
**Last Updated:** November 20, 2025  
**Status:** Production Ready ✅  
**Platforms:** iOS 14+ | Android 5+ (API 21+)

---

🎮 **Ready to build the next block puzzle sensation!**
