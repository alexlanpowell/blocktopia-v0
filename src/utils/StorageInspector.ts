/**
 * Storage Inspector - Inspect and manage MMKV storage
 * Used by Admin Dashboard to view/edit storage keys
 */

import { MMKV } from 'react-native-mmkv';

interface StorageInstance {
  id: string;
  instance: MMKV;
}

class StorageInspector {
  private static instance: StorageInspector;
  private storageInstances: Map<string, MMKV> = new Map();

  private constructor() {}

  static getInstance(): StorageInspector {
    if (!StorageInspector.instance) {
      StorageInspector.instance = new StorageInspector();
    }
    return StorageInspector.instance;
  }

  /**
   * Get or create MMKV instance by ID
   */
  private getStorageInstance(id: string): MMKV | null {
    if (this.storageInstances.has(id)) {
      return this.storageInstances.get(id)!;
    }

    try {
      const instance = new MMKV({ id });
      this.storageInstances.set(id, instance);
      return instance;
    } catch (error) {
      if (__DEV__) {
        console.warn(`[StorageInspector] Failed to create MMKV instance "${id}":`, error);
      }
      return null;
    }
  }

  /**
   * Get all keys from a storage instance
   */
  getAllKeys(storageId: string): string[] {
    const instance = this.getStorageInstance(storageId);
    if (!instance) return [];

    try {
      return instance.getAllKeys();
    } catch (error) {
      if (__DEV__) {
        console.warn(`[StorageInspector] Failed to get keys from "${storageId}":`, error);
      }
      return [];
    }
  }

  /**
   * Get value for a key
   */
  getValue(storageId: string, key: string): any {
    const instance = this.getStorageInstance(storageId);
    if (!instance) return null;

    try {
      // Try different types
      if (instance.contains(key)) {
        const type = instance.getString(key) !== undefined ? 'string' :
                     instance.getNumber(key) !== undefined ? 'number' :
                     instance.getBoolean(key) !== undefined ? 'boolean' :
                     'object';

        switch (type) {
          case 'string':
            return instance.getString(key);
          case 'number':
            return instance.getNumber(key);
          case 'boolean':
            return instance.getBoolean(key);
          default:
            try {
              const str = instance.getString(key);
              return str ? JSON.parse(str) : null;
            } catch {
              return null;
            }
        }
      }
      return null;
    } catch (error) {
      if (__DEV__) {
        console.warn(`[StorageInspector] Failed to get value for "${key}":`, error);
      }
      return null;
    }
  }

  /**
   * Set value for a key
   */
  setValue(storageId: string, key: string, value: any): boolean {
    const instance = this.getStorageInstance(storageId);
    if (!instance) return false;

    try {
      if (typeof value === 'string') {
        instance.set(key, value);
      } else if (typeof value === 'number') {
        instance.set(key, value);
      } else if (typeof value === 'boolean') {
        instance.set(key, value);
      } else {
        instance.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      if (__DEV__) {
        console.warn(`[StorageInspector] Failed to set value for "${key}":`, error);
      }
      return false;
    }
  }

  /**
   * Delete a key
   */
  deleteKey(storageId: string, key: string): boolean {
    const instance = this.getStorageInstance(storageId);
    if (!instance) return false;

    try {
      instance.delete(key);
      return true;
    } catch (error) {
      if (__DEV__) {
        console.warn(`[StorageInspector] Failed to delete key "${key}":`, error);
      }
      return false;
    }
  }

  /**
   * Clear all keys from a storage instance
   */
  clearAll(storageId: string): boolean {
    const instance = this.getStorageInstance(storageId);
    if (!instance) return false;

    try {
      instance.clearAll();
      return true;
    } catch (error) {
      if (__DEV__) {
        console.warn(`[StorageInspector] Failed to clear storage "${storageId}":`, error);
      }
      return false;
    }
  }

  /**
   * Get storage size estimate (approximate)
   */
  getStorageSize(storageId: string): number {
    const instance = this.getStorageInstance(storageId);
    if (!instance) return 0;

    try {
      const keys = instance.getAllKeys();
      let size = 0;
      keys.forEach(key => {
        const value = this.getValue(storageId, key);
        if (value !== null) {
          size += JSON.stringify(value).length;
        }
      });
      return size;
    } catch (error) {
      if (__DEV__) {
        console.warn(`[StorageInspector] Failed to get storage size for "${storageId}":`, error);
      }
      return 0;
    }
  }

  /**
   * Get all known storage IDs
   */
  getKnownStorageIds(): string[] {
    // Common storage IDs used in the app
    return [
      'game-state',
      'audio-settings',
      'user-settings',
      'high-scores',
    ];
  }

  /**
   * Get all storage instances info
   */
  getAllStorageInfo(): Array<{ id: string; keyCount: number; size: number }> {
    return this.getKnownStorageIds().map(id => ({
      id,
      keyCount: this.getAllKeys(id).length,
      size: this.getStorageSize(id),
    }));
  }
}

export const storageInspector = StorageInspector.getInstance();
export default StorageInspector;

