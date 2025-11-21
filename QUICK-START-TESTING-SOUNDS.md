# Quick Start: Testing Sound Effects 🔊

**Time to Test:** 2-5 minutes  
**No Rebuild Needed!** Test immediately in simulator/emulator

---

## 🚀 Start Testing NOW (2 minutes)

### Step 1: Clear Cache & Start
```bash
npx expo start --clear
```

### Step 2: Launch App
Press **`i`** for iOS Simulator  
OR  
Press **`a`** for Android Emulator

### Step 3: Test Each Sound (30 seconds each)

#### ✅ Test 1: Button Tap (button_tap.mp3)
1. Click **"New Game"** button
2. Click **"Settings"** button
3. Click any menu button
4. **Expected:** Short "click" sound every time

#### ✅ Test 2: Piece Placement (piece_place.mp3)
1. Start a new game
2. Drag any piece from bottom
3. Drop it on the board
4. **Expected:** "Thud" sound when piece lands

#### ✅ Test 3: Line Clear (line_clear.mp3)
1. Play until you clear a single row or column
2. **Expected:** Success "chime" sound (300-500ms)

#### ✅ Test 4: Multi-Line Clear (multi_line_clear.mp3)
1. Set up board to clear 2+ rows at once
2. Place final piece
3. **Expected:** Epic "combo" sound (500-800ms)

#### ✅ Test 5: Game Over (game_over.mp3)
1. Fill up the board until game ends
2. **Expected:** Dramatic "game over" sound (1-2s)

#### ✅ Test 6: Power-Up (power_up.mp3)
1. Buy a power-up from shop (if needed)
2. During game, click power-up icon
3. **Expected:** Magic "activation" sound

#### ✅ Test 7: Purchase (purchase.mp3)
1. Go to Shop
2. Buy any item (theme, cosmetic, etc.)
3. **Expected:** "Cash register" purchase sound

---

## 🎵 Bonus: Test Music + SFX Together

1. Start game (Default Saloon music plays automatically)
2. Adjust music volume in settings
3. Adjust SFX volume independently
4. Play game with both music and SFX active
5. **Expected:** Music loops seamlessly, SFX plays on top

---

## 🐛 If Something Doesn't Work

### No sounds at all?
```bash
# Stop the dev server (Ctrl+C)
# Clear cache completely
npx expo start --clear --reset-cache

# Relaunch simulator
```

### Specific sound missing?
Check console for warnings:
```
⚠️ Sound effect [name] not found
```

If you see this, verify file exists:
```bash
ls -la assets/sounds/
```

### Still not working?
1. Check device/simulator volume is up
2. Check SFX not muted in game settings
3. Look for errors in console
4. Try restarting simulator/emulator

---

## 📱 Want to Test on Physical Device?

### Option 1: Expo Go (Limited - May Not Work)
- Install Expo Go app
- Scan QR code from terminal
- **Note:** Audio assets may not load properly in Expo Go

### Option 2: Development Build (Recommended)
```bash
# Build for your device
eas build --platform ios --profile development
# or
eas build --platform android --profile development

# Wait 10-15 minutes
# Download and install on device
```

**Why rebuild needed for physical device?**
- Sound files are **static assets** bundled at build time
- Simulator can access files directly from project folder
- Physical devices need assets compiled into app bundle

---

## ✅ Success Checklist

After testing, you should have:
- [x] 7 sounds working in simulator/emulator
- [x] Music + SFX playing together
- [x] Volume controls working
- [x] No console errors
- [x] Smooth gameplay with audio

**Next:** Build for physical devices or proceed to app store submission!

---

## 📊 What's Happening Behind the Scenes

### On App Launch (Lines 67-73 in _layout.tsx):
```typescript
// Initialize Audio Settings Storage (load from MMKV)
const { audioSettingsStorage } = await import('../src/services/audio/AudioSettingsStorage');
await audioSettingsStorage.loadSettings();

// Initialize Audio Manager (preload SFX)
const AudioManager = (await import('../src/services/audio/AudioManager')).default;
initPromises.push(AudioManager.initialize());
```

### AudioManager.initialize() (Lines 61-87 in AudioManager.ts):
1. Configure audio mode (iOS silent mode, Android ducking)
2. Preload all sound effects in parallel
3. Skip missing files gracefully
4. Log to console: "🔊 Loaded 7/10 sound effects"
5. Total initialization time: ~50-100ms

### When Sound Plays (Lines 144-169):
```typescript
async playSoundEffect(effect: SoundEffect, volumeMultiplier: number = 1.0) {
  if (!this.isSfxEnabled || !this.initialized) return;
  
  const sound = this.soundEffects.get(effect);
  if (!sound) return; // Gracefully skip if file missing
  
  await sound.setPositionAsync(0); // Reset to start
  await sound.setVolumeAsync(this.sfxVolume * volumeMultiplier);
  await sound.playAsync(); // <5ms latency
}
```

---

**Ready to test?** Run `npx expo start --clear` and start clicking around! 🎮🔊

