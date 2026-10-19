/**
 * Theme engine — pure helpers + shared reactive system-preference state.
 *
 * The reactive source of truth lives in the settings store (settings.svelte.ts);
 * this module owns the vocabulary (types/constants) and the DOM side effects.
 */

export const THEME_MODES = ['light', 'dark', 'system'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const ACCENTS = ['neutral', 'blue', 'violet', 'emerald', 'rose', 'amber', 'orange'] as const;
export type Accent = (typeof ACCENTS)[number];

export const RADII = ['none', 'sm', 'md', 'lg'] as const;
export type Radius = (typeof RADII)[number];

export const DENSITIES = ['compact', 'cozy', 'comfortable'] as const;
export type Density = (typeof DENSITIES)[number];

export const FONTS = ['sans', 'serif', 'mono'] as const;
export type FontFamily = (typeof FONTS)[number];

export interface ThemeConfig {
  mode: ThemeMode;
  accent: Accent;
  radius: Radius;
  density: Density;
  font: FontFamily;
}

export const DEFAULT_THEME: ThemeConfig = {
  mode: 'system',
  accent: 'neutral',
  radius: 'md',
  density: 'cozy',
  font: 'sans'
};

export const ACCENT_LABELS: Record<Accent, string> = {
  neutral: 'Neutral',
  blue: 'Blue',
  violet: 'Violet',
  emerald: 'Emerald',
  rose: 'Rose',
  amber: 'Amber',
  orange: 'Orange'
};

export const ACCENT_SWATCHES: Record<Accent, string> = {
  neutral: 'oklch(0.556 0 0)',
  blue: 'oklch(0.546 0.215 262.88)',
  violet: 'oklch(0.541 0.281 293.009)',
  emerald: 'oklch(0.596 0.145 163.225)',
  rose: 'oklch(0.586 0.253 17.585)',
  amber: 'oklch(0.666 0.179 58.318)',
  orange: 'oklch(0.646 0.222 41.116)'
};

export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function resolveMode(mode: ThemeMode, prefersDark: boolean): 'light' | 'dark' {
  return mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
}

export function normalizeTheme(partial?: Partial<ThemeConfig> | null): ThemeConfig {
  const p = partial ?? {};
  return {
    mode: THEME_MODES.includes(p.mode as ThemeMode) ? (p.mode as ThemeMode) : DEFAULT_THEME.mode,
    accent: ACCENTS.includes(p.accent as Accent) ? (p.accent as Accent) : DEFAULT_THEME.accent,
    radius: RADII.includes(p.radius as Radius) ? (p.radius as Radius) : DEFAULT_THEME.radius,
    density: DENSITIES.includes(p.density as Density)
      ? (p.density as Density)
      : DEFAULT_THEME.density,
    font: FONTS.includes(p.font as FontFamily) ? (p.font as FontFamily) : DEFAULT_THEME.font
  };
}

/** Reflect a theme config onto <html>. Safe/no-op during SSR. */
export function applyTheme(config: ThemeConfig, prefersDark: boolean): void {
  if (!isBrowser()) return;
  const root = document.documentElement;
  const resolved = resolveMode(config.mode, prefersDark);
  root.classList.toggle('dark', resolved === 'dark');
  root.dataset.accent = config.accent;
  root.dataset.radius = config.radius;
  root.dataset.density = config.density;
  root.dataset.font = config.font;
  root.style.colorScheme = resolved;
}

/** Shared reactive system-preference flag. */
export const systemTheme = $state({ prefersDark: false });

/** Start listening to the OS colour-scheme. Returns a teardown function. */
export function startSystemThemeListener(): () => void {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return () => {};
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  systemTheme.prefersDark = mql.matches;
  const onChange = (event: MediaQueryListEvent) => {
    systemTheme.prefersDark = event.matches;
  };
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}
