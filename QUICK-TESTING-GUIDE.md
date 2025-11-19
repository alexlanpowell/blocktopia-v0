# 🧪 Quick Testing Guide - Blocktopia

## 🚀 Deploy to Device

```bash
# Option 1: EAS Build (Recommended)
eas build --platform ios --profile development

# Option 2: Expo Go
npx expo start
```

---

## ✅ Critical Tests

### 1. **No Crash Test** 🎯
**MOST IMPORTANT:**
- Open game screen
- Touch pieces at bottom
- **Expected:** Smooth response, NO CRASH ✅

### 2. **Visual Polish Test** 🎨
- Check gradient backgrounds
- Verify glassmorphism effects
- See glow on title and buttons
- Notice modern color scheme

### 3. **Haptic Test** 📳
- Pick up piece → Feel light haptic
- Place piece → Feel medium haptic
- Tap restart → Feel medium haptic

### 4. **Gameplay Test** 🎮
- Drag pieces smoothly
- See green/red highlights
- Clear lines
- Check game over modal

---

## 🐛 If Issues Occur

### Crash on piece touch?
- Check that gesture overlay is rendering
- Verify BlurView is installed: `npx expo install expo-blur`

### Missing gradients?
- Verify expo-linear-gradient is installed
- Check theme.ts file exists

### No haptics?
- Ensure expo-haptics is installed
- Physical device required (simulator has no haptics)

---

## 📱 Expected Result

✅ Beautiful gradient backgrounds  
✅ Glassmorphism UI elements  
✅ Smooth 60 FPS gameplay  
✅ Haptic feedback on all interactions  
✅ NO CRASHES anywhere  
✅ Professional, polished experience  

---

**You're ready to test!** 🎉

