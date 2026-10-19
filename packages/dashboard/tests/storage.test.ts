import { beforeEach, describe, expect, it } from 'vitest';
import {
  LocalStorageAdapter,
  MemoryAdapter,
  createStorageAdapter
} from '../src/lib/settings/storage';

beforeEach(() => {
  localStorage.clear();
});

describe('MemoryAdapter', () => {
  it('stores, reads and deletes values', async () => {
    const adapter = new MemoryAdapter();
    expect(await adapter.get('missing')).toBeUndefined();

    await adapter.set('count', 3);
    expect(await adapter.get<number>('count')).toBe(3);

    await adapter.delete('count');
    expect(await adapter.get('count')).toBeUndefined();

    await expect(adapter.flush()).resolves.toBeUndefined();
  });

  it('keeps values isolated per key', async () => {
    const adapter = new MemoryAdapter();
    await adapter.set('a', { x: 1 });
    await adapter.set('b', { x: 2 });
    expect(await adapter.get('a')).toEqual({ x: 1 });
    expect(await adapter.get('b')).toEqual({ x: 2 });
  });
});

describe('LocalStorageAdapter', () => {
  it('round-trips JSON under a namespaced key', async () => {
    const adapter = new LocalStorageAdapter();
    await adapter.set('theme', { mode: 'dark' });

    expect(localStorage.getItem('tauri-desk:theme')).toBe('{"mode":"dark"}');
    expect(await adapter.get('theme')).toEqual({ mode: 'dark' });

    await adapter.delete('theme');
    expect(await adapter.get('theme')).toBeUndefined();
  });

  it('honours a custom prefix', async () => {
    const adapter = new LocalStorageAdapter('acme:');
    await adapter.set('x', 1);
    expect(localStorage.getItem('acme:x')).toBe('1');
  });

  it('returns undefined for corrupt JSON instead of throwing', async () => {
    localStorage.setItem('tauri-desk:broken', '{not json');
    const adapter = new LocalStorageAdapter();
    expect(await adapter.get('broken')).toBeUndefined();
  });
});

describe('createStorageAdapter', () => {
  it('uses localStorage in a browser environment', () => {
    expect(createStorageAdapter()).toBeInstanceOf(LocalStorageAdapter);
  });
});
