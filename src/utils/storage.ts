import { env } from '@/env';

type StorageTypeName = 'local' | 'session';

interface StorageValue<T> {
  value: T;
  expire?: number;
}

/**
 * Create a typed storage wrapper
 *
 * @param type The storage type
 * @param storagePrefix The key prefix
 */
export function createStorage<T extends object>(type: StorageTypeName, storagePrefix = '') {
  const storage = type === 'local' ? window.localStorage : window.sessionStorage;

  function getKey(key: keyof T & string) {
    return `${storagePrefix}${key}`;
  }

  function set<K extends keyof T & string>(key: K, value: T[K], expire?: Date) {
    const data: StorageValue<T[K]> = {
      value,
      ...(expire ? { expire: expire.getTime() } : {}),
    };

    try {
      storage.setItem(getKey(key), JSON.stringify(data));
    } catch (error) {
      console.error('Failed to write to storage:', error);
    }
  }

  function get<K extends keyof T & string>(key: K): T[K] | null {
    const raw = storage.getItem(getKey(key));

    if (!raw) {
      return null;
    }

    try {
      const data = JSON.parse(raw) as StorageValue<T[K]>;

      if (data.expire && Date.now() > data.expire) {
        remove(key);

        return null;
      }

      return data.value;
    } catch {
      return null;
    }
  }

  function remove<K extends keyof T & string>(key: K) {
    storage.removeItem(getKey(key));
  }

  function clear() {
    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));

    for (const key of keys) {
      if (key?.startsWith(storagePrefix)) {
        storage.removeItem(key);
      }
    }
  }

  return {
    set,
    get,
    remove,
    clear,
  };
}

export const localStg = createStorage<StorageType.Local>('local', env.storagePrefix);

export const sessionStg = createStorage<StorageType.Session>('session', env.storagePrefix);
