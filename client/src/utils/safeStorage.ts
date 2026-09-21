/**
 * Safe Local & Session Storage Utility
 * 
 * Protects against:
 * 1. Storage disabled in Private / Incognito browsing modes
 * 2. QuotaExceededError when device storage is tight
 * 3. SecurityError in restrictive WebViews or sandboxed iframes
 * 4. JSON parse syntax errors from corrupted values
 */

class SafeStorage {
  private memoryFallback = new Map<string, string>();

  public getItem(key: string, defaultValue: string | null = null): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = window.localStorage.getItem(key);
        return value !== null ? value : defaultValue;
      }
    } catch {
      // Storage restricted; fall back to in-memory map
    }
    return this.memoryFallback.has(key) ? this.memoryFallback.get(key)! : defaultValue;
  }

  public setItem(key: string, value: string): boolean {
    this.memoryFallback.set(key, value);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      console.warn(`[SafeStorage] localStorage write failed for key "${key}", using in-memory store:`, e);
    }
    return false;
  }

  public removeItem(key: string): boolean {
    this.memoryFallback.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return true;
      }
    } catch {}
    return false;
  }

  public getJSON<T>(key: string, defaultValue: T | null = null): T | null {
    const raw = this.getItem(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[SafeStorage] Corrupted JSON in key "${key}", clearing:`, err);
      this.removeItem(key);
      return defaultValue;
    }
  }

  public setJSON<T>(key: string, value: T): boolean {
    try {
      const stringified = JSON.stringify(value);
      return this.setItem(key, stringified);
    } catch (err) {
      console.warn(`[SafeStorage] Failed to stringify JSON for key "${key}":`, err);
      return false;
    }
  }

  public clear(): void {
    this.memoryFallback.clear();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {}
  }
}

export const safeStorage = new SafeStorage();
