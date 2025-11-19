# Blocktopia Monetization Master Integration Plan

## Project Goal Summary

Transform Blocktopia from a standalone game into a fully monetized mobile application with 5 core revenue streams: (1) Rewarded Video Ads, (2) Interstitial Ads, (3) Power-Ups IAP, (4) Premium Subscription, and (5) Cosmetic IAP. Architecture will be modular, scalable, and built for future expansion of 5 additional monetization features (Battle Pass, Daily Challenges, Social Features, Sponsored Partnerships, Watch-to-Earn).

**Tech Stack Foundation:**
- Frontend: React Native + Expo + TypeScript + Zustand + Skia
- Backend: Supabase (PostgreSQL + Auth + Realtime + Storage)
- Payment: RevenueCat (IAP/Subscription management)
- Ads: Google AdMob (react-native-google-mobile-ads)
- Analytics: Firebase Analytics + Supabase Analytics
- Auth: Apple Sign-In + Google Sign-In + Anonymous fallback

**Revenue Target:** $1,450/month at 1K DAU, scaling to $14.5K/month at 10K DAU

---

## PHASE 1: Foundation & Infrastructure Setup

**Objective:** Establish core monetization infrastructure with modular architecture that supports all current and future revenue streams.

### 1.1 Authentication System

**Implement Multi-Provider Auth:**
- Apple Sign-In (required for iOS)
- Google Sign-In (cross-platform)
- Anonymous auth (play without account)
- Account linking (link anonymous to social)

**Supabase Auth Configuration:**
- Enable Apple Sign-In provider
- Enable Google Sign-In provider
- Configure OAuth callbacks
- Set up email verification (optional)

### 1.2 Dependencies Installation

**Install Core Packages:**
```bash
npx expo install react-native-google-mobile-ads
npm install @revenuecat/purchases-typescript-internal-esm
npm install @supabase/supabase-js
npx expo install @react-native-firebase/app @react-native-firebase/analytics
npm install react-native-mmkv
npx expo install expo-crypto
npx expo install expo-apple-authentication
npx expo install @react-native-google-signin/google-signin
```

