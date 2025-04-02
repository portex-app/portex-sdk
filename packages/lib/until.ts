interface StorageItem<T> {
  value: T;
  expire: number | null;
}

class Storage {
  /**
   * Set storage item
   * @param key Storage key
   * @param value Value to store
   * @param expire Expiration time (milliseconds), optional, if not provided then permanent storage
   */
  set<T>(key: string, value: T, expire?: number): void {
    const item: StorageItem<T> = {
      value,
      expire: expire ? Date.now() + expire : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Get storage item
   * @param key Storage key
   * @returns Stored value or null (if not exists or expired)
   */
  get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item: StorageItem<T> = JSON.parse(itemStr);
      
      // Check if expired
      if (item.expire && item.expire < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch {
      return null;
    }
  }

  /**
   * Remove storage item
   * @param key Storage key
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all storage items
   */
  clear(): void {
    localStorage.clear();
  }
}

export const storage = new Storage(); 