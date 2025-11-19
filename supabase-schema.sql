-- Blocktopia Supabase Database Schema
-- Phase 1: Authentication & Infrastructure
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
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
CREATE TABLE IF NOT EXISTS public.game_sessions (
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
CREATE TABLE IF NOT EXISTS public.transactions (
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
CREATE TABLE IF NOT EXISTS public.power_ups_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  power_up_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, power_up_type)
);

-- cosmetics_owned table
CREATE TABLE IF NOT EXISTS public.cosmetics_owned (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  cosmetic_id TEXT NOT NULL,
  cosmetic_type TEXT NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, cosmetic_id)
);

-- user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
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
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  username TEXT,
  best_score INTEGER NOT NULL,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  event_name TEXT NOT NULL,
  event_params JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ab_experiments table
CREATE TABLE IF NOT EXISTS public.ab_experiments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  variants JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.power_ups_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmetics_owned ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Game sessions policies
CREATE POLICY "Users can view own sessions" ON public.game_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.game_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.game_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Power-ups inventory policies
CREATE POLICY "Users can view own inventory" ON public.power_ups_inventory
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own inventory" ON public.power_ups_inventory
  FOR ALL USING (auth.uid() = user_id);

-- Cosmetics owned policies
CREATE POLICY "Users can view own cosmetics" ON public.cosmetics_owned
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cosmetics" ON public.cosmetics_owned
  FOR ALL USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Leaderboard policies (public read)
CREATE POLICY "Leaderboard is publicly readable" ON public.leaderboard
  FOR SELECT USING (true);
CREATE POLICY "Users can update own leaderboard entry" ON public.leaderboard
  FOR ALL USING (auth.uid() = user_id);

-- Analytics events policies
CREATE POLICY "Users can insert own analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_score ON public.game_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard(rank ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard(best_score DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp DESC);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Revenue dashboard view
CREATE OR REPLACE VIEW revenue_dashboard AS
SELECT
  DATE(created_at) as date,
  SUM(amount_usd) as daily_revenue,
  COUNT(DISTINCT user_id) as paying_users,
  transaction_type
FROM transactions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), transaction_type
ORDER BY date DESC;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_power_ups_updated_at ON public.power_ups_inventory;
CREATE TRIGGER update_power_ups_updated_at BEFORE UPDATE ON public.power_ups_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON public.leaderboard;
CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON public.leaderboard
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Optional)
-- ============================================================================

-- Insert default AB experiments
INSERT INTO public.ab_experiments (id, name, description, active, variants)
VALUES 
  ('interstitial_frequency', 'Interstitial Ad Frequency', 'Test showing ads every 3 vs 4 games', true, '{"control": 3, "variant": 4}'),
  ('power_up_pricing', 'Power-Up Gem Pricing', 'Test 20% discount on power-ups', true, '{"control": 100, "variant": 80}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Blocktopia database schema created successfully!';
  RAISE NOTICE 'Tables: profiles, game_sessions, transactions, power_ups_inventory, cosmetics_owned, user_settings, leaderboard, analytics_events, ab_experiments';
  RAISE NOTICE 'Next step: Configure authentication providers in Supabase dashboard';
END $$;

