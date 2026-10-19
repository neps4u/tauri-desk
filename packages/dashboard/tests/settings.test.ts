import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_LOCALE,
  SETTINGS_STORAGE_KEY,
  settings,
  type DashboardSettings
} from '../src/lib/settings/settings.svelte';
import { MemoryAdapter, type StorageAdapter } from '../src/lib/settings/storage';
import { DEFAULT_THEME } from '../src/lib/theme/theme.svelte';

let teardown: (() => void) | undefined;

beforeEach(() => {
  settings.dispose();
  teardown = undefined;
  // the store is a module singleton — reset it so tests stay independent
  settings.theme = { ...DEFAULT_THEME };
  settings.locale = DEFAULT_LOCALE;
  settings.sidebarCollapsed = false;
  settings.status = 'idle';
});

afterEach(() => {
  teardown?.();
  settings.dispose();
});

describe('SettingsStore.bootstrap', () => {
  it('loads persisted settings and marks itself ready', async () => {
    const adapter = new MemoryAdapter();
    await adapter.set(SETTINGS_STORAGE_KEY, {
      theme: { mode: 'dark', accent: 'violet' },
      locale: 'fr',
      sidebarCollapsed: true
    });

    teardown = await settings.bootstrap({ adapter });

    expect(settings.status).toBe('ready');
    expect(settings.theme.mode).toBe('dark');
    expect(settings.theme.accent).toBe('violet');
    expect(settings.theme.radius).toBe(DEFAULT_THEME.radius);
    expect(settings.locale).toBe('fr');
    expect(settings.sidebarCollapsed).toBe(true);
  });

  it('calls onReady with the resolved snapshot', async () => {
    const onReady = vi.fn();
    teardown = await settings.bootstrap({ adapter: new MemoryAdapter(), onReady });

    expect(onReady).toHaveBeenCalledOnce();
    expect(onReady).toHaveBeenCalledWith(
      expect.objectContaining({ locale: DEFAULT_LOCALE, sidebarCollapsed: false })
    );
  });

  it('uses the locale option when nothing is persisted', async () => {
    teardown = await settings.bootstrap({ adapter: new MemoryAdapter(), locale: 'de' });
    expect(settings.locale).toBe('de');
  });

  it('reports an error when the adapter fails to read', async () => {
    const failing: StorageAdapter = {
      get: vi.fn().mockRejectedValue(new Error('boom')),
      set: vi.fn(),
      delete: vi.fn(),
      flush: vi.fn()
    };

    teardown = await settings.bootstrap({ adapter: failing });

    expect(settings.status).toBe('error');
  });
});

describe('SettingsStore mutations', () => {
  beforeEach(async () => {
    teardown = await settings.bootstrap({ adapter: new MemoryAdapter() });
  });

  it('normalizes theme updates', () => {
    settings.setTheme({ accent: 'emerald' });
    expect(settings.theme.accent).toBe('emerald');

    settings.setTheme({ mode: 'nonsense' as never });
    expect(settings.theme.mode).toBe(DEFAULT_THEME.mode);
  });

  it('toggles the sidebar and exposes a snapshot', () => {
    settings.toggleSidebar();
    expect(settings.sidebarCollapsed).toBe(true);

    settings.setSidebarCollapsed(false);
    expect(settings.snapshot).toEqual({
      theme: { ...settings.theme },
      locale: settings.locale,
      sidebarCollapsed: false
    });
  });

  it('resolves the effective colour mode', () => {
    settings.setTheme({ mode: 'dark' });
    expect(settings.resolvedMode).toBe('dark');

    settings.setTheme({ mode: 'light' });
    expect(settings.resolvedMode).toBe('light');
  });

  it('persists the current snapshot on save', async () => {
    const adapter = new MemoryAdapter();
    settings.dispose();
    teardown = await settings.bootstrap({ adapter });

    settings.setTheme({ accent: 'rose' });
    settings.setLocale('ja');
    await settings.save();

    const saved = await adapter.get<DashboardSettings>(SETTINGS_STORAGE_KEY);
    expect(saved?.theme.accent).toBe('rose');
    expect(saved?.locale).toBe('ja');
  });

  it('restores defaults on reset and persists them', async () => {
    const adapter = new MemoryAdapter();
    settings.dispose();
    teardown = await settings.bootstrap({ adapter });

    settings.setTheme({ accent: 'rose' });
    settings.setLocale('ja');
    await settings.reset();

    expect(settings.theme.accent).toBe(DEFAULT_THEME.accent);
    expect(settings.locale).toBe(DEFAULT_LOCALE);

    const saved = await adapter.get<DashboardSettings>(SETTINGS_STORAGE_KEY);
    expect(saved?.theme.accent).toBe(DEFAULT_THEME.accent);
    expect(saved?.locale).toBe(DEFAULT_LOCALE);
  });
});
