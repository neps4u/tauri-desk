import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_LOCALE,
  SETTINGS_STORAGE_KEY,
  settings,
  type DashboardSettings
} from '../src/lib/settings/settings.svelte';
import { MemoryAdapter, type StorageAdapter } from '../src/lib/settings/storage';
import { DEFAULT_THEME } from '../src/lib/theme/theme.svelte';

const closeCallbackHolder = vi.hoisted(() => ({ value: null as (() => void) | null }));

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: vi.fn(() => ({
    onCloseRequested: vi.fn(async (cb: () => void) => {
      closeCallbackHolder.value = cb;
      return vi.fn();
    })
  }))
}));

let teardown: (() => void) | undefined;

beforeEach(() => {
  settings.dispose();
  teardown = undefined;
  settings.theme = { ...DEFAULT_THEME };
  settings.locale = DEFAULT_LOCALE;
  settings.sidebarCollapsed = false;
  settings.status = 'idle';
  closeCallbackHolder.value = null;
});

afterEach(() => {
  teardown?.();
  settings.dispose();
});

describe('DATA-1: no write on launch / no overwrite after load failure', () => {
  it('does not persist defaults when nothing changed after bootstrap', async () => {
    const adapter = new MemoryAdapter();
    await adapter.set(SETTINGS_STORAGE_KEY, {
      theme: { mode: 'dark', accent: 'violet' },
      locale: 'fr',
      sidebarCollapsed: true
    });
    const setSpy = vi.spyOn(adapter, 'set');
    const flushSpy = vi.spyOn(adapter, 'flush');

    teardown = await settings.bootstrap({ adapter });

    // give the debounced auto-save effect a chance to fire
    await new Promise((r) => setTimeout(r, 400));

    expect(settings.status).toBe('ready');
    expect(settings.theme.mode).toBe('dark');
    expect(settings.locale).toBe('fr');
    expect(setSpy).not.toHaveBeenCalled();
    expect(flushSpy).not.toHaveBeenCalled();
  });

  it('does not overwrite defaults with defaults after a failed load', async () => {
    const failing: StorageAdapter = {
      get: vi.fn().mockRejectedValue(new Error('boom')),
      set: vi.fn(),
      delete: vi.fn(),
      flush: vi.fn()
    };
    const setSpy = vi.spyOn(failing, 'set');
    const flushSpy = vi.spyOn(failing, 'flush');

    teardown = await settings.bootstrap({ adapter: failing });

    expect(settings.status).toBe('error');
    await new Promise((r) => setTimeout(r, 400));
    expect(setSpy).not.toHaveBeenCalled();
    expect(flushSpy).not.toHaveBeenCalled();
  });

  it('persists when a setting actually changes', async () => {
    const adapter = new MemoryAdapter();
    teardown = await settings.bootstrap({ adapter });
    const setSpy = vi.spyOn(adapter, 'set');

    settings.setTheme({ accent: 'rose' });
    await new Promise((r) => setTimeout(r, 400));

    const saved = await adapter.get<DashboardSettings>(SETTINGS_STORAGE_KEY);
    expect(saved?.theme.accent).toBe('rose');
    expect(setSpy).toHaveBeenCalled();
  });

  it('resets to defaults and persists them', async () => {
    const adapter = new MemoryAdapter();
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

describe('DATA-2: flush pending save before the window disappears', () => {
  it('saves on window close requested (Tauri)', async () => {
    const adapter = new MemoryAdapter();
    teardown = await settings.bootstrap({ adapter });
    const setSpy = vi.spyOn(adapter, 'set');

    expect(closeCallbackHolder.value).toBeInstanceOf(Function);

    settings.setTheme({ accent: 'rose' });
    // close before the 350 ms debounce fires
    await closeCallbackHolder.value!();

    const saved = await adapter.get<DashboardSettings>(SETTINGS_STORAGE_KEY);
    expect(saved?.theme.accent).toBe('rose');
    expect(setSpy).toHaveBeenCalled();
  });

  it('saves on visibilitychange hidden (browser)', async () => {
    const adapter = new MemoryAdapter();
    teardown = await settings.bootstrap({ adapter });
    const setSpy = vi.spyOn(adapter, 'set');

    settings.setTheme({ accent: 'rose' });

    // simulate the tab going to the background
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true
    });
    document.dispatchEvent(new Event('visibilitychange'));

    await new Promise((r) => setTimeout(r, 100));

    const saved = await adapter.get<DashboardSettings>(SETTINGS_STORAGE_KEY);
    expect(saved?.theme.accent).toBe('rose');
    expect(setSpy).toHaveBeenCalled();
  });
});
