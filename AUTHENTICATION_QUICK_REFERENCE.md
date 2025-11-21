# Authentication Quick Reference

## Current Authentication Methods

### 1. Guest/Anonymous
- **Entry Point**: "Continue as Guest" button in AuthModal
- **Service Method**: `authService.signInAnonymously()`
- **Features**:
  - Auto-login on app restart
  - Full cloud sync
  - Can upgrade to email/password
  - Session persists in AsyncStorage

### 2. Email/Password
- **Entry Points**: 
  - "Sign in with Email" → `/auth/login`
  - "Create Account" → `/auth/signup`
- **Service Methods**:
  - `authService.signUp(email, password, username)`
  - `authService.signIn(email, password)`
- **Features**:
  - Permanent account
  - Password reset via Supabase
  - Profile customization

## User Flows

### Flow 1: Guest User
```
1. Launch app
2. App auto-signs in as guest (or restores existing guest session)
3. User sees "Welcome, Guest######" message
4. User plays, earns gems, makes purchases
5. All data saves to Supabase automatically
6. User can upgrade to email/password in Settings
```

### Flow 2: New Email/Password User
```
1. Launch app
2. Click "Create Account" in AuthModal
3. Navigate to signup screen
4. Enter email, password, username
5. Account created in Supabase
6. Profile auto-created with default values
7. User signed in automatically
```

### Flow 3: Existing Email/Password User
```
1. Launch app
2. Click "Sign in with Email" in AuthModal
3. Navigate to login screen
4. Enter email and password
5. Sign in via Supabase
6. Profile loaded from database
```

### Flow 4: Guest Upgrade
```
1. Playing as guest
2. Open Settings
3. Click "Upgrade to Full Account"
4. Navigate to signup screen
5. Enter email, password, username
6. Account created
7. All guest data transferred to new account
8. Guest session cleared
```

## Key Components

### AuthModal.tsx
- Main authentication entry point
- Shows on first launch or when auth required
- Three buttons:
  1. Sign in with Email
  2. Create Account
  3. Continue as Guest

### SettingsScreen.tsx
- Account management interface
- Shows user info (username, email, gems, premium)
- For guests: "Upgrade to Full Account" button
- For all users:
  - Sign Out
  - Delete Account
  - Privacy Policy link
  - Terms of Service link

### AuthService.ts
Core methods:
- `initialize()` - Sets up auth service
- `signInAnonymously()` - Creates/restores guest account
- `signUp(email, password, username)` - Creates email/password account
- `signIn(email, password)` - Signs in existing user
- `signOut()` - Signs out (preserves guest session)
- `deleteAccount()` - Deletes all user data
- `upgradeAnonymousAccount(email, password, username)` - Upgrades guest to full account
- `getUserProfile()` - Fetches user profile from Supabase
- `isAnonymousUser()` - Checks if current user is guest

## Database Tables

### profiles
- `id` (UUID, matches auth.users.id)
- `email`
- `username`
- `avatar_url`
- `bio`
- `gems`
- `premium_status`
- `premium_expires_at`
- `created_at`

### game_sessions
- User's game history
- Scores, lines cleared, duration
- Linked to user via `user_id`

### transactions
- Purchase history (gems, IAP, etc.)
- Linked to user via `user_id`
- Preserved during guest upgrade

### user_settings
- Active skins, themes, preferences
- Sound, music, haptics settings
- Linked to user via `user_id`

### power_ups_inventory
- User's power-up quantities
- Linked to user via `user_id`

### cosmetics_owned
- Unlocked cosmetic items
- Linked to user via `user_id`

### leaderboard
- User's best scores and ranks
- Linked to user via `user_id`

### analytics_events
- User behavior tracking
- Linked to user via `user_id`

## Common Tasks

### Add New Authentication Method
1. Add method to `AuthService.ts`
2. Return `AuthResult` with user, session, error
3. Create/update profile after successful auth
4. Add UI in `AuthModal.tsx` or settings

### Modify User Profile
1. Update `profiles` table schema in Supabase
2. Update `UserProfile` interface in `AuthService.ts`
3. Modify `createOrUpdateProfile()` method
4. Update Settings UI to show new fields

### Add Guest Restrictions
1. Check `isAnonymousUser()` before action
2. Show upgrade prompt if needed
3. Use `router.push('/auth/signup')` for upgrade

### Debug Authentication Issues
1. Check Supabase dashboard for user records
2. Check AsyncStorage for guest user ID
3. Look for console logs:
   - "✅ Restored existing guest session"
   - "✅ Created new anonymous account"
   - "✅ User signed in"
   - "✅ Guest user signed out"
4. Verify RLS policies in Supabase

## Environment Setup

### Required Variables
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Optional Variables
```bash
REVENUECAT_API_KEY_IOS=...
REVENUECAT_API_KEY_ANDROID=...
ADMOB_APP_ID_IOS=...
ADMOB_APP_ID_ANDROID=...
```

## Testing Checklist

- [ ] Guest sign-in works
- [ ] Guest session persists on app restart
- [ ] Email/password signup works
- [ ] Email/password login works
- [ ] Guest upgrade transfers all data
- [ ] Sign out works for both account types
- [ ] Delete account removes all data
- [ ] Settings screen displays correctly
- [ ] All buttons navigate properly
- [ ] No console errors
- [ ] RLS policies allow proper data access

## Troubleshooting

### Issue: Guest session doesn't persist
- Check AsyncStorage for `@blocktopia_guest_user_id`
- Verify `restoreGuestSession()` is called on app init
- Check Supabase for anonymous user record

### Issue: Email/password login fails
- Check credentials are correct
- Verify user exists in Supabase auth.users
- Check for network errors
- Verify Supabase URL and anon key

### Issue: Guest upgrade doesn't transfer data
- Check all 8 tables for data transfer
- Look for transfer errors in console
- Verify RLS policies allow user to read own data
- Check `upgradeAnonymousAccount()` completes successfully

### Issue: Settings screen shows old data
- Refresh profile: `await authService.getUserProfile()`
- Check Zustand store state
- Verify auth state listeners are working
- Check for stale data in store

## Security Notes

1. **Row Level Security (RLS)**: All tables use RLS to restrict access to user's own data
2. **Anonymous Accounts**: Use Supabase's native anonymous auth (secure, no fake emails)
3. **Password Strength**: Enforce in signup screen (min 8 chars, complexity)
4. **Session Management**: Supabase handles JWT refresh automatically
5. **Guest Sessions**: Stored locally in AsyncStorage (cleared on account deletion)

## Future Enhancements

Potential additions:
- Phone number authentication
- Magic link (passwordless email)
- Two-factor authentication
- Biometric authentication (Face ID, Touch ID)
- Account linking (link email to existing guest)
- Social account import (migrate from removed providers)

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd")
**Authentication Methods**: 2 (Email/Password, Anonymous)
**Supported Platforms**: iOS, Android, Web

