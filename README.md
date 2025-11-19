# 🎮 Blocktopia - Block Puzzle Game

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Expo](https://img.shields.io/badge/Expo-~54.0-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-~5.9-3178C6?logo=typescript)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react)

A production-ready block puzzle game built with Expo, React Native, TypeScript, and Skia. Place pieces on a 10x10 grid, clear full rows and columns, and aim for the highest score!

---

## ✨ Features

### Core Gameplay
- **10x10 Grid**: Classic block puzzle grid
- **18 Piece Shapes**: Variety of tetromino-style pieces
- **3 Pieces at a Time**: Strategic piece selection
- **Line Clearing**: Clear full rows and/or columns
- **Combo System**: Bonus points for clearing multiple lines
- **Game Over Detection**: Auto-detect when no pieces can be placed

### Technical Features
- **60 FPS Performance**: GPU-accelerated rendering with react-native-skia
- **Smooth Touch Controls**: Native gesture handling
- **TypeScript Strict Mode**: Type-safe codebase
- **Modular Architecture**: Separated game logic from rendering
- **State Management**: Zustand for minimal re-renders
- **Production Ready**: EAS build configuration included

---

## 🎯 Game Mechanics

### Scoring Formula
```typescript
score = (BOARD_SIZE + emptyFields/5) * linesCleared + comboBonus
comboBonus = basePoints * (linesCleared / 3.0 - 0.333)
```

### Piece Shapes
18 different shapes including:
- Single blocks
- Horizontal lines (2-5 blocks)
- Vertical lines (2-5 blocks)
- Squares (2x2, 3x3)
- L shapes, T shapes, S shapes
- Cross/Plus shapes

---

## 🛠️ Tech Stack

### Core Technologies
- **React Native** - Cross-platform mobile framework
- **Expo SDK ~54** - Development platform
- **TypeScript ~5.9** - Type-safe JavaScript
- **@shopify/react-native-skia** - GPU-accelerated rendering
- **zustand** - Lightweight state management
- **react-native-gesture-handler** - Native touch performance
- **react-native-reanimated** - Native thread animations

### Architecture
```
blocktopia/
├── app/                      # Expo Router screens
│   ├── index.tsx            # Main menu
│   ├── game.tsx             # Game screen
│   └── _layout.tsx          # Root layout
├── src/
│   ├── game/                # Pure TypeScript game logic
│   │   ├── core/
│   │   │   ├── Board.ts     # Grid logic
│   │   │   ├── Piece.ts     # Piece generation
│   │   │   └── GameState.ts # Main game state
│   │   ├── scoring/
│   │   │   └── ScoreCalculator.ts
│   │   └── constants.ts     # Game config
│   ├── rendering/           # React Native components
│   │   ├── components/
│   │   │   ├── GameBoard.tsx    # Skia board canvas
│   │   │   ├── PiecePreview.tsx # Bottom 3 pieces
│   │   │   └── HUD.tsx          # Score display
│   │   └── hooks/
│   │       └── useGestures.ts   # Touch input
│   ├── store/
│   │   └── gameStore.ts     # Zustand store
│   └── utils/
│       └── types.ts         # TypeScript types
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- EAS CLI (`npm install -g eas-cli`)
- Expo account (free at expo.dev)

### Installation

1. **Clone/Navigate to the project**
   ```bash
   cd C:\Users\Unmap\Downloads\blocktopia
   ```

2. **Install dependencies** (already done)
   ```bash
   npm install
   ```

3. **Configure EAS**
   ```bash
   eas login
   eas build:configure
   ```
   This will prompt you to create an EAS project. Say yes, and it will automatically add the project ID to your app.json.

---

## 📱 Building Development Clients

### Why Development Builds?
Development builds give you:
- ✅ Full native module access (Skia, Gestures, etc.)
- ✅ Hot reload with production-like features
- ✅ TestFlight distribution for iOS
- ✅ Direct APK distribution for Android
- ✅ 60 FPS GPU-accelerated rendering

### Build for iOS + Android (Recommended)
```bash
eas build --platform all --profile development
```

Wait ~15-20 minutes for both builds to complete.

### Build for iOS Only
```bash
eas build --platform ios --profile development
```

### Build for Android Only
```bash
eas build --platform android --profile development
```

---

## 📲 Installing Development Clients

### iPhone (TestFlight)
1. Wait for build to complete (~10-20 minutes)
2. Go to [App Store Connect](https://appstoreconnect.apple.com)
3. Navigate to Blocktopia → TestFlight
4. Wait for build processing (~10-30 minutes)
5. Add yourself as internal tester
6. Install TestFlight app on your iPhone
7. Accept the invitation and install Blocktopia

### Android Phone
1. Download the APK from the EAS build link
2. Install directly on your phone
3. Enable "Install from unknown sources" if prompted

---

## 🔥 Daily Development Workflow

### 1. Start Development Server
```bash
npm run dev:client
```

Or with tunnel (if on different WiFi):
```bash
npm run dev:client:tunnel
```

### 2. Connect Your Device
On your phone:
1. Open the Blocktopia app (NOT Expo Go)
2. Shake the device to open dev menu
3. Tap "Enter URL manually" or scan QR code

### 3. Develop with Hot Reload
- Make code changes
- Save files
- Changes appear instantly on device
- No rebuild needed for TypeScript/React changes

### 4. When to Rebuild
**Rebuild required for:**
- Adding/removing native modules
- Changing `app.json` or `eas.json`
- Updating Expo SDK
- Updating React/React Native versions

**No rebuild needed for:**
- JavaScript/TypeScript changes
- React component updates
- Style modifications
- Game logic changes

---

## 🎮 How to Play

1. **Start the Game**: Tap "Play" on the main menu
2. **Drag Pieces**: Touch and drag pieces from the bottom
3. **Place on Grid**: Drop pieces onto the 10x10 grid
4. **Clear Lines**: Fill complete rows or columns to clear them
5. **Score Points**: Earn more points for combos and multiple clears
6. **Game Over**: Game ends when no pieces can be placed
7. **Restart**: Tap the restart button (↻) to play again

---

## 📊 Performance Metrics

- **Target FPS**: 60 FPS
- **Board Size**: 10x10 grid
- **Piece Count**: 3 active pieces
- **Shape Variations**: 18 different shapes
- **Rendering**: GPU-accelerated with Skia
- **State Updates**: Optimized with Zustand selectors

---

## 🧪 Testing & Debugging

### TypeScript Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npx eslint .
```

### Test on Device
The best way to test is on real devices using the development build:
- iPhone via TestFlight
- Android via direct APK install

---

## 📁 Project Structure Details

### Core Game Logic (Pure TypeScript)
All game logic is in `src/game/` and is completely independent of React:
- **Board.ts**: Grid management, placement validation, line detection
- **Piece.ts**: Piece generation and manipulation
- **GameState.ts**: Main game state machine
- **ScoreCalculator.ts**: Scoring algorithm

### Rendering Layer (React Native)
React components in `src/rendering/` handle all UI:
- **GameBoard.tsx**: Renders the grid with Skia
- **PiecePreview.tsx**: Shows available pieces
- **HUD.tsx**: Displays score and controls
- **useGestures.ts**: Handles touch input

### State Management (Zustand)
Centralized state in `src/store/gameStore.ts`:
- Game state
- Drag & drop state
- Actions (placePiece, restartGame, etc.)
- Optimized selectors for minimal re-renders

---

## 🎨 Customization

### Change Board Size
Edit `src/game/constants.ts`:
```typescript
export const GAME_CONFIG = {
  BOARD_SIZE: 10,  // Change this (8, 10, 12, etc.)
  // ...
};
```

### Change Colors
Edit `src/utils/types.ts`:
```typescript
export const PIECE_COLORS = [
  '#FF6B6B',  // Add/modify colors
  // ...
];
```

### Add More Piece Shapes
Edit `src/game/constants.ts`:
```typescript
export const PIECE_SHAPES: PieceCell[][] = [
  // Add new shapes here
];
```

---

## 🚧 Known Limitations

- No animations yet (Phase 2)
- No sound effects yet (Phase 2)
- No monetization yet (Phase 3)
- No save/load game state yet (Phase 3)
- Portrait orientation only
- Requires development build (no Expo Go support)

---

## 🗺️ Roadmap

### Phase 2: Polish & Feel (Next)
- [ ] Smooth animations (piece pickup, placement, line clear)
- [ ] Sound effects (pickup, place, clear, game over)
- [ ] Particle effects for line clears
- [ ] Visual feedback improvements
- [ ] Settings screen (sound toggles)

### Phase 3: Monetization
- [ ] AsyncStorage for save/load
- [ ] AdMob rewarded video (continue game)
- [ ] Interstitial ads (between games)
- [ ] High score persistence

### Phase 4: Advanced Features
- [ ] In-App Purchases (remove ads, power-ups)
- [ ] Daily rewards
- [ ] Achievements
- [ ] Challenge modes (timed, limited pieces)

### Phase 5: Production
- [ ] App store assets (screenshots, description)
- [ ] Privacy policy & terms
- [ ] Beta testing
- [ ] App Store submission

---

## 🐛 Troubleshooting

### "Module not found" errors
Make sure all dependencies are installed:
```bash
npm install
```

### TypeScript errors
Run type checking:
```bash
npx tsc --noEmit
```

### Build fails
Clean and rebuild:
```bash
npx expo prebuild --clean
eas build --platform all --profile development --clear-cache
```

### Touch input not working
Make sure you're using the development build, not Expo Go.

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 👨‍💻 Development

Built with ❤️ using Expo + React Native + TypeScript

**Ready to build and test on your iPhone and Android!** 🚀

Run `eas build --platform all --profile development` to get started.

