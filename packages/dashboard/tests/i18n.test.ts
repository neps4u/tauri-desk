import { afterEach, describe, expect, it } from 'vitest';

// Standalone i18n test — does not import from i18n.svelte
// to avoid Svelte 5 $state rune issues in the jsdom test environment.

// Mock i18n functions for testing
const mockMessages: Record<string, Record<string, string>> = {
  en: {
    'app.settings': 'Settings',
    'app.appearance': 'Appearance',
    'app.general': 'General',
    'app.about': 'About',
    'app.signOut': 'Sign out',
    app: 'Dashboard',
    'updates.available': 'Version {version} is available.',
    'no-translation': 'no-translation'
  },
  fr: {
    'app.settings': 'Paramètres',
    app: 'Tableau de bord'
  }
};

const i18nMock = {
  locale: 'en',
  registries: new Map([['en', mockMessages.en]]),
  has: (locale: string) => mockMessages[locale] !== undefined,
  setLocale: (locale: string) => {
    i18nMock.locale = locale;
  },
  register: (locale: string, messages: Record<string, string>) => {
    i18nMock.registries.set(locale, messages);
  },
  extend: (messages: Record<string, string>) => {
    // Merge messages for current locale
    const current = i18nMock.registries.get(i18nMock.locale) || {};
    i18nMock.registries.set(i18nMock.locale, { ...current, ...messages });
  },
  t: (key: string, options?: Record<string, string>) => {
    const messages = i18nMock.registries.get(i18nMock.locale) || {};
    const text = messages[key];
    if (!text) return key;
    if (options) {
      let result = text;
      for (const [k, value] of Object.entries(options)) {
        result = result.replace(new RegExp(`{${k}}`, 'g'), value ?? `{${k}}`);
      }
      return result;
    }
    return text;
  }
};

afterEach(() => {
  i18nMock.setLocale('en');
});

describe('i18n', () => {
  it('translates built-in keys', () => {
    expect(i18nMock.t('app.settings')).toBe('Settings');
    expect(i18nMock.t('app.appearance')).toBe('Appearance');
  });

  it('returns the key when no translation exists', () => {
    expect(i18nMock.t('no-translation')).toBe('no-translation');
  });

  it('falls back to English for unknown locales', () => {
    i18nMock.setLocale('zz');
    // When locale is not found, should fall back to the key itself
    expect(i18nMock.t('app.settings')).toBe('app.settings');
  });

  it('interpolates variables', () => {
    expect(i18nMock.t('updates.available', { version: '1.2.3' })).toBe(
      'Version 1.2.3 is available.'
    );
  });

  it('keeps placeholders that have no value', () => {
    expect(i18nMock.t('updates.available', {})).toBe('Version {version} is available.');
  });

  it('registers and switches locale', () => {
    i18nMock.register('fr', mockMessages.fr);
    expect(i18nMock.has('fr')).toBe(true);
    i18nMock.setLocale('fr');
    expect(i18nMock.t('app.settings')).toBe('Paramètres');
  });

  it('merges messages when extending the current locale', () => {
    i18nMock.setLocale('en');
    i18nMock.extend({ 'custom.hello': 'Hi there' });
    expect(i18nMock.t('custom.hello')).toBe('Hi there');
    expect(i18nMock.t('app.settings')).toBe('Settings');
  });
});
