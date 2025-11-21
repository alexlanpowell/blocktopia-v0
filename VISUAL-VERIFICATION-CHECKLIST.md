# Visual Verification Checklist

## Test All Ad Types on Device

### Banner Ads ✅
**Location:** Bottom of game screen, above piece preview
**What to check:**
- [ ] Banner appears when game starts
- [ ] Banner is positioned 160px from bottom (above pieces)
- [ ] Banner adapts to screen width
- [ ] Banner respects safe areas (notches)
- [ ] Banner doesn't overlap with game pieces
- [ ] Banner doesn't interfere with drag/drop
- [ ] Banner shows "Test Ad" label (in dev mode)
- [ ] Banner is hidden when user is premium

**Expected behavior:**
- Non-blocking (game playable even if ad fails)
- Loads within 2-3 seconds
- Refreshes automatically (every 60 seconds)

---

### Continue Button - Game Over Screen ✅
**Location:** Between score and "Play Again" button
**What to check:**
- [ ] Button appears when game ends (if not already used)
- [ ] Button shows film icon (🎬)
- [ ] Button text shows:
  - "Watch Ad to Continue" for free users
  - "Continue" for premium users
- [ ] Gold/yellow gradient colors
- [ ] Proper spacing above "Play Again"
- [ ] Loading spinner appears when clicked
- [ ] Error message appears if ad fails
- [ ] Button is disabled while loading
- [ ] Haptic feedback on press

**Expected behavior:**
- Clicking shows loading state
- Rewarded video ad plays full screen
- After watching, game continues with cleared blocks
- If ad fails, error message shows
- Premium users skip ad entirely

---

### Interstitial Ads ✅
**Location:** Full screen, between games
**When to check:**
- [ ] Play 3 games in a row
- [ ] Click "Play Again" on 3rd game
- [ ] Interstitial ad should appear
- [ ] Ad is full screen
- [ ] Has close button (X) after 5 seconds
- [ ] Game restarts after ad closes
- [ ] Doesn't show if played recently (< 3 min)

**Expected behavior:**
- Shows every 3 games
- Minimum 3 minutes between ads
- Non-blocking (game restarts if ad fails)
- Premium users never see it

---

## Game Over Screen Layout

```
┌─────────────────────────────────┐
│                                 │
│         GAME OVER!              │ ← Red/Purple gradient
│                                 │
│      Score: 1,234               │ ← White text
│                                 │
│    🎉 New Best Score!           │ ← Gold gradient (if best)
│                                 │
│   ┌───────────────────────┐    │
│   │ 🎬 Watch Ad to Continue│    │ ← Gold gradient button
│   └───────────────────────┘    │    (Secondary style)
│                                 │
│   [Error text here if ad fails] │ ← Red error text
│                                 │
│   ┌───────────────────────┐    │
│   │     Play Again        │    │ ← Cyan/Purple gradient
│   └───────────────────────┘    │    (Primary button)
│                                 │
└─────────────────────────────────┘
```

---

## Visual Design Checklist

### Continue Button Style:
- [ ] Border: 2px gold border
- [ ] Background: Gold to orange gradient
- [ ] Icon: Film emoji (🎬)
- [ ] Text: 16px, semibold, white
- [ ] Padding: 12px vertical, 20px horizontal
- [ ] Border radius: Large (16px)
- [ ] Shadow: Medium elevation
- [ ] Spacing: 12px gap between icon and text

### Loading State:
- [ ] Spinner: White color, small size
- [ ] Opacity: 0.6 when disabled
- [ ] No icon or text while loading
- [ ] Centered spinner

