-- Account Deletion Support Migration
-- Ensures users can delete their own data
-- Run this migration in your Supabase SQL editor

-- Enable Row Level Security on all tables if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE power_ups_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE cosmetics_owned ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing delete policies if they exist
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own game stats" ON game_stats;
DROP POLICY IF EXISTS "Users can delete own power-ups" ON power_ups_inventory;
DROP POLICY IF EXISTS "Users can delete own cosmetics" ON cosmetics_owned;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;

-- Create delete policies for user data
-- Profiles
CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Game Stats
CREATE POLICY "Users can delete own game stats"
  ON game_stats
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

-- Optional: Create a function to handle cascading deletes
-- This ensures all user data is deleted when account is deleted
CREATE OR REPLACE FUNCTION delete_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all related data when a user is deleted from auth.users
  DELETE FROM game_stats WHERE user_id = OLD.id;
  DELETE FROM power_ups_inventory WHERE user_id = OLD.id;
  DELETE FROM cosmetics_owned WHERE user_id = OLD.id;
  DELETE FROM user_settings WHERE user_id = OLD.id;
  DELETE FROM profiles WHERE id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for cascading deletes
-- Note: This requires access to auth schema, which may not be available
-- If this fails, the manual deletion in the app will handle it
DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
  
  CREATE TRIGGER on_auth_user_deleted
    BEFORE DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION delete_user_data();
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not create trigger on auth.users - will use manual deletion instead';
END $$;

-- Verify policies are in place
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename IN ('profiles', 'game_stats', 'power_ups_inventory', 'cosmetics_owned', 'user_settings')
    AND cmd = 'DELETE';
  
  RAISE NOTICE 'Total DELETE policies created: %', policy_count;
END $$;

