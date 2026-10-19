import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import CommandPalette from '../../src/lib/features/command/CommandPalette.svelte';
import type { CommandItem } from '../../src/lib/features/command/command';

function makeItems(): CommandItem[] {
  return [
    { id: 'go-dashboard', label: 'Dashboard', group: 'Navigation', run: vi.fn() },
    { id: 'go-settings', label: 'Settings', group: 'Navigation', run: vi.fn() },
    { id: 'sign-out', label: 'Sign out', group: 'Account', keywords: ['logout'], run: vi.fn() }
  ];
}

describe('CommandPalette', () => {
  it('lists commands when open', async () => {
    render(CommandPalette, { props: { open: true, items: makeItems() } });
    await tick();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('filters by label and keywords', async () => {
    render(CommandPalette, { props: { open: true, items: makeItems() } });
    await tick();

    await fireEvent.input(screen.getByPlaceholderText('Search…'), { target: { value: 'logout' } });

    expect(screen.getByText('Sign out')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('shows an empty state when nothing matches', async () => {
    render(CommandPalette, { props: { open: true, items: makeItems() } });
    await tick();

    await fireEvent.input(screen.getByPlaceholderText('Search…'), {
      target: { value: 'zzzzz' }
    });

    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('runs the selected command', async () => {
    const items = makeItems();
    render(CommandPalette, { props: { open: true, items } });
    await tick();

    screen.getByText('Dashboard').click();
    expect(items[0].run).toHaveBeenCalledOnce();
  });
});
