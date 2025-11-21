-- Migration: Add user_high_scores table for persistent best scores
-- Created: 2024
-- Description: Stores user high scores persistently, synced to Supabase

-- Create user_high_scores table
CREATE TABLE IF NOT EXISTS user_high_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  high_score INTEGER NOT NULL DEFAULT 0,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pieces_placed INTEGER DEFAULT 0,
  lines_cleared INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_high_scores_user_id ON user_high_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_high_scores_high_score ON user_high_scores(high_score DESC);

-- Enable Row Level Security
ALTER TABLE user_high_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own high scores"
  ON user_high_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own high scores"
  ON user_high_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own high scores"
  ON user_high_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_high_score_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_high_scores_timestamp
  BEFORE UPDATE ON user_high_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_high_score_timestamp();

-- Function to upsert high score (insert or update if higher)
CREATE OR REPLACE FUNCTION upsert_high_score(
  p_user_id UUID,
  p_score INTEGER,
  p_pieces_placed INTEGER DEFAULT 0,
  p_lines_cleared INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
  current_high INTEGER;
BEGIN
  -- Get current high score
  SELECT high_score INTO current_high
  FROM user_high_scores
  WHERE user_id = p_user_id;
  
  -- If no record exists or new score is higher, upsert
  IF current_high IS NULL OR p_score > current_high THEN
    INSERT INTO user_high_scores (user_id, high_score, pieces_placed, lines_cleared, achieved_at)
    VALUES (p_user_id, p_score, p_pieces_placed, p_lines_cleared, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET
      high_score = p_score,
      pieces_placed = p_pieces_placed,
      lines_cleared = p_lines_cleared,
      achieved_at = NOW();
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION upsert_high_score(UUID, INTEGER, INTEGER, INTEGER) TO authenticated;

