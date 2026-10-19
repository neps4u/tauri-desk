import type { Component } from 'svelte';

export interface CommandItem {
  /** Stable unique id. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional grouping heading. */
  group?: string;
  /** Optional leading icon. */
  icon?: Component;
  /** Extra search terms. */
  keywords?: string[];
  /** Right-aligned hint, e.g. "⌘K". */
  shortcut?: string;
  /** Invoked on selection. */
  run: () => void | Promise<void>;
}
