import { beforeEach, describe, expect, it, vi } from 'vitest';

const { isTauriMock, notificationMock } = vi.hoisted(() => ({
  isTauriMock: vi.fn(() => false),
  notificationMock: {
    isPermissionGranted: vi.fn(),
    requestPermission: vi.fn(),
    sendNotification: vi.fn()
  }
}));

vi.mock('@tauri-apps/api/core', () => ({ isTauri: isTauriMock }));
vi.mock('@tauri-apps/plugin-notification', () => notificationMock);

const { ensureNotificationPermission, notify } =
  await import('../src/lib/features/notifications/notifications');

beforeEach(() => {
  isTauriMock.mockReturnValue(false);
  notificationMock.isPermissionGranted.mockReset();
  notificationMock.requestPermission.mockReset();
  notificationMock.sendNotification.mockReset();
});

describe('notifications outside Tauri', () => {
  it('never grants permission', async () => {
    expect(await ensureNotificationPermission()).toBe(false);
    expect(notificationMock.isPermissionGranted).not.toHaveBeenCalled();
  });

  it('returns false from notify', async () => {
    expect(await notify({ title: 'Hello' })).toBe(false);
    expect(notificationMock.sendNotification).not.toHaveBeenCalled();
  });
});

describe('notifications inside Tauri', () => {
  beforeEach(() => {
    isTauriMock.mockReturnValue(true);
  });

  it('uses an already-granted permission', async () => {
    notificationMock.isPermissionGranted.mockResolvedValue(true);
    notificationMock.sendNotification.mockResolvedValue(undefined);

    expect(await notify({ title: 'Hi', body: 'there' })).toBe(true);
    expect(notificationMock.requestPermission).not.toHaveBeenCalled();
    expect(notificationMock.sendNotification).toHaveBeenCalledWith({
      title: 'Hi',
      body: 'there'
    });
  });

  it('requests permission when not yet granted', async () => {
    notificationMock.isPermissionGranted.mockResolvedValue(false);
    notificationMock.requestPermission.mockResolvedValue('granted');
    notificationMock.sendNotification.mockResolvedValue(undefined);

    expect(await notify({ title: 'Hi' })).toBe(true);
    expect(notificationMock.requestPermission).toHaveBeenCalledOnce();
  });

  it('stays silent when permission is denied', async () => {
    notificationMock.isPermissionGranted.mockResolvedValue(false);
    notificationMock.requestPermission.mockResolvedValue('denied');

    expect(await notify({ title: 'Hi' })).toBe(false);
    expect(notificationMock.sendNotification).not.toHaveBeenCalled();
  });

  it('swallows send failures', async () => {
    notificationMock.isPermissionGranted.mockResolvedValue(true);
    notificationMock.sendNotification.mockRejectedValue(new Error('nope'));

    expect(await notify({ title: 'Hi' })).toBe(false);
  });
});
