import {
  DEFAULT_THEME,
  applyTheme,
  normalizeTheme,
  resolveMode,
  startSystemThemeListener,
  systemTheme,
  type ThemeConfig
} from '../theme/theme.svelte';
import { createStorageAdapter, type StorageAdapter } from './storage';


export interface DashboardSettings {
  theme: ThemeConfig;
  locale: string;
  sidebarCollapsed: boolean;
}

export const DEFAULT_LOCALE = 'en';
export const SETTINGS_STORAGE_KEY = 'settings';

function defaultSettings(): DashboardSettings {
  return {
    theme: { ...DEFAULT_THEME },
    locale: DEFAULT_LOCALE,
    sidebarCollapsed: false
  };
}

export interface BootstrapOptions {
  /** Override the persistence backend (defaults to auto-detected). */
  adapter?: StorageAdapter;
  /** Default locale when nothing is persisted. */
  locale?: string;
  /** Called after settings are loaded — good place to wire i18n. */
  onReady?: (settings: Readonly<DashboardSettings>) => void;
}

class SettingsStore {
  theme = $state<ThemeConfig>({ ...DEFAULT_THEME });
  locale = $state<string>(DEFAULT_LOCALE);
  sidebarCollapsed = $state<boolean>(false);

  status = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');

  private adapter: StorageAdapter | null = null;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private teardown: (() => void) | null = null;
  /** JSON of the last snapshot we successfully persisted; avoids rewriting unchanged data. */
  private lastSaved = '';

  get resolvedMode(): 'light' | 'dark' {
    return resolveMode(this.theme.mode, systemTheme.prefersDark);
  }

  get snapshot(): DashboardSettings {
    return {
      theme: { ...this.theme },
      locale: this.locale,
      sidebarCollapsed: this.sidebarCollapsed
    };
  }

  /** Load persisted settings, apply the theme and begin persisting changes. */
  async bootstrap(options: BootstrapOptions = {}): Promise<() => void> {
    this.adapter = options.adapter ?? createStorageAdapter();
    this.status = 'loading';

    try {
      const saved = await this.adapter.get<Partial<DashboardSettings>>(SETTINGS_STORAGE_KEY);
      if (saved) {
        this.theme = normalizeTheme(saved.theme);
        if (typeof saved.locale === 'string' && saved.locale) this.locale = saved.locale;
        if (typeof saved.sidebarCollapsed === 'boolean')
          this.sidebarCollapsed = saved.sidebarCollapsed;
      } else if (options.locale) {
        this.locale = options.locale;
      }
      this.status = 'ready';
    } catch {
      this.status = 'error';
    }

    // Remember what was persisted so we never write defaults on error or on launch.
    this.lastSaved = JSON.stringify(this.snapshot);
    options.onReady?.(this.snapshot);

    const stopSystem = startSystemThemeListener();

    const stopEffects = $effect.root(() => {
      // keep <html> in sync with theme + OS preference
      $effect(() => {
        applyTheme(this.theme, systemTheme.prefersDark);
        // lightweight mirror for pre-paint theme application in index.html
        try {
          localStorage.setItem('tauri-desk:theme', JSON.stringify(this.theme));
        } catch {
          /* ignore */
        }
      });

      // persist on change (debounced) — only when the snapshot actually differs
      $effect(() => {
        void this.snapshot;
        const next = JSON.stringify(this.snapshot);
        if (next !== this.lastSaved) this.scheduleSave();
      });
    });

    // flush any pending save before the window disappears
    const closeUnlisteners: (() => void)[] = [];
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Browser: save when the tab goes to the background
      const onHide = () => void this.save();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') onHide();
      });
      closeUnlisteners.push(() => document.removeEventListener('visibilitychange', onHide));
    }
    // Tauri: save when the window is closing
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      const unlisten = await win.onCloseRequested(async () => {
        await this.save();
      });
      closeUnlisteners.push(unlisten);
    } catch {
      /* not running in Tauri, or the window API is unavailable */
    }

    this.teardown = () => {
      stopSystem();
      stopEffects();
      for (const unlisten of closeUnlisteners) unlisten();
      if (this.saveTimer) clearTimeout(this.saveTimer);
    };

    return this.teardown;
  }

  setTheme(partial: Partial<ThemeConfig>): void {
    this.theme = normalizeTheme({ ...this.theme, ...partial });
  }

  setLocale(locale: string): void {
    this.locale = locale;
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  async reset(): Promise<void> {
    const { theme, locale, sidebarCollapsed } = defaultSettings();
    this.theme = theme;
    this.locale = locale;
    this.sidebarCollapsed = sidebarCollapsed;
    await this.save();
  }

  private scheduleSave(): void {
    if (!this.adapter) return;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => void this.save(), 350);
  }

  async save(): Promise<void> {
    if (!this.adapter) return;
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    try {
      await this.adapter.set(SETTINGS_STORAGE_KEY, this.snapshot);
      await this.adapter.flush();
      this.lastSaved = JSON.stringify(this.snapshot);
    } catch {
      this.status = 'error';
    }
  }

  dispose(): void {
    this.teardown?.();
    this.teardown = null;
  }
}

export const settings = new SettingsStore();
