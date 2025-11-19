-- Migration: Add Daily Reward Support for Premium Users
-- Phase 5: Premium Subscription

-- Add daily reward columns to user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS last_daily_gems_claim TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_daily_powerups_claim TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS daily_reward_streak INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN user_settings.last_daily_gems_claim IS 'Last time premium user claimed daily gems reward';
COMMENT ON COLUMN user_settings.last_daily_powerups_claim IS 'Last time premium user claimed daily power-ups reward';
COMMENT ON COLUMN user_settings.daily_reward_streak IS 'Current consecutive day streak for daily rewards';

-- Create index for faster daily reward queries
CREATE INDEX IF NOT EXISTS idx_user_settings_daily_rewards ON user_settings (
  user_id,
  last_daily_gems_claim,
  last_daily_powerups_claim
);

-- Update RLS policies (already covered by existing policies)
-- No changes needed as user_settings already has proper RLS

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Premium subscription migration completed successfully!';
  RAISE NOTICE 'Daily reward columns added to user_settings table';
END $$;

