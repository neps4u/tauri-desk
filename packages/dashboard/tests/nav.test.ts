import { describe, expect, it } from 'vitest';
import { isActive } from '../src/lib/layout/nav';

describe('isActive', () => {
  it('matches the root only at the root', () => {
    expect(isActive('/', { href: '/' })).toBe(true);
    expect(isActive('/settings', { href: '/' })).toBe(false);
  });

  it('matches nested routes for a section href', () => {
    expect(isActive('/settings/appearance', { href: '/settings' })).toBe(true);
    expect(isActive('/settings', { href: '/settings' })).toBe(true);
    expect(isActive('/other', { href: '/settings' })).toBe(false);
  });

  it('respects the exact flag', () => {
    expect(isActive('/settings/general', { href: '/settings', exact: true })).toBe(false);
    expect(isActive('/settings', { href: '/settings', exact: true })).toBe(true);
  });

  it('handles a trailing slash in the href', () => {
    expect(isActive('/settings/appearance', { href: '/settings/' })).toBe(true);
  });

  it('does not match partial path segments', () => {
    expect(isActive('/settings-archive', { href: '/settings' })).toBe(false);
  });
});
