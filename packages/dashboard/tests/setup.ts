import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;
}

if (!('IntersectionObserver' in globalThis)) {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    IntersectionObserverStub;
}

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  })) as unknown as typeof window.matchMedia;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// Svelte 5 $state rune support for jsdom test environment
// The Svelte plugin transforms $state() calls at build time,
// but we need to provide the runtime globals for tests that import
// Svelte components directly (like auth.test.ts)
declare global {
  interface Window {
    // Svelte 5 state mock - used when direct $state transform doesn't apply
    $state<T>(initialValue: T): {
      value: T;
      set: (newValue: T) => void;
    };
    $derived<T>(computed: T): T;
    $props<T>(props: T): T;
    $effect: () => void;
  }
}

// Helper for creating reactive state in tests that don't use the Svelte plugin transform
export function createReactiveState<T>(initialValue: T): {
  value: T;
  setValue: (newValue: T) => void;
} {
  let _value = initialValue;
  return {
    value: _value,
    setValue: (newValue: T) => {
      _value = newValue;
    }
  };
}
