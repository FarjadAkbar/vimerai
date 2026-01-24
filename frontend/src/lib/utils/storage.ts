/**
 * Centralized storage utility for localStorage and sessionStorage
 * Provides type-safe, SSR-safe storage operations
 */

// Storage keys used across the application
export const STORAGE_KEYS = {
  // LocalStorage keys
  USED_PREVIEW: 'used_preview',
  REMEMBERED_EMAIL: 'rememberedEmail',
  
  // SessionStorage keys
  GENERATOR_PROMPT: 'generator_prompt',
  PENDING_PROMPT: 'pendingPrompt',
} as const

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]

/**
 * Check if we're in a browser environment
 */
const isBrowser = (): boolean => typeof window !== 'undefined'

/**
 * Generic storage operations
 */
class StorageManager {
  constructor(private storage: Storage | null) {}

  /**
   * Get an item from storage
   * @param key - Storage key
   * @param defaultValue - Default value if key doesn't exist
   */
  get<T = string>(key: StorageKey, defaultValue?: T): T | null {
    if (!this.storage) return defaultValue ?? null

    try {
      const item = this.storage.getItem(key)
      if (item === null) return defaultValue ?? null

      // Try to parse as JSON, if it fails return as string
      try {
        return JSON.parse(item) as T
      } catch {
        return item as T
      }
    } catch (error) {
      console.warn(`Error reading from storage (${key}):`, error)
      return defaultValue ?? null
    }
  }

  /**
   * Set an item in storage
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified if object)
   */
  set<T>(key: StorageKey, value: T): boolean {
    if (!this.storage) return false

    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value)
      this.storage.setItem(key, serialized)
      return true
    } catch (error) {
      console.warn(`Error writing to storage (${key}):`, error)
      return false
    }
  }

  /**
   * Remove an item from storage
   * @param key - Storage key
   */
  remove(key: StorageKey): boolean {
    if (!this.storage) return false

    try {
      this.storage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Error removing from storage (${key}):`, error)
      return false
    }
  }

  /**
   * Clear all items from storage
   */
  clear(): boolean {
    if (!this.storage) return false

    try {
      this.storage.clear()
      return true
    } catch (error) {
      console.warn('Error clearing storage:', error)
      return false
    }
  }

  /**
   * Check if a key exists in storage
   * @param key - Storage key
   */
  has(key: StorageKey): boolean {
    if (!this.storage) return false
    return this.storage.getItem(key) !== null
  }
}

// Create storage managers
export const localStorage = new StorageManager(
  isBrowser() ? window.localStorage : null
)

export const sessionStorage = new StorageManager(
  isBrowser() ? window.sessionStorage : null
)

/**
 * Specific storage operations for commonly used values
 * These provide better type safety and semantic meaning
 */
export const storage = {
  // Preview usage
  getUsedPreview: (): boolean => {
    return localStorage.get<boolean>(STORAGE_KEYS.USED_PREVIEW, false) === true
  },
  setUsedPreview: (used: boolean = true): void => {
    localStorage.set(STORAGE_KEYS.USED_PREVIEW, used)
  },
  clearUsedPreview: (): void => {
    localStorage.remove(STORAGE_KEYS.USED_PREVIEW)
  },

  // Remembered email
  getRememberedEmail: (): string | null => {
    return localStorage.get<string>(STORAGE_KEYS.REMEMBERED_EMAIL)
  },
  setRememberedEmail: (email: string): void => {
    localStorage.set(STORAGE_KEYS.REMEMBERED_EMAIL, email)
  },
  clearRememberedEmail: (): void => {
    localStorage.remove(STORAGE_KEYS.REMEMBERED_EMAIL)
  },

  // Generator prompt (session)
  getGeneratorPrompt: (): string | null => {
    return sessionStorage.get<string>(STORAGE_KEYS.GENERATOR_PROMPT)
  },
  setGeneratorPrompt: (prompt: string): void => {
    sessionStorage.set(STORAGE_KEYS.GENERATOR_PROMPT, prompt)
  },
  clearGeneratorPrompt: (): void => {
    sessionStorage.remove(STORAGE_KEYS.GENERATOR_PROMPT)
  },

  // Pending prompt (session)
  getPendingPrompt: (): string | null => {
    return sessionStorage.get<string>(STORAGE_KEYS.PENDING_PROMPT)
  },
  setPendingPrompt: (prompt: string): void => {
    sessionStorage.set(STORAGE_KEYS.PENDING_PROMPT, prompt)
  },
  clearPendingPrompt: (): void => {
    sessionStorage.remove(STORAGE_KEYS.PENDING_PROMPT)
  },

  // Clear all application storage
  clearAll: (): void => {
    localStorage.clear()
    sessionStorage.clear()
  },
}

/**
 * Custom React hook for using storage with reactivity
 * Usage: const [value, setValue] = useStorage('key', 'defaultValue')
 */
export function useStorageValue<T>(
  key: StorageKey,
  defaultValue: T,
  useSession = false
): [T, (value: T) => void] {
  const storageManager = useSession ? sessionStorage : localStorage
  
  const getValue = (): T => {
    return storageManager.get<T>(key, defaultValue) ?? defaultValue
  }

  const setValue = (value: T): void => {
    storageManager.set(key, value)
  }

  return [getValue(), setValue]
}
