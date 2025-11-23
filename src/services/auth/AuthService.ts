/**
 * Authentication Service
 * Handles Email/Password and Anonymous Authentication
 */

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabase, supabaseManager } from '../backend/SupabaseClient';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  user: User | null;
  session: Session | null;
  error?: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  gems: number;
  premium_status: boolean;
  premium_expires_at: string | null;
  created_at: string;
}

// AsyncStorage key for persistent guest sessions
const GUEST_USER_KEY = '@blocktopia_guest_user_id';

/**
 * Authentication Service Singleton
 */
class AuthService {
  private static instance: AuthService;
  private initialized: boolean = false;
  private authListeners: ((user: User | null) => void)[] = [];

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize authentication services
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.initialized = true;
      // Logging handled by app initialization
    } catch (error) {
      console.error('Auth service initialization error:', error);
    }
  }

  /**
   * Restore existing guest session from stored user ID
   * 
   * NOTE: Supabase anonymous auth doesn't support signing into an existing anonymous account.
   * However, Supabase sessions persist across app restarts via refresh tokens.
   * So if the user hasn't explicitly signed out, the session should still be valid.
   * 
   * @private
   */
  private async restoreGuestSession(userId: string): Promise<AuthResult> {
    try {
      const supabase = getSupabase();
      
      // First, check if we have a valid session with matching user ID
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user.id === userId) {
        // Session is still valid and matches stored guest ID
        console.log('✅ Restored existing guest session (session still valid)');
        
        // Notify listeners since Supabase won't fire event for existing session
        this.authListeners.forEach(listener => listener(session.user));
        
        return {
          success: true,
          user: session.user,
          session: session,
        };
      }

      // Session doesn't exist or user ID doesn't match
      // Check if profile exists in database
      const { data: profile, error: profileError } = await supabaseManager
        .from('profiles')
        .select('id, username')
        .eq('id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Error checking guest profile:', profileError);
        return {
          success: false,
          user: null,
          session: null,
          error: 'Failed to verify guest account',
        };
      }

      // If profile doesn't exist, can't restore
      if (!profile) {
        console.log('Guest profile not found, will create new account');
        return {
          success: false,
          user: null,
          session: null,
          error: 'Guest account not found',
        };
      }

      // Profile exists but no valid session
      // This means the user explicitly signed out
      // Since Supabase anonymous auth doesn't support signing into existing accounts,
      // we can't restore this session. Return failure so a new account will be created.
      console.log('⚠️ Guest account exists but session expired. Cannot restore anonymous session.');
      console.log('   Note: Supabase anonymous auth doesn\'t support signing into existing accounts.');
      console.log('   A new guest account will be created.');
      
      return {
        success: false,
        user: null,
        session: null,
        error: 'Guest session expired - cannot restore anonymous sessions',
      };
    } catch (error: any) {
      console.error('Error restoring guest session:', error);
      return {
        success: false,
        user: null,
        session: null,
        error: error.message || 'Failed to restore guest session',
      };
    }
  }

  /**
   * Sign in anonymously
   * Uses Supabase's native anonymous authentication
   * Requires "Anonymous Sign-Ins" enabled in Supabase Dashboard
   * 
   * This method now checks for an existing guest session first.
   * If found, it restores that session. Otherwise, creates a new anonymous account.
   */
  async signInAnonymously(): Promise<AuthResult> {
    try {
      const supabase = getSupabase();
      
      // Check for existing guest session in AsyncStorage
      const storedGuestId = await AsyncStorage.getItem(GUEST_USER_KEY);
      
      if (storedGuestId) {
        console.log('🔄 Found stored guest ID, attempting to restore session...');
        const restoreResult = await this.restoreGuestSession(storedGuestId);
        
        if (restoreResult.success && restoreResult.user) {
          console.log('✅ Successfully restored guest session');
          return restoreResult;
        }
        
        // If restore failed, clear the stored ID and create new account
        console.log('⚠️ Failed to restore guest session, creating new account');
        await AsyncStorage.removeItem(GUEST_USER_KEY);
      }
      
      // No stored guest or restore failed - create new anonymous account
      console.log('🆕 Creating new anonymous account...');
      
      // Generate username before signing in
      const timestamp = Date.now();
      const username = `Guest${timestamp.toString().slice(-6)}`;

      // Sign in anonymously with metadata for the trigger
      const { data, error } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            username: username,
            is_anonymous: true
          }
        }
      });

      if (error) throw error;

      // Wait for profile to be created by trigger
      if (data.user) {
        // Store guest ID for future sessions
        await AsyncStorage.setItem(GUEST_USER_KEY, data.user.id);
        
        // Verify profile creation (handled by database trigger now)
        await this.waitForProfileCreation(data.user.id);
        
        console.log('✅ Created new guest account:', username);
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      console.error('Anonymous sign-in error:', error);
      return {
        success: false,
        user: null,
        session: null,
        error: error.message || 'Anonymous sign-in failed',
      };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(
    email: string,
    password: string,
    username: string
  ): Promise<AuthResult> {
    try {
      const supabase = getSupabase();

      // Validate inputs
      if (!email || !email.includes('@')) {
        return {
          success: false,
          user: null,
          session: null,
          error: 'Please enter a valid email address',
        };
      }

      if (!password || password.length < 6) {
        return {
          success: false,
          user: null,
          session: null,
          error: 'Password must be at least 6 characters',
        };
      }

      if (!username || username.length < 3) {
        return {
          success: false,
          user: null,
          session: null,
          error: 'Username must be at least 3 characters',
        };
      }

      // Check if username is already taken
      const { data: existingProfile, error: usernameCheckError } = await supabaseManager
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

      if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is fine
        console.warn('Username check error:', usernameCheckError);
        // Continue anyway - database constraint will catch duplicates
      }

      if (existingProfile) {
        return {
          success: false,
          user: null,
          session: null,
          error: 'Username is already taken',
        };
      }

      // Sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
          },
        },
      });

      if (error) throw error;

      // Wait for profile creation (handled by database trigger)
      if (data.user) {
        await this.waitForProfileCreation(data.user.id);
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      console.error('Email sign-up error:', error);
      return {
        success: false,
        user: null,
        session: null,
        error: error.message || 'Sign-up failed',
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const supabase = getSupabase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      
      let errorMessage = 'Sign-in failed';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email before signing in';
      } else {
        errorMessage = error.message || errorMessage;
      }

      return {
        success: false,
        user: null,
        session: null,
        error: errorMessage,
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabase();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'blocktopia://reset-password',
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send password reset email',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { error } = await supabaseManager
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(imageUri: string): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Convert image to blob
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();

      // Generate unique filename
      const fileName = `${user.id}/avatar_${Date.now()}.jpg`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabaseManager
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return {
        success: true,
        avatarUrl: publicUrl,
      };
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload avatar',
      };
    }
  }

  /**
   * Wait for profile to be created by database trigger
   * @private
   */
  private async waitForProfileCreation(
    userId: string,
    maxRetries: number = 5,
    retryDelay: number = 1000
  ): Promise<void> {
    const supabase = getSupabase();
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const { data, error } = await supabaseManager
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        console.log('✅ Profile creation verified');
        return;
      }

      if (attempt < maxRetries) {
        console.log(`⏳ Waiting for profile creation... (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    console.warn('⚠️ Profile creation verification timed out - trigger may have failed or is slow');
  }

  /**
   * Create or update user profile - DEPRECATED: handled by triggers now
   * kept for legacy support/updates
   */
  private async createOrUpdateProfileWithRetry(
    user: User,
    profileData: Partial<UserProfile>,
    maxRetries: number = 3,
    retryDelay: number = 500
  ): Promise<void> {
    // Forward to updateProfile for updates, skip creation
    if (Object.keys(profileData).length > 0) {
       await this.updateProfile(profileData);
    }
  }

  private async createOrUpdateProfile(
    user: User,
    profileData: Partial<UserProfile>
  ): Promise<void> {
    // Use retry logic by default
    return this.createOrUpdateProfileWithRetry(user, profileData);
  }

  /**
   * Sign out
   * 
   * IMPORTANT: For anonymous/guest users, we DON'T actually sign out from Supabase
   * because Supabase anonymous auth doesn't support signing back into the same account.
   * Instead, we preserve the session so they can return to their account.
   * 
   * For authenticated users (email/password, social), we sign out normally.
   */
  async signOut(): Promise<void> {
    try {
      const supabase = getSupabase();
      
      // Check if current user is anonymous before signing out
      const { data: { user } } = await supabase.auth.getUser();
      const isAnonymous = user?.is_anonymous || user?.user_metadata?.is_anonymous;
      
      if (isAnonymous) {
        // For anonymous users, DON'T sign out from Supabase
        // This preserves their session so they can return to the same account
        console.log('✅ Guest user signed out (session preserved for return)');
        
        // Notify listeners that user is "signed out" locally
        // This ensures the UI updates even though Supabase session remains active
        this.authListeners.forEach(listener => listener(null));
        
        // Note: Guest ID is already in AsyncStorage, so they can return
        return;
      }
      
      // For authenticated users, sign out normally
      // Sign out from Supabase
      await supabase.auth.signOut();

      console.log('✅ User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  /**
   * Get current user profile with retry logic
   * Handles race conditions where profile might not exist immediately after creation
   */
  async getUserProfile(maxRetries: number = 2, retryDelay: number = 500): Promise<UserProfile | null> {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return null;

      let lastError: any = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const { data, error } = await supabaseManager
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle to handle no results gracefully

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          if (data) {
            return data as UserProfile;
          }

          // Profile doesn't exist yet - might be a timing issue
          if (attempt < maxRetries) {
            console.log(`⚠️ Profile not found, retrying (${attempt}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }

          // Last attempt - profile truly doesn't exist
          console.warn('Profile not found after retries - user may need to create profile');
          return null;
        } catch (error: any) {
          lastError = error;
          if (attempt < maxRetries) {
            console.log(`⚠️ Error fetching profile, retrying (${attempt}/${maxRetries}):`, error.message);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      // All retries failed
      console.error('Error getting user profile after retries:', lastError);
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      return session !== null;
    } catch {
      return false;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const supabase = getSupabase();
    
    // Add to local listeners
    this.authListeners.push(callback);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
      // Remove from local listeners
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Upgrade anonymous account to permanent account
   * Converts guest account to full account with email/password
   */
  async upgradeAnonymousAccount(email: string, password: string): Promise<AuthResult> {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return {
          success: false,
          user: null,
          session: null,
          error: 'No user currently signed in',
        };
      }

      // Check if user is anonymous
      const isAnonymous = user.is_anonymous || user.user_metadata?.is_anonymous;
      if (!isAnonymous) {
        return {
          success: false,
          user: null,
          session: null,
          error: 'Current user is not anonymous',
        };
      }

      // Update user with email and password
      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
        data: {
          is_anonymous: false, // Mark as no longer anonymous
        },
      });

      if (error) throw error;

      // Update profile with email
      if (data.user) {
        // Just update the email/metadata, don't try to create
        await this.updateProfile({
          email: email,
        });
      }

      // Get current session (updateUser doesn't return session)
      const { data: { session } } = await supabase.auth.getSession();

      return {
        success: true,
        user: data.user,
        session: session,
      };
    } catch (error: any) {
      console.error('Account upgrade error:', error);
      return {
        success: false,
        user: null,
        session: null,
        error: error.message || 'Failed to upgrade account',
      };
    }
  }

  /**
   * Delete user account and all associated data
   * WARNING: This is irreversible
   * 
   * NOTE: This deletes user data from tables but cannot delete the auth user itself
   * from the client. To fully delete the auth user, you need to:
   * 1. Create a Supabase Edge Function or Database Function with admin privileges
   * 2. Call that function from here
   * 3. Or handle account deletion through your backend/admin panel
   */
  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Delete user data from all tables
      // Note: These should cascade based on RLS policies
      const tablesToClean = [
        'game_sessions',
        'transactions',
        'power_ups_inventory',
        'cosmetics_owned',
        'user_settings',
        'analytics_events',
        'profiles',
      ];

      let deletionErrors: string[] = [];

      for (const table of tablesToClean) {
        try {
          // Determine the correct column name for each table
          // profiles uses 'id', all others use 'user_id'
          const idColumn = table === 'profiles' ? 'id' : 'user_id';
          
          const { error } = await supabase
            .from(table)
            .delete()
            .eq(idColumn, user.id);

          if (error) {
            console.warn(`Warning: Failed to delete from ${table}:`, error);
            deletionErrors.push(`${table}: ${error.message}`);
          }
        } catch (tableError: any) {
          console.warn(`Error deleting from ${table}:`, tableError);
          deletionErrors.push(`${table}: ${tableError.message}`);
        }
      }

      // Clear guest ID from AsyncStorage if this was a guest account
      const isAnonymous = user.is_anonymous || user.user_metadata?.is_anonymous;
      if (isAnonymous) {
        try {
          await AsyncStorage.removeItem(GUEST_USER_KEY);
          console.log('✅ Cleared guest ID from storage');
        } catch (storageError) {
          console.warn('Failed to clear guest ID from storage:', storageError);
        }
      }

      // Sign out the user (we can't delete auth user from client)
      await this.signOut();

      if (deletionErrors.length > 0) {
        console.warn('Some data deletion failed:', deletionErrors);
        return {
          success: true,
          error: `Account data deleted, but some errors occurred: ${deletionErrors.join(', ')}. Note: Auth user deletion requires admin privileges.`,
        };
      }

      console.log('✅ Account data deleted successfully');
      return {
        success: true,
        error: 'Account data deleted. Note: Auth user deletion requires admin privileges via Edge Function or backend.',
      };
    } catch (error: any) {
      console.error('Account deletion error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete account',
      };
    }
  }

  /**
   * Check if current user is anonymous
   */
  async isAnonymousUser(): Promise<boolean> {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;
      
      return user.is_anonymous || user.user_metadata?.is_anonymous || false;
    } catch {
      return false;
    }
  }
}

export default AuthService;
export const authService = AuthService.getInstance();

