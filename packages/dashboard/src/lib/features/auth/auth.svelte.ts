export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  roles?: string[];
}

export interface AuthProvider {
  /** Restore an existing session on startup, or null if signed out. */
  restore(): Promise<AuthUser | null>;
  signIn(credentials: Record<string, string>): Promise<AuthUser>;
  signOut(): Promise<void>;
}

export type AuthStatus = 'idle' | 'restoring' | 'authenticating' | 'authenticated' | 'error';

class AuthStore {
  user = $state<AuthUser | null>(null);
  status = $state<AuthStatus>('idle');
  error = $state<string | null>(null);

  private provider: AuthProvider | null = null;

  get isAuthenticated(): boolean {
    return this.user !== null;
  }

  configure(provider: AuthProvider): void {
    this.provider = provider;
  }

  async restore(): Promise<void> {
    if (!this.provider) return;
    this.status = 'restoring';
    try {
      this.user = await this.provider.restore();
      this.status = this.user ? 'authenticated' : 'idle';
    } catch {
      this.user = null;
      this.status = 'idle';
    }
  }

  async signIn(credentials: Record<string, string>): Promise<boolean> {
    if (!this.provider) {
      this.error = 'No auth provider configured.';
      this.status = 'error';
      return false;
    }
    this.status = 'authenticating';
    this.error = null;
    try {
      this.user = await this.provider.signIn(credentials);
      this.status = 'authenticated';
      return true;
    } catch (err) {
      this.user = null;
      this.error = err instanceof Error ? err.message : String(err);
      this.status = 'error';
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.provider?.signOut();
    } finally {
      this.user = null;
      this.status = 'idle';
    }
  }
}

export const auth = new AuthStore();

/**
 * In-memory demo provider — replace with a real one per app. Accepts any
 * non-empty credentials so the scaffolded app is runnable out of the box.
 */
export function createDemoAuthProvider(): AuthProvider {
  let current: AuthUser | null = null;
  return {
    async restore() {
      return current;
    },
    async signIn(credentials) {
      const email = credentials.email ?? '';
      if (!email) throw new Error('Email is required.');
      current = {
        id: 'demo-user',
        name: email.split('@')[0] ?? 'User',
        email
      };
      return current;
    },
    async signOut() {
      current = null;
    }
  };
}
