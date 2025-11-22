/**
 * Supabase Client Singleton
 * Centralized Supabase client initialization and access
 */

import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV_CONFIG } from './config';

// Storage adapter for Supabase using AsyncStorage
// Note: We use AsyncStorage for Phase 1. MMKV can be added in Phase 2 for better performance
const StorageAdapter = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};

/**
 * Supabase Client Manager
 */
class SupabaseManager {
  private static instance: SupabaseManager;
  private client: SupabaseClient | null = null;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): SupabaseManager {
    if (!SupabaseManager.instance) {
      SupabaseManager.instance = new SupabaseManager();
    }
    return SupabaseManager.instance;
  }

  /**
   * Initialize Supabase client
   */
  initialize(): SupabaseClient {
    if (this.client) {
      return this.client;
    }

    const supabaseUrl = ENV_CONFIG.SUPABASE_URL;
    const supabaseAnonKey = ENV_CONFIG.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase not configured (missing environment variables) - running in offline mode');
      console.warn('  Missing keys:', {
        SUPABASE_URL: !supabaseUrl ? 'MISSING' : 'OK',
        SUPABASE_ANON_KEY: !supabaseAnonKey ? 'MISSING' : 'OK',
      });
      console.warn('  Add these to your .env file to enable Supabase features');
      console.warn('  App will continue in offline mode - auth and database features will not work');
      // Return a mock client or handle this gracefully depending on usage.
      // For now, we'll return a minimal mock that won't crash but won't work for auth/db.
      // This allows the app to start even without env vars.
      
      // Create a dummy client that warns on usage
      const mockClient = {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInAnonymously: async () => {
            console.warn('Mock signInAnonymously called');
            return { data: { user: null, session: null }, error: new Error('Supabase not configured') };
          },
          signInWithPassword: async () => {
            console.warn('Mock signInWithPassword called');
            return { data: { user: null, session: null }, error: new Error('Supabase not configured') };
          },
          signUp: async () => {
            console.warn('Mock signUp called');
            return { data: { user: null, session: null }, error: new Error('Supabase not configured') };
          },
          signOut: async () => ({ error: null }),
        },
        from: () => ({
          select: () => ({ data: [], error: null, maybeSingle: () => ({ data: null, error: null }) }),
          insert: () => ({ data: [], error: null }),
          update: () => ({ data: [], error: null }),
          delete: () => ({ data: [], error: null }),
        }),
        storage: {
          from: () => ({
            upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
          }),
        },
      } as unknown as SupabaseClient;
      
      this.client = mockClient;
      this.initialized = true;
      return this.client;
    }

    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: StorageAdapter as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

    this.initialized = true;
    // Logging handled by app initialization

    return this.client;
  }

  /**
   * Get Supabase client instance
   */
  getClient(): SupabaseClient {
    if (!this.client) {
      return this.initialize();
    }
    return this.client;
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.initialized && this.client !== null;
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    const client = this.getClient();
    const { data, error } = await client.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    return data.session;
  }

  /**
   * Get current user
   */
  async getUser(): Promise<User | null> {
    const client = this.getClient();
    const { data, error } = await client.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    
    return data.user;
  }
}

// Export singleton instance getter
export const getSupabase = () => SupabaseManager.getInstance().getClient();
export const supabaseManager = SupabaseManager.getInstance();
export default SupabaseManager;

