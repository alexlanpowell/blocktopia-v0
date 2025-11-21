# Audio System Migration Guide

This guide walks you through setting up the audio system in Blocktopia.

## Prerequisites

- Supabase project set up
- Database access (SQL Editor)
- Audio files ready (see AUDIO-ASSETS-GUIDE.md)

## Step 1: Run Database Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase-audio-settings-migration.sql`
4. Copy the entire SQL script
5. Paste into SQL Editor
6. Click **Run** to execute

**Expected Result**: 
- 4 new columns added to `user_settings` table
- 1 index created
- No errors

**Verification**:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND column_name IN ('music_volume', 'sfx_volume', 'music_enabled', 'sfx_enabled');
```

## Step 2: Add Audio Files

### Option A: Use Placeholder Files (Development)

The app will work without audio files, but you should add them for the full experience.

### Option B: Add Real Audio Files

1. Download audio files from sources listed in `AUDIO-ASSETS-GUIDE.md`
2. Place sound effects in `assets/sounds/`
3. Place music tracks in `assets/music/`
4. Ensure file names match exactly (case-sensitive)

**Required Files**:
- `assets/sounds/piece_pickup.mp3`
- `assets/sounds/piece_place.mp3`
- `assets/sounds/piece_invalid.mp3`
- `assets/sounds/line_clear.mp3`
- `assets/sounds/multi_line_clear.mp3`
- `assets/sounds/game_over.mp3`
- `assets/sounds/button_tap.mp3`
- `assets/sounds/power_up.mp3`
- `assets/sounds/purchase.mp3`
- `assets/sounds/gem.mp3`
- `assets/music/ambient.mp3`
- `assets/music/lofi.mp3`
- `assets/music/electronic.mp3`

## Step 3: Install Dependencies

Dependencies should already be installed, but verify:

```bash
npm install expo-av @react-native-community/slider
```

## Step 4: Test Audio System

### Test Sound Effects

1. Launch the app
2. Play a game
3. Drag a piece → Should hear pickup sound
4. Place a piece → Should hear placement sound
5. Clear a line → Should hear line clear sound
6. Tap buttons → Should hear button tap sound

### Test Music

1. Go to Settings → Audio Settings
2. Toggle music on/off → Music should start/stop
3. Adjust music volume → Volume should change
4. Change music pack in Customization → Music should change

### Test Settings Persistence

1. Change audio settings
2. Close app completely
3. Reopen app
4. Settings should be preserved

### Test Cloud Sync

1. Change audio settings on Device A
2. Sign in on Device B
3. Settings should sync from cloud

## Step 5: Verify Integration

### Check Audio Initialization

Look for this log in console:
```
✅ Audio initialized (XXXms)
```

### Check Settings Load

Audio settings should load from MMKV on app start.

### Check Music Starts

If music is enabled, default ambient track should start automatically.

## Troubleshooting

### Database Migration Fails

**Error**: Column already exists
- **Solution**: Migration is idempotent, safe to ignore

**Error**: Table doesn't exist
- **Solution**: Run main schema migration first (`supabase-schema.sql`)

### Audio Files Not Found

**Error**: `Failed to load sound effect`
- **Solution**: 
  - Check file names match exactly
  - Verify files are in correct directories
  - Check file format is MP3

### Music Doesn't Play

**Check**:
1. Music enabled in settings?
2. Volume > 0?
3. Audio files present?
4. Check console for errors

### Settings Don't Persist

**Check**:
1. MMKV storage working?
2. Supabase sync enabled?
3. User authenticated?

### Performance Issues

**If audio causes lag**:
1. Reduce number of concurrent sounds
2. Lower audio quality (bitrate)
3. Check device memory usage

## Rollback (If Needed)

To remove audio system:

1. **Remove audio columns** (optional):
```sql
ALTER TABLE user_settings
DROP COLUMN IF EXISTS music_volume,
DROP COLUMN IF EXISTS sfx_volume,
DROP COLUMN IF EXISTS music_enabled,
DROP COLUMN IF EXISTS sfx_enabled;
```

2. **Remove audio files** from assets folders

3. **Uninstall packages** (optional):
```bash
npm uninstall expo-av @react-native-community/slider
```

**Note**: App will continue to work without audio (graceful degradation)

## Next Steps

After migration:

1. ✅ Test all audio features
2. ✅ Add real audio files
3. ✅ Test on physical devices
4. ✅ Verify cloud sync works
5. ✅ Test app backgrounding
6. ✅ Check performance metrics

## Support

If you encounter issues:

1. Check console logs for errors
2. Verify all files are in place
3. Test with minimal audio files first
4. Check Supabase logs for sync issues