**Update app.json with AdMob App IDs:**
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXX~XXXXX",
          "iosAppId": "ca-app-pub-XXXXX~XXXXX"
        }
      ],
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ]
    ]
  }
}
```

### 1.3 Supabase Database Schema

**Create all necessary tables:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  gems INTEGER DEFAULT 0,
  premium_status BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  ad_free_purchased BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- game_sessions table (for analytics and cloud save)
CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  score INTEGER NOT NULL,
  lines_cleared INTEGER DEFAULT 0,
  pieces_placed INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  board_state JSONB,
  current_pieces JSONB,
  is_active BOOLEAN DEFAULT FALSE,
  game_ended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- transactions table (IAP/currency tracking)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  transaction_type TEXT NOT NULL,
  product_id TEXT,
  gems_change INTEGER DEFAULT 0,
  amount_usd DECIMAL(10,2),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- power_ups_inventory table
CREATE TABLE public.power_ups_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  power_up_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, power_up_type)
);

-- cosmetics_owned table
CREATE TABLE public.cosmetics_owned (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  cosmetic_id TEXT NOT NULL,
  cosmetic_type TEXT NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, cosmetic_id)
);

-- user_settings table
CREATE TABLE public.user_settings (
  user_id UUID REFERENCES public.profiles(id) PRIMARY KEY,
  active_block_skin TEXT DEFAULT 'default',
  active_board_theme TEXT DEFAULT 'default',
  active_music_pack TEXT,
  active_particle_effect TEXT,
  sound_enabled BOOLEAN DEFAULT TRUE,
  music_enabled BOOLEAN DEFAULT TRUE,
  haptics_enabled BOOLEAN DEFAULT TRUE,
  ad_free BOOLEAN DEFAULT FALSE,
  last_power_up_grant_date TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- leaderboard table
CREATE TABLE public.leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  username TEXT,
  best_score INTEGER NOT NULL,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- analytics_events table
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  event_name TEXT NOT NULL,
  event_params JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ab_experiments table
CREATE TABLE public.ab_experiments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  variants JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.power_ups_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmetics_owned ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for game_sessions
CREATE POLICY "Users can view own sessions" ON public.game_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.game_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.game_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for power_ups_inventory
CREATE POLICY "Users can view own inventory" ON public.power_ups_inventory
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own inventory" ON public.power_ups_inventory
  FOR ALL USING (auth.uid() = user_id);

-- Policies for cosmetics_owned
CREATE POLICY "Users can view own cosmetics" ON public.cosmetics_owned
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cosmetics" ON public.cosmetics_owned
  FOR ALL USING (auth.uid() = user_id);

-- Policies for user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Policies for leaderboard (public read)
CREATE POLICY "Leaderboard is publicly readable" ON public.leaderboard
  FOR SELECT USING (true);
CREATE POLICY "Users can update own leaderboard entry" ON public.leaderboard
  FOR ALL USING (auth.uid() = user_id);

-- Policies for analytics_events
CREATE POLICY "Users can insert own analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX idx_game_sessions_score ON public.game_sessions(score DESC);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard(rank ASC);
CREATE INDEX idx_leaderboard_score ON public.leaderboard(best_score DESC);
CREATE INDEX idx_analytics_events_timestamp ON public.analytics_events(timestamp DESC);

-- Create revenue dashboard view
CREATE VIEW revenue_dashboard AS
SELECT
  DATE(created_at) as date,
  SUM(amount_usd) as daily_revenue,
  COUNT(DISTINCT user_id) as paying_users,
  transaction_type
FROM transactions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), transaction_type
ORDER BY date DESC;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_power_ups_updated_at BEFORE UPDATE ON public.power_ups_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON public.leaderboard
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 1.4 Service Layer Architecture

**Directory Structure:**
```
src/services/
├── ads/
│   ├── AdManager.ts
│   ├── RewardedAdService.ts
│   └── InterstitialAdService.ts
├── iap/
│   ├── RevenueCatService.ts
│   ├── PurchaseManager.ts
│   └── ProductCatalog.ts
├── currency/
│   ├── VirtualCurrencyManager.ts
│   └── CurrencyStore.ts
├── powerups/
│   ├── PowerUpManager.ts
│   ├── PowerUpInventory.ts
│   └── PowerUpEffects.ts
├── subscription/
│   ├── SubscriptionManager.ts
│   └── SubscriptionStore.ts
├── cosmetics/
│   ├── CosmeticManager.ts
│   └── ThemeEngine.ts
├── backend/
│   ├── SupabaseClient.ts
│   ├── AuthService.ts
│   └── SyncService.ts
└── analytics/
    ├── AnalyticsService.ts
    └── MonetizationMetrics.ts
```

### 1.5 Environment Configuration

**Create `.env` file:**
```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxx...

# RevenueCat
REVENUECAT_API_KEY_IOS=rcb_xxxxx
REVENUECAT_API_KEY_ANDROID=rcb_xxxxx

# AdMob
ADMOB_APP_ID_IOS=ca-app-pub-xxxxx~xxxxx
ADMOB_APP_ID_ANDROID=ca-app-pub-xxxxx~xxxxx
ADMOB_REWARDED_AD_UNIT_IOS=ca-app-pub-xxxxx/xxxxx
ADMOB_REWARDED_AD_UNIT_ANDROID=ca-app-pub-xxxxx/xxxxx
ADMOB_INTERSTITIAL_AD_UNIT_IOS=ca-app-pub-xxxxx/xxxxx
ADMOB_INTERSTITIAL_AD_UNIT_ANDROID=ca-app-pub-xxxxx/xxxxx

# Google Sign-In
GOOGLE_CLIENT_ID_IOS=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_ID_ANDROID=xxxxx.apps.googleusercontent.com
```

### 1.6 Core Monetization Store

**Zustand store structure for monetization state management.**

---

## Implementation Status

- [ ] Phase 1: Foundation & Infrastructure
- [ ] Phase 2: Ad Integration
- [ ] Phase 3: Virtual Currency & IAP
- [ ] Phase 4: Power-Ups
- [ ] Phase 5: Premium Subscription
- [ ] Phase 6: Cosmetics
- [ ] Phase 7: Analytics
- [ ] Phase 8: Testing
- [ ] Phase 9: Deployment
- [ ] Phase 10: Optimization

---

## Revenue Projections

**At 1,000 DAU:**
- Rewarded Ads: $300/month
- Interstitial Ads: $800/month
- Power-Ups IAP: $150/month
- Premium Subscription: $50/month
- Cosmetic IAP: $150/month
- **Total: $1,450/month**

**At 10,000 DAU:**
- **Total: $14,500/month ($174K/year)**

---

*See full plan details in implementation phases below*

