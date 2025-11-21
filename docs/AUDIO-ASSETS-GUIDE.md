# Audio Assets Guide

This guide explains how to add audio files to Blocktopia and where to source them legally.

## Required Audio Files

### Sound Effects (10 files)
Place these in `assets/sounds/`:

1. **piece_pickup.mp3** - Light tap/click sound (50-100ms)
2. **piece_place.mp3** - Satisfying placement thud (100-200ms)
3. **piece_invalid.mp3** - Error/rejection sound (100-150ms)
4. **line_clear.mp3** - Clear/success chime (300-500ms)
5. **multi_line_clear.mp3** - Epic combo sound (500-800ms)
6. **game_over.mp3** - Sad/dramatic end (1-2s)
7. **button_tap.mp3** - UI click (50ms)
8. **power_up.mp3** - Magic/power sound (300-500ms)
9. **purchase.mp3** - Success/register sound (200-400ms)
10. **gem.mp3** - Sparkle/collect (200-300ms)

### Music Tracks (3 files)
Place these in `assets/music/`:

1. **ambient.mp3** - Default calm background track (2-3 min loop)
2. **lofi.mp3** - Lo-fi beats cosmetic pack (2-3 min loop)
3. **electronic.mp3** - Upbeat EDM cosmetic pack (2-3 min loop)

## File Specifications

### Sound Effects
- **Format**: MP3
- **Sample Rate**: 44.1kHz
- **Bitrate**: 128kbps
- **Channels**: Mono (for SFX)
- **Size**: 50-200KB each
- **Duration**: 50ms - 2s

### Music Tracks
- **Format**: MP3
- **Sample Rate**: 44.1kHz
- **Bitrate**: 192kbps
- **Channels**: Stereo
- **Size**: 2-4MB each
- **Duration**: 2-3 minutes (looping)
- **Loop**: Must be seamless (no gaps at start/end)

## Recommended Sources

### Free & Licensed Sources

#### 1. Freesound.org
- **License**: Creative Commons (various)
- **Attribution**: Required for most files
- **Best for**: Sound effects
- **How to use**: Search for "game click", "success chime", "error beep"
- **Filter**: CC0 (no attribution) or CC-BY (attribution required)

#### 2. ZapSplat
- **License**: Free for commercial use (registration required)
- **Attribution**: Not required after registration
- **Best for**: Sound effects
- **URL**: https://www.zapsplat.com

#### 3. Incompetech (Kevin MacLeod)
- **License**: Royalty-free
- **Attribution**: Required (can be in credits)
- **Best for**: Background music
- **URL**: https://incompetech.com
- **Note**: Very popular, high quality tracks

#### 4. Purple Planet Music
- **License**: Free with attribution
- **Attribution**: Required (can be in credits)
- **Best for**: Background music
- **URL**: https://www.purple-planet.com

#### 5. Bensound
- **License**: Free with attribution or license purchase
- **Attribution**: Required for free use
- **Best for**: Background music
- **URL**: https://www.bensound.com

### AI Generated Music (Alternative)

#### 1. Soundraw.io
- **License**: Subscription-based
- **Best for**: Custom music generation
- **Note**: Can generate tracks matching your game's mood

#### 2. Beatoven.ai
- **License**: Subscription-based
- **Best for**: Game music AI generation
- **Note**: Good for creating unique tracks

## How to Add Audio Files

1. **Download** audio files from one of the sources above
2. **Optimize** files to match specifications (use Audacity or similar)
3. **Rename** files to match exact names listed above
4. **Place** files in correct directories:
   - Sound effects → `assets/sounds/`
   - Music tracks → `assets/music/`
5. **Test** in app to ensure they play correctly

## Optimization Tips

### For Sound Effects:
- Use **mono** audio (saves space, SFX don't need stereo)
- Keep files **short** (under 2 seconds)
- Use **compression** (MP3 128kbps is fine for short sounds)
- Remove **silence** at start/end

### For Music:
- Ensure **seamless loops** (no clicks/pops)
- Use **stereo** for better quality
- **Normalize** volume levels
- Keep **consistent** volume across tracks

## Attribution Requirements

If you use files that require attribution:

1. Add credits section in Settings screen
2. Include in app store description (if required)
3. Example format:
   ```
   Music by Kevin MacLeod (incompetech.com)
   Licensed under Creative Commons: By Attribution 3.0
   ```

## Testing

After adding audio files:

1. **Test each sound effect** plays correctly
2. **Test music loops** seamlessly
3. **Test volume controls** work properly
4. **Test on both iOS and Android**
5. **Test with headphones** and speakers
6. **Test app backgrounding** (music should pause)

## Troubleshooting

### Files not playing?
- Check file names match exactly (case-sensitive)
- Verify files are MP3 format
- Check file size isn't too large
- Ensure files are in correct directories

### Music doesn't loop?
- Use audio editing software to create seamless loop
- Ensure no silence at start/end of file
- Test loop in audio player before adding to app

### App crashes on audio load?
- Check file paths are correct
- Verify expo-av is installed
- Check for corrupted audio files
- Review console logs for errors

## Notes

- The app will work **without audio files** (graceful degradation)
- Missing files will log warnings but won't crash the app
- You can add audio files incrementally (start with essential SFX)
- Consider using placeholder/silent files during development

