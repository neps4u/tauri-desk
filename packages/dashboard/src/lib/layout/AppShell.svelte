<script lang="ts">
  import type { Snippet } from 'svelte';
  import { settings } from '../settings/settings.svelte';
  import Sidebar from './Sidebar.svelte';
  import Titlebar from './Titlebar.svelte';
  import Topbar from './Topbar.svelte';
  import type { Crumb, NavConfig } from './nav';

  let {
    nav = [],
    appName = '',
    title,
    breadcrumbs = [],
    fluid = false,
    brand,
    sidebarFooter,
    topbarActions,
    children
  }: {
    nav?: NavConfig;
    appName?: string;
    title?: string;
    breadcrumbs?: Crumb[];
    fluid?: boolean;
    brand?: Snippet;
    sidebarFooter?: Snippet;
    topbarActions?: Snippet;
    children: Snippet;
  } = $props();

  const collapsed = $derived(settings.sidebarCollapsed);
</script>

<div class="bg-background text-foreground flex h-screen w-screen flex-col overflow-hidden">
  <Titlebar title={appName} />
  <div class="flex min-h-0 flex-1">
    <Sidebar
      {nav}
      {collapsed}
      {brand}
      footer={sidebarFooter}
      onToggle={() => settings.toggleSidebar()}
    />
    <div class="flex min-w-0 flex-1 flex-col">
      <Topbar {title} {breadcrumbs} actions={topbarActions} />
      <main class="min-h-0 flex-1 overflow-auto">
        <div class={fluid ? 'w-full p-6' : 'mx-auto w-full max-w-7xl p-6'}>
          {@render children()}
        </div>
      </main>
    </div>
  </div>
</div>
