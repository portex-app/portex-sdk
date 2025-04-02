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

/**
 * Copy text to clipboard
 * @param text Text to copy
 * @returns Promise that resolves when the text is copied
 */
async function copyText(text: string): Promise<void> {
  try {
    // 优先使用现代的 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // 后备方案：使用传统的 document.execCommand
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // 避免滚动到页面底部
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (err) {
      throw new Error('copy failed');
    }

    textArea.remove();
  } catch (err) {
    throw new Error('can not copy text');
  }
}

export const storage = new Storage();
export { copyText }; 