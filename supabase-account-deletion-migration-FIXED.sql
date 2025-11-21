-- Account Deletion Support Migration - FIXED VERSION
-- Ensures users can delete their own data
-- Run this migration in your Supabase SQL editor

-- Drop existing delete policies if they exist (no error if they don't)
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own power-ups" ON power_ups_inventory;
DROP POLICY IF EXISTS "Users can delete own cosmetics" ON cosmetics_owned;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own leaderboard entries" ON leaderboard;
DROP POLICY IF EXISTS "Users can delete own analytics" ON analytics_events;

-- Create delete policies for user data
-- Profiles
CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Game Sessions
CREATE POLICY "Users can delete own sessions"
  ON game_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Power-ups Inventory
CREATE POLICY "Users can delete own power-ups"
  ON power_ups_inventory
  FOR DELETE
  USING (auth.uid() = user_id);

-- Cosmetics Owned
CREATE POLICY "Users can delete own cosmetics"
  ON cosmetics_owned
  FOR DELETE
  USING (auth.uid() = user_id);

-- User Settings
CREATE POLICY "Users can delete own settings"
  ON user_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Leaderboard
CREATE POLICY "Users can delete own leaderboard entries"
  ON leaderboard
  FOR DELETE
  USING (auth.uid() = user_id);

-- Analytics Events
CREATE POLICY "Users can delete own analytics"
  ON analytics_events
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verify policies are in place
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename IN (
    'profiles', 
    'game_sessions', 
    'transactions',
    'power_ups_inventory', 
    'cosmetics_owned', 
    'user_settings',
    'leaderboard',
    'analytics_events'
  )
  AND cmd = 'DELETE';
  
  RAISE NOTICE '✅ Total DELETE policies created: %', policy_count;
  RAISE NOTICE '✅ Account deletion support enabled!';
  RAISE NOTICE 'Users can now safely delete their accounts and all associated data.';
END $$;

