/**
 * Authentication Service
 * Handles Apple Sign-In, Google Sign-In, Anonymous Auth, and Account Linking
 */

import { Platform, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Crypto from 'expo-crypto';
import { getSupabase } from '../backend/SupabaseClient';
import { ENV_CONFIG } from '../backend/config';
import type { Session, User } from '@supabase/supabase-js';

export type AuthProvider = 'apple' | 'google' | 'anonymous';

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
  gems: number;
  premium_status: boolean;
  premium_expires_at: string | null;
  created_at: string;
}

/**
 * Authentication Service Singleton
 */
class AuthService {
  private static instance: AuthService;
  private initialized: boolean = false;

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
      // Initialize Google Sign-In
      await this.initializeGoogleSignIn();
      
      this.initialized = true;
      console.log('✅ Auth service initialized');
    } catch (error) {
      console.error('Auth service initialization error:', error);
    }
  }

  /**
   * Initialize Google Sign-In
   */
  private async initializeGoogleSignIn(): Promise<void> {
    try {
      await GoogleSignin.configure({
        webClientId: ENV_CONFIG.GOOGLE_WEB_CLIENT_ID,
        iosClientId: ENV_CONFIG.GOOGLE_CLIENT_ID_IOS,
        offlineAccess: true,
      });
      console.log('✅ Google Sign-In configured');
    } catch (error) {
      console.error('Google Sign-In configuration error:', error);
    }
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple(): Promise<AuthResult> {
    try {
      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        return {
          success: false,
          user: null,
          session: null,
          error: 'Apple Sign-In is not available on this device',
        };
      }

      // Request Apple credentials
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Get identity token
      const identityToken = credential.identityToken;
      if (!identityToken) {
        throw new Error('No identity token returned from Apple');
      }

      // Sign in with Supabase
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: identityToken,
      });

      if (error) throw error;

      // Create or update user profile
      if (data.user) {
        await this.createOrUpdateProfile(data.user, {
          username: credential.fullName?.givenName || null,
          email: credential.email || data.user.email || null,
        });
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      console.error('Apple Sign-In error:', error);
      
      if (error.code === 'ERR_CANCELED') {
        return {
          success: false,
          user: null,
          session: null,
          error: 'Sign-in cancelled',
        };
      }

      return {
        success: false,
        user: null,
        session: null,
        error: error.message || 'Apple Sign-In failed',
      };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      // Check Play Services
      await GoogleSignin.hasPlayServices();

      // Sign in
      const response = await GoogleSignin.signIn();
      
      // Extract idToken from response
      const idToken = response.data?.idToken;
      
      if (!idToken) {
        throw new Error('No ID token returned from Google');
      }

      // Sign in with Supabase
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;

      // Create or update user profile
      if (data.user && response.data?.user) {
        await this.createOrUpdateProfile(data.user, {
          username: response.data.user.name || null,
          email: response.data.user.email || null,
          avatar_url: response.data.user.photo || null,
        });
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      console.error('Google Sign-In error:', error);

      if (error.code === 'SIGN_IN_CANCELLED') {
        return {
          success: false,
          user: null,
          session: null,
          error: 'Sign-in cancelled',
        };
      }

      return {
        success: false,
        user: null,
        session: null,
        error: error.message || 'Google Sign-In failed',
      };
    }
  }

  /**
   * Sign in anonymously
   */
  async signInAnonymously(): Promise<AuthResult> {
    try {
      const supabase = getSupabase();
      
      // Generate anonymous user credentials
      const anonymousId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `anonymous_${Date.now()}_${Math.random()}`
      );
      
      const email = `${anonymousId.slice(0, 16)}@anonymous.blocktopia.app`;
      const password = anonymousId;

      // Try to sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            is_anonymous: true,
          },
        },
      });

      if (error) throw error;

      // Create profile
      if (data.user) {
        await this.createOrUpdateProfile(data.user, {
          username: `Guest${Date.now().toString().slice(-6)}`,
          email: null, // Don't store anonymous email in profile
        });
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
   * Create or update user profile in database
   */
  private async createOrUpdateProfile(
    user: User,
    profileData: Partial<UserProfile>
  ): Promise<void> {
    try {
      const supabase = getSupabase();

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: profileData.email || user.email,
          username: profileData.username,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Also create user_settings entry
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      console.log('✅ User profile created/updated');
    } catch (error) {
      console.error('Error creating/updating profile:', error);
    }
  }

  /**
   * Link anonymous account to social provider
   */
  async linkAccount(provider: 'apple' | 'google'): Promise<AuthResult> {
    try {
      const supabase = getSupabase();
      const currentUser = await supabase.auth.getUser();

      if (!currentUser.data.user) {
        throw new Error('No user currently signed in');
      }

      // Check if user is anonymous
      const isAnonymous = currentUser.data.user.user_metadata?.is_anonymous;
      if (!isAnonymous) {
        throw new Error('Current user is not anonymous');
      }

      // Sign in with the new provider
      let result: AuthResult;
      if (provider === 'apple') {
        result = await this.signInWithApple();
      } else {
        result = await this.signInWithGoogle();
      }

      if (result.success && result.user) {
        // Transfer data from anonymous account to new account
        await this.transferAnonymousData(currentUser.data.user.id, result.user.id);
        
        Alert.alert(
          'Account Linked!',
          'Your progress has been saved to your new account.'
        );
      }

      return result;
    } catch (error: any) {
      console.error('Account linking error:', error);
      return {
        success: false,
        user: null,
        session: null,
        error: error.message || 'Account linking failed',
      };
    }
  }

  /**
   * Transfer data from anonymous account to new account
   */
  private async transferAnonymousData(
    fromUserId: string,
    toUserId: string
  ): Promise<void> {
    try {
      const supabase = getSupabase();

      // Transfer gems
      const { data: fromProfile } = await supabase
        .from('profiles')
        .select('gems')
        .eq('id', fromUserId)
        .single();

      if (fromProfile && fromProfile.gems > 0) {
        await supabase
          .from('profiles')
          .update({ gems: fromProfile.gems })
          .eq('id', toUserId);
      }

      // Transfer power-ups inventory
      const { data: powerUps } = await supabase
        .from('power_ups_inventory')
        .select('*')
        .eq('user_id', fromUserId);

      if (powerUps && powerUps.length > 0) {
        await supabase
          .from('power_ups_inventory')
          .upsert(
            powerUps.map(pu => ({
              ...pu,
              user_id: toUserId,
              id: undefined, // Let DB generate new ID
            }))
          );
      }

      // Transfer cosmetics
      const { data: cosmetics } = await supabase
        .from('cosmetics_owned')
        .select('*')
        .eq('user_id', fromUserId);

      if (cosmetics && cosmetics.length > 0) {
        await supabase
          .from('cosmetics_owned')
          .upsert(
            cosmetics.map(c => ({
              ...c,
              user_id: toUserId,
              id: undefined,
            }))
          );
      }

      console.log('✅ Anonymous data transferred');
    } catch (error) {
      console.error('Error transferring anonymous data:', error);
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      const supabase = getSupabase();
      
      // Sign out from Google if signed in
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        // Ignore errors if not signed in with Google
      }

      // Sign out from Supabase
      await supabase.auth.signOut();

      console.log('✅ User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return data as UserProfile;
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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }
}

export default AuthService;
export const authService = AuthService.getInstance();

