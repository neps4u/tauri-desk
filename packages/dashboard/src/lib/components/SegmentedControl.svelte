<script lang="ts" generics="T extends string">
  import { cn } from '../utils/cn';

  let {
    value,
    options,
    onchange,
    class: klass = ''
  }: {
    value: T;
    options: { value: T; label: string }[];
    onchange?: (value: T) => void;
    class?: string;
  } = $props();
</script>

<div class={cn('bg-muted/50 inline-flex rounded-lg border p-0.5', klass)}>
  {#each options as option (option.value)}
    <button
      type="button"
      class={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        value === option.value
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
      aria-pressed={value === option.value}
      onclick={() => onchange?.(option.value)}
    >
      {option.label}
    </button>
  {/each}
</div>
