<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '../utils/cn';

  let { class: klass = '', children }: { class?: string; children: Snippet } = $props();
</script>

<div class={cn('bg-card text-card-foreground rounded-xl border shadow-sm', klass)}>
  {@render children()}
</div>
