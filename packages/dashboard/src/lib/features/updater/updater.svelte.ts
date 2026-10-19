import { isTauri } from '@tauri-apps/api/core';

export type UpdateStatus =
  'idle' | 'checking' | 'up-to-date' | 'available' | 'downloading' | 'ready' | 'error';

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

class UpdaterStore {
  status = $state<UpdateStatus>('idle');
  version = $state<string | null>(null);
  notes = $state<string | null>(null);
  progress = $state(0);
  error = $state<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private update: any = null;

  get isAvailable(): boolean {
    return this.status === 'available' || this.status === 'ready';
  }

  async check(): Promise<boolean> {
    if (!isTauri()) {
      this.status = 'error';
      this.error = 'Updates are only available in the desktop build.';
      return false;
    }
    this.status = 'checking';
    this.error = null;
    this.progress = 0;
    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();
      if (!update) {
        this.update = null;
        this.status = 'up-to-date';
        return false;
      }
      this.update = update;
      this.version = update.version;
      this.notes = update.body ?? null;
      this.status = 'available';
      return true;
    } catch (error) {
      this.status = 'error';
      this.error = messageFrom(error);
      return false;
    }
  }

  async install(): Promise<void> {
    if (!this.update) return;
    this.status = 'downloading';
    this.progress = 0;
    try {
      let total = 0;
      let downloaded = 0;
      await this.update.downloadAndInstall(
        (event: {
          event: 'Started' | 'Progress' | 'Finished';
          data?: { contentLength?: number; chunkLength?: number };
        }) => {
          if (event.event === 'Started') total = event.data?.contentLength ?? 0;
          if (event.event === 'Progress') {
            downloaded += event.data?.chunkLength ?? 0;
            this.progress = total > 0 ? Math.round((downloaded / total) * 100) : 0;
          }
          if (event.event === 'Finished') this.progress = 100;
        }
      );
      this.status = 'ready';
    } catch (error) {
      this.status = 'error';
      this.error = messageFrom(error);
    }
  }

  async restart(): Promise<void> {
    try {
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    } catch {
      /* ignore */
    }
  }
}

export const updater = new UpdaterStore();
