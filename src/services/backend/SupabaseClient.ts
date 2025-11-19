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
      throw new Error(
        'Supabase URL and Anon Key must be set in environment variables'
      );
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
    console.log('✅ Supabase client initialized');

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

