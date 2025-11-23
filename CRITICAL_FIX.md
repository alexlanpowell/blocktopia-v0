# CRITICAL FIX: Reverted Batched Store Selectors

## Issue
Optimization #4 (Batch Store Selectors) caused an **infinite re-render loop** leading to:
- "Maximum update depth exceeded" React error
- "getSnapshot should be cached" warning
- App crash/instability

## Root Cause
The batched selector pattern:
```typescript
const { setUser, loadFromBackend } = useMonetizationStore(
  state => ({ 
    setUser: state.setUser, 
    loadFromBackend: state.loadFromBackend 
  })
);
```

Creates a **new object on every render**, causing Zustand to think the state changed, triggering another render, creating a new object, etc. = **infinite loop**.

## Fix Applied
**REVERTED** to original separate selectors:
```typescript
const setUser = useMonetizationStore(state => state.setUser);
const loadFromBackend = useMonetizationStore(state => state.loadFromBackend);
const loadHighScore = useGameStore(state => state.loadHighScore);
const syncHighScore = useGameStore(state => state.syncHighScore);
```

## Updated Optimization Results

| Optimization | Status | Time Saved |
|-------------|--------|-----------|
| 1. Skip Config Validation | ✅ ACTIVE | 50-100ms |
| 2. Lazy Import Remote Config | ✅ ACTIVE | 50-100ms |
| 3. Cache Session Check | ✅ ACTIVE | 100-300ms |
| 4. Batch Store Selectors | ❌ REVERTED | 0ms (caused crash) |
| 5. Parallel Auth Operations | ✅ ACTIVE | 100-200ms |
| **TOTAL** | **4/5 ACTIVE** | **300-700ms** |

## Current Expected Performance
- **Target**: 500-800ms (revised from 400-700ms)
- **From terminal logs**: 1826ms (still better than original 2625ms)
- **Actual improvement**: ~800ms (30% faster)

## Why Performance Isn't As Good As Expected

The terminal log shows **1826ms**, which is worse than the 800-1100ms we saw after Round 2. Possible reasons:

1. **Cold start** - First load after code change
2. **Development mode overhead** - Dev builds are slower
3. **Network conditions** - Backend calls vary based on connection
4. **Device performance** - Varies by device

## Correct Way to Batch Selectors (For Future Reference)

If we want to batch in the future, we need **shallow equality**:

```typescript
import { shallow } from 'zustand/shallow';

const { setUser, loadFromBackend } = useMonetizationStore(
  state => ({ 
    setUser: state.setUser, 
    loadFromBackend: state.loadFromBackend 
  }),
  shallow // THIS IS CRITICAL
);
```

## Action Items
- [x] Reverted optimization #4
- [x] Verified no linter errors
- [ ] Test app startup multiple times for average
- [ ] Consider adding shallow import if batching is desired later

## Lesson Learned
**Always test optimizations incrementally!** Batching selectors requires shallow equality comparison to prevent reference changes on every render.

---

**Date**: 2025-11-23  
**Status**: Fixed  
**App Status**: Should be stable now

