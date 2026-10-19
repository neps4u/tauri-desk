<script lang="ts">
  import { isTauri } from '@tauri-apps/api/core';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { Copy, Minus, Square, X } from '@lucide/svelte';
  import { cn } from '../utils/cn';

  const available = isTauri();
  let maximized = $state(false);

  $effect(() => {
    if (!available) return;
    const win = getCurrentWindow();
    let unlisten: (() => void) | undefined;
    let disposed = false;
    const sync = () =>
      win
        .isMaximized()
        .then((m) => {
          if (!disposed) maximized = m;
        })
        .catch(() => {});
    void sync();
    win
      .onResized(sync)
      .then((u) => {
        unlisten = u;
      })
      .catch(() => {});
    return () => {
      disposed = true;
      unlisten?.();
    };
  });

  const minimize = () => available && void getCurrentWindow().minimize();
  const toggle = () => available && void getCurrentWindow().toggleMaximize();
  const close = () => available && void getCurrentWindow().close();

  const btn =
    'inline-flex h-8 w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground';
</script>

{#if available}
  <div class="flex items-center">
    <button class={btn} title="Minimize" aria-label="Minimize" onclick={minimize}>
      <Minus class="size-4" />
    </button>
    <button
      class={btn}
      title={maximized ? 'Restore' : 'Maximize'}
      aria-label={maximized ? 'Restore' : 'Maximize'}
      onclick={toggle}
    >
      {#if maximized}
        <Copy class="size-3.5" />
      {:else}
        <Square class="size-3.5" />
      {/if}
    </button>
    <button
      class={cn(btn, 'hover:bg-destructive hover:text-destructive-foreground')}
      title="Close"
      aria-label="Close"
      onclick={close}
    >
      <X class="size-4" />
    </button>
  </div>
{/if}
