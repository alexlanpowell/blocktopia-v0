# 🚀 Blocktopia EAS Build - Quick Reference

**One-page cheat sheet for successful builds**

---

## ✅ Pre-Build Checklist

```
□ All dependencies in package.json
□ npm ci --include=dev passes locally ⚠️ CRITICAL
□ npx tsc --noEmit shows 0 errors
□ All changes committed to git
□ git status shows "working tree clean"
```

---

## 🔧 Essential Commands

### Clean Install
```bash
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -Force
npm install --legacy-peer-deps
```

### Test Locally (EXACTLY what EAS uses!)
```bash
Remove-Item -Recurse -Force node_modules
npm ci --include=dev
```
**⚠️ This MUST pass before EAS build!**

### TypeScript Check
```bash
npx tsc --noEmit
```

### Git Workflow
```bash
git status
git add package.json package-lock.json
git commit -m "Update dependencies"
```

### EAS Build
```bash
eas build --platform ios --profile development
```

### Start Dev Server
```bash
npm run dev:client:tunnel
```

---

## 📦 Required Dependencies

**Must be in package.json:**
```json
{
  "expo": "~54.0.22",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "react-native": "0.81.5",
  "expo-router": "~6.0.13",
  "expo-dev-client": "~6.0.17",
  "expo-linking": "~8.0.8",
  "react-native-reanimated": "~4.1.1",
  "react-native-screens": "~4.16.0",
  "react-native-worklets": "0.5.1"
}
```

**⚠️ react-native-worklets MUST be explicit!**

---

## 🚨 Common Errors & Quick Fixes

### "Missing from lock file"
```bash
Remove-Item package-lock.json -Force
npm install --legacy-peer-deps
# Then test: npm ci --include=dev
git add package-lock.json
git commit -m "Regenerate lock file"
```

### "package.json and package-lock.json out of sync"
```bash
# Same as above - regenerate lock file
```

### Build uses old code
```bash
git status  # Check for uncommitted changes
git add .
git commit -m "Your message"
# Then rebuild
```

### Local passes, EAS fails
```bash
# You're testing with wrong command!
# Don't use: npm ci --legacy-peer-deps
# Use: npm ci --include=dev
```

---

## 🎯 The Correct Workflow

```bash
# 1. Edit package.json
# 2. Clean
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -Force

# 3. Install
npm install --legacy-peer-deps

# 4. TEST (CRITICAL!)
Remove-Item -Recurse -Force node_modules
npm ci --include=dev

# 5. TypeScript check
npx tsc --noEmit

# 6. Commit
git add package.json package-lock.json
git commit -m "Update dependencies"

# 7. Build
eas build --platform ios --profile development
```

---

## ⚠️ DO NOT

- ❌ Use `npm ci --legacy-peer-deps` for testing
- ❌ Build without committing changes
- ❌ Change versions without matching Unmap config
- ❌ Skip the `npm ci --include=dev` test

---

## ✅ DO

- ✅ Test with `npm ci --include=dev` before EAS
- ✅ Commit everything before building
- ✅ Match versions from Unmap config exactly
- ✅ Include react-native-worklets explicitly

---

## 📚 Full Docs

- **Comprehensive Guide:** `BLOCKTOPIA_EAS_BUILD_GUIDE.md`
- **Configuration Details:** `BLOCKTOPIA-BUILD-CONFIG.md`
- **Unmap Reference:** `unmap-app-v5.1-production-build-main/WORKING_BUILD_CONFIGURATION.md`

---

**Last Updated:** November 19, 2025  
**Success Rate:** 6 fails → 1 success  
**Key Fix:** `react-native-worklets@0.5.1` + test with `npm ci --include=dev`

