export type Messages = Record<string, string>;

/**
 * Built-in English strings used by the dashboard chrome. Apps can override or
 * add locales with `i18n.register(locale, messages)`.
 */
export const DEFAULT_MESSAGES: Messages = {
  'app.commandPalette': 'Command palette',
  'app.search': 'Search…',
  'app.noResults': 'No results found.',
  'app.settings': 'Settings',
  'app.general': 'General',
  'app.appearance': 'Appearance',
  'app.about': 'About',
  'app.signIn': 'Sign in',
  'app.signOut': 'Sign out',
  'app.collapseSidebar': 'Collapse sidebar',
  'app.expandSidebar': 'Expand sidebar',
  'app.theme': 'Theme',
  'app.language': 'Language',
  'app.reset': 'Reset to defaults',
  'app.restart': 'Restart',
  'app.retry': 'Retry',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System',
  'appearance.description': 'Customize how the application looks.',
  'appearance.accent': 'Accent color',
  'appearance.radius': 'Corner radius',
  'appearance.density': 'Density',
  'appearance.font': 'Font',
  'radius.none': 'None',
  'radius.sm': 'Small',
  'radius.md': 'Medium',
  'radius.lg': 'Large',
  'density.compact': 'Compact',
  'density.cozy': 'Cozy',
  'density.comfortable': 'Comfortable',
  'font.sans': 'Sans-serif',
  'font.serif': 'Serif',
  'font.mono': 'Monospace',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.signInTitle': 'Welcome back',
  'auth.signInSubtitle': 'Sign in to continue',
  'auth.signingIn': 'Signing in…',
  'auth.invalidCredentials': 'Invalid email or password.',
  'updates.title': 'Updates',
  'updates.description': 'Check for and install application updates.',
  'updates.check': 'Check for updates',
  'updates.checking': 'Checking…',
  'updates.available': 'Version {version} is available.',
  'updates.upToDate': 'You are on the latest version.',
  'updates.install': 'Download & install',
  'updates.downloading': 'Downloading… {progress}%',
  'updates.ready': 'Update installed. Restart to apply.',
  'updates.error': 'Update failed: {message}',
  'about.version': 'Version',
  'about.description': 'About'
};

class I18n {
  locale = $state('en');
  fallback = $state('en');
  catalogs = $state<Record<string, Messages>>({ en: { ...DEFAULT_MESSAGES } });

  register(locale: string, messages: Messages): void {
    this.catalogs = {
      ...this.catalogs,
      [locale]: { ...(this.catalogs[locale] ?? {}), ...messages }
    };
  }

  extend(messages: Messages, locale: string = this.locale): void {
    this.register(locale, messages);
  }

  has(locale: string): boolean {
    return locale in this.catalogs;
  }

  setLocale(locale: string): void {
    this.locale = locale;
  }

  t(key: string, vars?: Record<string, string | number>): string {
    const message = this.catalogs[this.locale]?.[key] ?? this.catalogs[this.fallback]?.[key] ?? key;
    if (!vars) return message;
    return message.replace(/\{(\w+)\}/g, (_, name: string) =>
      name in vars ? String(vars[name]) : `{${name}}`
    );
  }
}

export const i18n = new I18n();

/** Reactive translate helper: `t('app.settings')`. */
export function t(key: string, vars?: Record<string, string | number>): string {
  return i18n.t(key, vars);
}
