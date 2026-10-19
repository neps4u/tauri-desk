import { beforeEach, describe, expect, it, vi } from 'vitest';

const { isTauriMock } = vi.hoisted(() => ({ isTauriMock: vi.fn(() => false) }));

vi.mock('@tauri-apps/api/core', () => ({ isTauri: isTauriMock }));

const { initPlatform, platform } = await import('../src/lib/platform.svelte');

beforeEach(() => {
  isTauriMock.mockReturnValue(false);
});

describe('initPlatform', () => {
  it('detects the web platform outside Tauri', async () => {
    await initPlatform();

    expect(platform.isTauri).toBe(false);
    expect(platform.isMac).toBe(platform.os === 'macos');
    expect(platform.isDesktop).toBe(['windows', 'macos', 'linux'].includes(platform.os));
    expect(document.documentElement.dataset.platform).toBe(platform.os);
  });

  it('marks the app as Tauri when the runtime is present', async () => {
    isTauriMock.mockReturnValue(true);
    await initPlatform();

    expect(platform.isTauri).toBe(true);
  });
});
