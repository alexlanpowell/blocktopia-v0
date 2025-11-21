-- Migration: Add missing updated_at column to game_sessions table
-- Date: November 20, 2025
-- Issue: PGRST204 error - "Could not find the 'updated_at' column"
-- Solution: Add column and auto-update trigger

-- Add updated_at column if it doesn't exist
ALTER TABLE public.game_sessions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have updated_at set
UPDATE public.game_sessions 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Make updated_at NOT NULL after backfilling data
ALTER TABLE public.game_sessions 
ALTER COLUMN updated_at SET NOT NULL;

-- Create function to automatically update updated_at on row modifications
CREATE OR REPLACE FUNCTION update_game_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS update_game_sessions_timestamp ON public.game_sessions;

-- Create trigger to auto-update updated_at before any UPDATE
CREATE TRIGGER update_game_sessions_timestamp
BEFORE UPDATE ON public.game_sessions
FOR EACH ROW
EXECUTE FUNCTION update_game_sessions_updated_at();

-- Verify the column was added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'game_sessions' 
      AND column_name = 'updated_at'
  ) THEN
    RAISE NOTICE '✅ Column updated_at successfully added to game_sessions table';
  ELSE
    RAISE EXCEPTION '❌ Failed to add updated_at column';
  END IF;
END $$;

-- Display current table structure for verification
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'game_sessions'
ORDER BY ordinal_position;

