import type { Component } from 'svelte';

export interface NavItem {
  /** Display label (localized string). */
  label: string;
  /** Route href, e.g. `/settings` or `/`. */
  href: string;
  /** Optional icon component (e.g. a lucide-svelte icon). */
  icon?: Component;
  /** Optional badge text/number. */
  badge?: string | number;
  /** Match only the exact path (by default children paths are also active). */
  exact?: boolean;
  /** Hide when the sidebar is collapsed. */
  hideWhenCollapsed?: boolean;
}

export interface NavSection {
  /** Optional section heading. */
  title?: string;
  items: NavItem[];
}

export type NavConfig = NavSection[];

export interface Crumb {
  label: string;
  href?: string;
}

export function isActive(current: string, item: Pick<NavItem, 'href' | 'exact'>): boolean {
  const href = item.href;
  if (item.exact || href === '/') return current === href;
  return current === href || current.startsWith(href.endsWith('/') ? href : href + '/');
}
