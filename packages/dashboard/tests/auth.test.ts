import { describe, expect, it } from 'vitest';
import { auth, createDemoAuthProvider } from '../src/lib/features/auth/auth.svelte';

// NOTE: the "no provider" case must run first — `auth` is a module singleton and
// once a provider is configured it cannot be unconfigured.
describe('auth store without a provider', () => {
  it('fails sign-in with a helpful error', async () => {
    const ok = await auth.signIn({ email: 'a@b.com', password: 'x' });
    expect(ok).toBe(false);
    expect(auth.status).toBe('error');
    expect(auth.error).toBe('No auth provider configured.');
  });
});

describe('createDemoAuthProvider', () => {
  it('signs in with an email and restores the session', async () => {
    const provider = createDemoAuthProvider();
    expect(await provider.restore()).toBeNull();

    const user = await provider.signIn({ email: 'ada@example.com' });
    expect(user).toMatchObject({ id: 'demo-user', name: 'ada', email: 'ada@example.com' });
    expect(await provider.restore()).toEqual(user);

    await provider.signOut();
    expect(await provider.restore()).toBeNull();
  });

  it('rejects when the email is missing', async () => {
    const provider = createDemoAuthProvider();
    await expect(provider.signIn({})).rejects.toThrow('Email is required.');
  });
});

describe('auth store with a provider', () => {
  it('authenticates and signs out', async () => {
    auth.configure(createDemoAuthProvider());

    expect(await auth.signIn({ email: 'grace@example.com' })).toBe(true);
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.status).toBe('authenticated');
    expect(auth.user?.email).toBe('grace@example.com');

    await auth.signOut();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.status).toBe('idle');
  });

  it('captures provider errors', async () => {
    auth.configure({
      restore: async () => null,
      signIn: async () => {
        throw new Error('Invalid credentials');
      },
      signOut: async () => {}
    });

    expect(await auth.signIn({ email: 'x@y.com' })).toBe(false);
    expect(auth.status).toBe('error');
    expect(auth.error).toBe('Invalid credentials');
  });

  it('restores an existing session', async () => {
    auth.configure({
      restore: async () => ({ id: '1', name: 'Restored' }),
      signIn: async () => ({ id: '1', name: 'Restored' }),
      signOut: async () => {}
    });

    await auth.restore();
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.user?.name).toBe('Restored');
  });
});
