import { isTauri } from '@tauri-apps/api/core';

/**
 * Minimal async key/value persistence contract. Implementations:
 *  - TauriStoreAdapter  (tauri-plugin-store, used inside the Tauri runtime)
 *  - LocalStorageAdapter (plain browser / `vite dev` in a browser tab)
 *  - MemoryAdapter       (fallback so the app never crashes)
 */
export interface StorageAdapter {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  flush(): Promise<void>;
}

export class MemoryAdapter implements StorageAdapter {
  private data = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined;
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }
  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }
  async flush(): Promise<void> {}
}

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly prefix = 'tauri-desk:') {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw ? (JSON.parse(raw) as T) : undefined;
    } catch {
      return undefined;
    }
  }
  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }
  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }
  async flush(): Promise<void> {}
}

export class TauriStoreAdapter implements StorageAdapter {
  private store: import('@tauri-apps/plugin-store').Store | null = null;

  constructor(private readonly file = 'settings.json') {}

  private async ensure() {
    if (!this.store) {
      const { load } = await import('@tauri-apps/plugin-store');
      this.store = await load(this.file, { autoSave: false });
    }
    return this.store;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const store = await this.ensure();
    const value = await store.get<T>(key);
    return value ?? undefined;
  }
  async set<T>(key: string, value: T): Promise<void> {
    const store = await this.ensure();
    await store.set(key, value);
  }
  async delete(key: string): Promise<void> {
    const store = await this.ensure();
    await store.delete(key);
  }
  async flush(): Promise<void> {
    if (this.store) await this.store.save();
  }
}

export function createStorageAdapter(file = 'settings.json'): StorageAdapter {
  if (isTauri()) return new TauriStoreAdapter(file);
  if (typeof localStorage !== 'undefined') return new LocalStorageAdapter();
  return new MemoryAdapter();
}
