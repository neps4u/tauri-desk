import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import Button from '../../src/lib/components/Button.svelte';

const label = (text: string) => createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

describe('Button', () => {
  it('renders its children', () => {
    render(Button, { props: { children: label('Save') } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('applies variant and size classes', () => {
    render(Button, {
      props: { variant: 'destructive', size: 'lg', children: label('Delete') }
    });
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button.className).toContain('bg-destructive');
    expect(button.className).toContain('h-10');
  });

  it('defaults to type="button" and merges custom classes', () => {
    render(Button, { props: { class: 'my-custom', children: label('OK') } });
    const button = screen.getByRole('button', { name: 'OK' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button.className).toContain('my-custom');
  });

  it('can be disabled and reports clicks', async () => {
    const onclick = vi.fn();
    const { rerender } = render(Button, {
      props: { onclick, children: label('Go') }
    });

    screen.getByRole('button', { name: 'Go' }).click();
    expect(onclick).toHaveBeenCalledOnce();

    await rerender({ disabled: true, onclick, children: label('Go') });
    expect(screen.getByRole('button', { name: 'Go' })).toBeDisabled();
  });
});
