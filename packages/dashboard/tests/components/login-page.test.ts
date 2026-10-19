import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import LoginPage from '../../src/lib/features/auth/LoginPage.svelte';
import { auth, createDemoAuthProvider } from '../../src/lib/features/auth/auth.svelte';

describe('LoginPage', () => {
  it('renders the configured copy', () => {
    render(LoginPage, { props: { title: 'Welcome', subtitle: 'Please sign in' } });
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
    expect(screen.getByText('Please sign in')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('signs in via the configured provider', async () => {
    auth.configure(createDemoAuthProvider());
    const onSuccess = vi.fn();

    const { container } = render(LoginPage, { props: { onSuccess } });

    await fireEvent.input(screen.getByLabelText('Email'), {
      target: { value: 'ada@example.com' }
    });
    await fireEvent.input(screen.getByLabelText('Password'), {
      target: { value: 'secret' }
    });

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    await fireEvent.submit(form as HTMLFormElement);

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(auth.isAuthenticated).toBe(true);
  });
});
