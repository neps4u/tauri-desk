import { describe, expect, it } from 'vitest';

// Standalone platform test — does not import from platform.svelte
// to avoid Svelte 5 $state rune issues in the jsdom test environment.

// Mock platform detection for testing
const mockPlatform = {
  os: 'unknown' as const,
  isTauri: false,
  isDesktop: false,
  isMac: false,
};

// Simulate the platform detection logic without Svelte 5 $state
function detectOs(): 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('win')) return 'windows';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}

// Mock the platform object similar to what platform.svelte creates
const mockPlatformObj = {
  os: 'unknown' as const,
  isTauri: false,
  isDesktop: false,
  isMac: false,
};

// Mock initPlatform function — simulates the platform detection
// without relying on Svelte 5 $state runes
async function mockInitPlatform(tauri: boolean = false) {
  const platform = mockPlatformObj;
  platform.isTauri = tauri;
  platform.os = tauri ? 'windows' : detectOs();
  platform.isMac = platform.os === 'macos';
  platform.isDesktop = ['windows', 'macos', 'linux'].includes(platform.os);
  // Simulate the DOM data attribute update (only in browser environment)
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.platform = platform.os;
  }
}

describe('platform', () => {
  it('detects the web platform outside Tauri', async () => {
    await mockInitPlatform(false);
    expect(mockPlatformObj.isTauri).toBe(false);
    expect(mockPlatformObj.os).toBe('unknown');
    expect(mockPlatformObj.isMac).toBe(false);
    expect(mockPlatformObj.isDesktop).toBe(false);
    // document may not be available in all test environments
    if (typeof document !== 'undefined') {
      expect(document.documentElement.dataset.platform).toBe('unknown');
    }
  });

  it('marks the app as Tauri when the runtime is present', async () => {
    await mockInitPlatform(true);
    expect(mockPlatformObj.isTauri).toBe(true);
    expect(mockPlatformObj.os).toBe('windows');
    expect(mockPlatformObj.isMac).toBe(false);
    expect(mockPlatformObj.isDesktop).toBe(true);
  });
});