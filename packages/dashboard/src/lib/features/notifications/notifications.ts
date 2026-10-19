import { isTauri } from '@tauri-apps/api/core';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification
} from '@tauri-apps/plugin-notification';

export interface NotifyOptions {
  title: string;
  body?: string;
}

/** Ensure the OS has granted notification permission (no-op outside Tauri). */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!isTauri()) return false;
  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      const permission = await requestPermission();
      granted = permission === 'granted';
    }
    return granted;
  } catch {
    return false;
  }
}

/** Send a native OS notification. Returns false when unsupported/denied. */
export async function notify({ title, body }: NotifyOptions): Promise<boolean> {
  const granted = await ensureNotificationPermission();
  if (!granted) return false;
  try {
    await sendNotification({ title, body });
    return true;
  } catch {
    return false;
  }
}
