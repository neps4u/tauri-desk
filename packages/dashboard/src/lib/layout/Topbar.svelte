<script lang="ts">
  import type { Snippet } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { ChevronRight } from '@lucide/svelte';
  import type { Crumb } from './nav';

  let {
    title,
    breadcrumbs = [],
    actions
  }: {
    title?: string;
    breadcrumbs?: Crumb[];
    actions?: Snippet;
  } = $props();
</script>

<header class="bg-background/80 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur">
  <div class="min-w-0">
    {#if breadcrumbs.length > 0}
      <nav class="text-muted-foreground flex items-center gap-1 text-xs">
        {#each breadcrumbs as crumb, i (i)}
          {#if i > 0}<ChevronRight class="size-3 shrink-0" />{/if}
          {#if crumb.href}
            <a use:link href={crumb.href} class="hover:text-foreground truncate transition-colors">
              {crumb.label}
            </a>
          {:else}
            <span class="truncate">{crumb.label}</span>
          {/if}
        {/each}
      </nav>
    {/if}
    {#if title}
      <h1 class="text-foreground truncate text-sm font-semibold">{title}</h1>
    {/if}
  </div>

  <div class="ml-auto flex items-center gap-2">
    {#if actions}{@render actions()}{/if}
  </div>
</header>
