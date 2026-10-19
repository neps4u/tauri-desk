<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { cn } from '../utils/cn';

  type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  type Size = 'sm' | 'default' | 'lg' | 'icon';

  let {
    variant = 'default',
    size = 'default',
    class: klass = '',
    disabled = false,
    type = 'button',
    children,
    ...rest
  }: HTMLButtonAttributes & {
    variant?: Variant;
    size?: Size;
    children?: Snippet;
  } = $props();

  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0';

  const variants: Record<Variant, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    link: 'text-primary underline-offset-4 hover:underline'
  };

  const sizes: Record<Size, string> = {
    sm: 'h-8 px-3 text-xs',
    default: 'h-9 px-4 py-2',
    lg: 'h-10 px-6',
    icon: 'size-9'
  };
</script>

<button {type} {disabled} class={cn(base, variants[variant], sizes[size], klass)} {...rest}>
  {@render children?.()}
</button>
