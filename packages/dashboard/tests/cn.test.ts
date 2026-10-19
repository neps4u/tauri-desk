import { describe, expect, it } from 'vitest';
import { cn } from '../src/lib/utils/cn';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values', () => {
    expect(cn('text-sm', undefined, null, '', 'font-bold')).toBe('text-sm font-bold');
    expect(cn('a', { b: false, c: true }, 'd')).toBe('a c d');
  });

  it('supports arrays and nested objects', () => {
    expect(cn(['a', 'b'], { c: true, d: false })).toBe('a b c');
  });

  it('lets later tailwind utilities win', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-left', 'text-center')).toBe('text-center');
  });
});
