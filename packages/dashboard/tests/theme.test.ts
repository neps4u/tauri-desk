import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_THEME,
  applyTheme,
  isBrowser,
  normalizeTheme,
  resolveMode,
  startSystemThemeListener,
  systemTheme,
  type ThemeConfig
} from '../src/lib/theme/theme.svelte';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  systemTheme.prefersDark = false;
  document.documentElement.className = '';
  document.documentElement.removeAttribute('data-accent');
  document.documentElement.removeAttribute('data-radius');
  document.documentElement.removeAttribute('data-density');
  document.documentElement.removeAttribute('data-font');
  document.documentElement.style.colorScheme = '';
});

describe('resolveMode', () => {
  it('resolves an explicit mode regardless of system preference', () => {
    expect(resolveMode('light', true)).toBe('light');
    expect(resolveMode('dark', false)).toBe('dark');
  });

  it('follows the system preference for "system"', () => {
    expect(resolveMode('system', true)).toBe('dark');
    expect(resolveMode('system', false)).toBe('light');
  });
});

describe('normalizeTheme', () => {
  it('returns defaults with no input', () => {
    expect(normalizeTheme()).toEqual(DEFAULT_THEME);
    expect(normalizeTheme(null)).toEqual(DEFAULT_THEME);
  });

  it('merges a valid partial over the defaults', () => {
    expect(normalizeTheme({ mode: 'dark', accent: 'violet' })).toEqual({
      ...DEFAULT_THEME,
      mode: 'dark',
      accent: 'violet'
    });
  });

  it('replaces invalid values with defaults', () => {
    const invalid = { mode: 'neon', accent: 'pink', radius: 'xl', density: 'airy', font: 'comic' };
    expect(normalizeTheme(invalid as unknown as Partial<ThemeConfig>)).toEqual(DEFAULT_THEME);
  });
});

describe('applyTheme', () => {
  it('is a no-op when no DOM is available', () => {
    expect(isBrowser()).toBe(true);
  });

  it('reflects the resolved theme on <html>', () => {
    applyTheme({ ...DEFAULT_THEME, mode: 'dark', accent: 'emerald' }, false);
    const root = document.documentElement;
    expect(root.classList.contains('dark')).toBe(true);
    expect(root.dataset.accent).toBe('emerald');
    expect(root.dataset.radius).toBe(DEFAULT_THEME.radius);
    expect(root.dataset.density).toBe(DEFAULT_THEME.density);
    expect(root.dataset.font).toBe(DEFAULT_THEME.font);
    expect(root.style.colorScheme).toBe('dark');
  });

  it('honours the system preference when mode is "system"', () => {
    applyTheme({ ...DEFAULT_THEME, mode: 'system' }, true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    applyTheme({ ...DEFAULT_THEME, mode: 'system' }, false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });
});

describe('startSystemThemeListener', () => {
  it('returns a teardown when matchMedia is unavailable', () => {
    // @ts-expect-error - simulate an environment without matchMedia
    delete window.matchMedia;
    const stop = startSystemThemeListener();
    expect(typeof stop).toBe('function');
    expect(systemTheme.prefersDark).toBe(false);
  });

  it('tracks media-query changes and unhooks on teardown', () => {
    let handler: ((event: { matches: boolean }) => void) | undefined;
    const remove = vi.fn();
    window.matchMedia = vi.fn(() => ({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: (_type: string, cb: (event: { matches: boolean }) => void) => {
        handler = cb;
      },
      removeEventListener: remove,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    })) as unknown as typeof window.matchMedia;

    const stop = startSystemThemeListener();
    expect(systemTheme.prefersDark).toBe(true);

    handler?.({ matches: false });
    expect(systemTheme.prefersDark).toBe(false);

    stop();
    expect(remove).toHaveBeenCalledOnce();
  });
});
