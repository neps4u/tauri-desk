import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import SegmentedControl from '../../src/lib/components/SegmentedControl.svelte';

const options = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' }
];

describe('SegmentedControl', () => {
  it('renders one button per option', () => {
    render(SegmentedControl, { props: { value: 'md', options } });
    for (const option of options) {
      expect(screen.getByRole('button', { name: option.label })).toBeInTheDocument();
    }
  });

  it('marks the selected option as pressed', () => {
    render(SegmentedControl, { props: { value: 'md', options } });
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Small' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('emits the value of the clicked option', async () => {
    const onchange = vi.fn();
    render(SegmentedControl, { props: { value: 'md', options, onchange } });

    screen.getByRole('button', { name: 'Large' }).click();
    expect(onchange).toHaveBeenCalledWith('lg');
  });
});
