-- Migration: Update game_sessions table for active game persistence
-- Created: 2024
-- Description: Stores active game sessions for continue game feature

-- Update existing game_sessions table to support active game state
-- Note: Table already exists from initial schema, we're just ensuring it has the right structure

-- Ensure is_active column exists and has proper constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_sessions' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.game_sessions ADD COLUMN is_active BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create unique constraint for active game per user (only one active game at a time)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'game_sessions_user_active_unique'
  ) THEN
    CREATE UNIQUE INDEX game_sessions_user_active_unique 
    ON public.game_sessions(user_id, is_active) 
    WHERE is_active = TRUE;
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (if not exist)
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can manage own sessions" ON public.game_sessions;
  
  -- Create new policy
  CREATE POLICY "Users can manage own sessions"
    ON public.game_sessions FOR ALL
    USING (auth.uid() = user_id);
END $$;

-- Function to deactivate all other sessions when activating a new one
CREATE OR REPLACE FUNCTION deactivate_other_sessions(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.game_sessions
  SET is_active = FALSE, updated_at = NOW()
  WHERE user_id = p_user_id 
    AND is_active = TRUE
    AND id != (SELECT id FROM public.game_sessions WHERE user_id = p_user_id AND is_active = TRUE ORDER BY updated_at DESC LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION deactivate_other_sessions(UUID) TO authenticated;

