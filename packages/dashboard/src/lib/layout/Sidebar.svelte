<script lang="ts">
  import type { Snippet } from 'svelte';
  import { link, router } from 'svelte-spa-router';
  import { PanelLeftClose, PanelLeftOpen } from '@lucide/svelte';
  import { cn } from '../utils/cn';
  import { isActive, type NavConfig } from './nav';

  let {
    nav = [],
    collapsed = false,
    brand,
    footer,
    onToggle,
    onNavigate
  }: {
    nav?: NavConfig;
    collapsed?: boolean;
    brand?: Snippet;
    footer?: Snippet;
    onToggle?: () => void;
    onNavigate?: () => void;
  } = $props();

  const current = $derived(router.location);
</script>

<aside
  class={cn(
    'bg-sidebar text-sidebar-foreground flex h-full shrink-0 flex-col border-r transition-[width] duration-200 ease-out',
    collapsed ? 'w-16' : 'w-64'
  )}
>
  <div
    class={cn('flex h-14 shrink-0 items-center gap-2', collapsed ? 'justify-center px-2' : 'px-3')}
  >
    {#if !collapsed && brand}
      <div class="min-w-0 flex-1">{@render brand()}</div>
    {/if}
    <button
      class="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors"
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      onclick={() => onToggle?.()}
    >
      {#if collapsed}
        <PanelLeftOpen class="size-4" />
      {:else}
        <PanelLeftClose class="size-4" />
      {/if}
    </button>
  </div>

  <nav class="flex-1 space-y-5 overflow-x-hidden overflow-y-auto px-2 py-1">
    {#each nav as section, i (i)}
      <div>
        {#if section.title && !collapsed}
          <div
            class="text-muted-foreground px-3 pb-1.5 text-[0.7rem] font-semibold tracking-wider uppercase"
          >
            {section.title}
          </div>
        {/if}
        <ul class="space-y-0.5">
          {#each section.items as item (item.href)}
            {@const active = isActive(current, item)}
            <li>
              <a
                use:link
                href={item.href}
                title={collapsed ? item.label : undefined}
                onclick={() => onNavigate?.()}
                class={cn(
                  'flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors',
                  collapsed ? 'justify-center px-0' : 'px-3',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                {#if item.icon}
                  {@const Icon = item.icon}
                  <Icon class="size-4 shrink-0" />
                {/if}
                {#if !collapsed}
                  <span class="min-w-0 flex-1 truncate">{item.label}</span>
                  {#if item.badge !== undefined}
                    <span
                      class="bg-sidebar-accent ml-auto rounded-full px-1.5 py-0.5 text-[0.7rem] font-semibold"
                    >
                      {item.badge}
                    </span>
                  {/if}
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </nav>

  {#if footer}
    <div class="border-sidebar-border border-t p-2">{@render footer()}</div>
  {/if}
</aside>
