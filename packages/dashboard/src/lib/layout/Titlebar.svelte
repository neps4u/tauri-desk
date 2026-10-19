<script lang="ts">
  import { platform } from '../platform.svelte';
  import WindowControls from './WindowControls.svelte';

  let { title = '' }: { title?: string } = $props();

  const isMac = $derived(platform.isMac && platform.isTauri);
</script>

<div data-tauri-drag-region class="bg-sidebar flex h-9 shrink-0 items-center border-b select-none">
  {#if isMac}
    <div class="w-20 shrink-0 self-stretch" data-tauri-drag-region></div>
  {/if}
  <div class="flex min-w-0 flex-1 items-center px-3" data-tauri-drag-region>
    <span class="text-muted-foreground truncate text-xs font-medium" data-tauri-drag-region>
      {title}
    </span>
  </div>
  {#if !isMac}
    <WindowControls />
  {/if}
</div>
