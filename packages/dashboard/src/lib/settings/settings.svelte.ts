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
  private ready = false;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private teardown: (() => void) | null = null;

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

    this.ready = true;
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

      // persist on change (debounced)
      if (this.ready) {
        $effect(() => {
          void this.snapshot;
          this.scheduleSave();
        });
      }
    });

    this.teardown = () => {
      stopSystem();
      stopEffects();
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
    if (!this.ready || !this.adapter) return;
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
