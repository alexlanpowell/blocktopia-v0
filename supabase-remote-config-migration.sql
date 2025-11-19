-- Migration: Add Remote Config and Feature Flags
-- Phase 9: Deployment & Monitoring

-- Table: remote_config
-- Stores dynamic configuration values (e.g., ad frequency, gem prices, difficulty)
CREATE TABLE IF NOT EXISTS public.remote_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: feature_flags
-- Stores feature toggles for staged rollouts
CREATE TABLE IF NOT EXISTS public.feature_flags (
    key TEXT PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    min_app_version TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies: Read-only for authenticated/anon users, Admin-only write (managed via dashboard/admin)
-- For this implementation, we'll allow read access to public
ALTER TABLE public.remote_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to remote_config"
ON public.remote_config FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to feature_flags"
ON public.feature_flags FOR SELECT
USING (true);

-- Insert default configurations
INSERT INTO public.remote_config (key, value, description)
VALUES 
    ('ad_interstitial_frequency', '3', 'Number of games between interstitial ads'),
    ('daily_reward_gems', '50', 'Number of gems for daily premium reward'),
    ('welcome_bonus_gems', '100', 'Gems awarded to new users'),
    ('game_difficulty_multiplier', '1.0', 'Global difficulty multiplier'),
    ('iap_gem_pack_bonus_percent', '0', 'Bonus percentage for gem packs (seasonal events)')
ON CONFLICT (key) DO NOTHING;

-- Insert default feature flags
INSERT INTO public.feature_flags (key, is_enabled, rollout_percentage, description)
VALUES 
    ('enable_ads', true, 100, 'Global kill switch for ads'),
    ('enable_new_shop_ui', true, 100, 'Enable the new grid layout shop'),
    ('enable_holiday_theme', false, 0, 'Enable seasonal holiday theme'),
    ('maintenance_mode', false, 0, 'Put app in maintenance mode')
ON CONFLICT (key) DO NOTHING;

