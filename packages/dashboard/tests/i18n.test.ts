import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_MESSAGES, i18n, t } from '../src/lib/features/i18n/i18n.svelte';

afterEach(() => {
  i18n.setLocale('en');
});

describe('i18n', () => {
  it('translates built-in keys', () => {
    expect(t('app.settings')).toBe('Settings');
    expect(i18n.t('app.appearance')).toBe('Appearance');
  });

  it('returns the key when no translation exists', () => {
    expect(t('nope.missing')).toBe('nope.missing');
  });

  it('falls back to English for unknown locales', () => {
    i18n.setLocale('zz');
    expect(t('app.settings')).toBe(DEFAULT_MESSAGES['app.settings']);
  });

  it('interpolates variables', () => {
    expect(t('updates.available', { version: '1.2.3' })).toBe('Version 1.2.3 is available.');
  });

  it('keeps placeholders that have no value', () => {
    expect(t('updates.available', {})).toBe('Version {version} is available.');
  });

  it('registers and switches locale', () => {
    i18n.register('fr', { 'app.settings': 'Paramètres' });
    expect(i18n.has('fr')).toBe(true);

    i18n.setLocale('fr');
    expect(t('app.settings')).toBe('Paramètres');
  });

  it('merges messages when extending the current locale', () => {
    i18n.setLocale('en');
    i18n.extend({ 'custom.hello': 'Hi there' });
    expect(t('custom.hello')).toBe('Hi there');
    expect(t('app.settings')).toBe('Settings');
  });
});
