-- Audio Settings Migration
-- Adds audio preference columns to user_settings table
-- Safe to run multiple times (uses IF NOT EXISTS)

-- Add audio settings columns to user_settings table
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS music_volume DECIMAL(3,2) DEFAULT 0.60,
ADD COLUMN IF NOT EXISTS sfx_volume DECIMAL(3,2) DEFAULT 0.80,
ADD COLUMN IF NOT EXISTS music_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sfx_enabled BOOLEAN DEFAULT true;

-- Add index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_user_settings_audio 
ON user_settings(user_id, music_enabled, sfx_enabled);

-- Add comment for documentation
COMMENT ON COLUMN user_settings.music_volume IS 'Music volume level (0.0 - 1.0)';
COMMENT ON COLUMN user_settings.sfx_volume IS 'Sound effects volume level (0.0 - 1.0)';
COMMENT ON COLUMN user_settings.music_enabled IS 'Whether background music is enabled';
COMMENT ON COLUMN user_settings.sfx_enabled IS 'Whether sound effects are enabled';

