import { isTauri } from '@tauri-apps/api/core';

export type Platform = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown';

export const platform = $state<{
  os: Platform;
  isTauri: boolean;
  isDesktop: boolean;
  isMac: boolean;
}>({
  os: 'unknown',
  isTauri: false,
  isDesktop: false,
  isMac: false
});

function detectWebOs(): Platform {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('win')) return 'windows';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}

function commit(os: Platform, tauri: boolean): void {
  platform.os = os;
  platform.isTauri = tauri;
  platform.isMac = os === 'macos';
  platform.isDesktop = os === 'windows' || os === 'macos' || os === 'linux';
  if (typeof document !== 'undefined') document.documentElement.dataset.platform = os;
}

/** Detect the runtime platform. Call once at startup. */
export async function initPlatform(): Promise<void> {
  const tauri = isTauri();
  if (!tauri) {
    commit(detectWebOs(), false);
    return;
  }
  try {
    const { platform: osPlatform } = await import('@tauri-apps/plugin-os');
    commit(osPlatform() as Platform, true);
  } catch {
    commit(detectWebOs(), true);
  }
}