### Error State:
- [ ] Text: Red color (#EF4444)
- [ ] Font: 14px, medium weight
- [ ] Position: Below continue button
- [ ] Margin: 4px top spacing
- [ ] Alignment: Center

### Play Again Button (for comparison):
- [ ] Gradient: Cyan to purple
- [ ] Text: 20px, bold, white
- [ ] No border
- [ ] Larger padding than continue
- [ ] Primary button style (more prominent)

---

## Accessibility Checklist

### Continue Button:
- [ ] Label: "Watch ad to continue" (free) or "Continue" (premium)
- [ ] Role: button
- [ ] Hint: "Clears some blocks to give you another chance"
- [ ] State: Disabled when loading
- [ ] Focusable: Yes
- [ ] Screen reader announces correctly

### Haptic Feedback:
- [ ] Light haptic on button press
- [ ] Heavy haptic on successful continue
- [ ] Warning haptic if ad cancelled
- [ ] Error haptic if ad fails

---

## Edge Cases to Test

### Network Conditions:
- [ ] Offline: Error message "Ad not available"
- [ ] Slow connection: Loading spinner shows
- [ ] Connection lost during ad: Error handling

### User Actions:
- [ ] Close ad without watching: "Watch full ad" error
- [ ] Press button multiple times: Disabled prevents double-tap
- [ ] Already used continue: Button doesn't appear
- [ ] Premium user: Instant continue, no ad

### Ad Failures:
- [ ] Ad not ready: "Ad not ready, try again" message
- [ ] Ad timeout: Graceful failure, game continues
- [ ] Invalid ad unit: Fallback to test ads

---

## Performance Checklist

### Frame Rate:
- [ ] Game maintains 60 FPS with banner ad
- [ ] No stuttering when ad loads
- [ ] Smooth animations during continue
- [ ] No lag when interstitial shows

### Memory:
- [ ] No memory leaks from ads
- [ ] App doesn't crash on ad display
- [ ] Multiple ad views don't accumulate memory

### Load Times:
- [ ] Banner loads within 2-3 seconds
- [ ] Interstitial loads within 1-2 seconds
- [ ] Rewarded ad loads within 2-3 seconds
- [ ] Continue button appears instantly

---

## Premium User Testing

### Ad-Free Experience:
- [ ] No banner ads visible
- [ ] No interstitial ads show
- [ ] Continue button shows "Continue" (not "Watch Ad")
- [ ] Clicking continue is instant (no ad)
- [ ] All features work without ads

---

## Device Testing

### iOS Devices:
- [ ] iPhone 14 Pro (notch)
- [ ] iPhone SE (no notch)
- [ ] iPad (larger screen)
- [ ] Safe areas handled correctly
- [ ] Ads display properly

### Android Devices:
- [ ] Pixel 7 (punch hole)
- [ ] Samsung Galaxy (curved screen)
- [ ] Various screen sizes
- [ ] Safe areas handled correctly
- [ ] Ads display properly

---

## Analytics Verification

Check that these events fire:
- [ ] `banner_ad_shown` - Banner displays
- [ ] `banner_ad_clicked` - User clicks banner
- [ ] `interstitial_ad_shown` - Interstitial displays
- [ ] `rewarded_ad_shown` - Rewarded ad starts
- [ ] `rewarded_ad_completed` - User watches full ad
- [ ] `continue_used` - Game continues after ad

---

## Final Checks

### Before Production:
- [ ] Replace test ad unit IDs with real IDs
- [ ] Verify `.env` has all ad unit IDs
- [ ] Verify `app.json` has real App IDs
- [ ] Test on physical devices (not simulator)
- [ ] Verify AdMob account approved
- [ ] Check payment info set up
- [ ] Monitor AdMob dashboard

### User Experience:
- [ ] Ads feel natural, not intrusive
- [ ] Continue feature feels valuable
- [ ] No user complaints about ad frequency
- [ ] Game remains enjoyable
- [ ] Premium users have smooth experience

---

## Expected User Flow

1. **Start Game:**
   - Banner appears at bottom ✅
   - Game plays normally ✅

2. **Game Over:**
   - Game over screen appears ✅
   - Continue button visible (gold, with icon) ✅
   - Play Again button visible (cyan/purple) ✅

3. **Click Continue:**
   - Loading spinner appears ✅
   - Rewarded ad loads and plays ✅
   - User watches ad ✅
   - Blocks clear, game continues ✅

4. **Game Over Again:**
   - No continue button (already used) ✅
   - Only Play Again button ✅

5. **Click Play Again:**
   - Interstitial ad shows (every 3rd game) ✅
   - Ad plays and closes ✅
   - Game restarts with fresh board ✅

---

## Status Indicators

### Development Mode:
- ✅ "Test Ad" label visible on ads
- ✅ Console logs show ad events
- ✅ Debug info for developers

### Production Mode:
- ✅ Real ads display
- ✅ No test labels
- ✅ Clean user experience

---

## Success Criteria

### All checks pass if:
- ✅ TypeScript compiles with no errors
- ✅ Linting passes with no warnings
- ✅ All three ad types display correctly
- ✅ Continue button works as expected
- ✅ Premium users bypass ads
- ✅ Error handling works for all cases
- ✅ Performance remains smooth (60 FPS)
- ✅ Analytics events fire correctly
- ✅ UI follows design standards
- ✅ Accessibility requirements met

---

**Visual Verification Status:** ✅ READY FOR DEVICE TESTING

**Next Step:** Build app on physical device and test all flows


