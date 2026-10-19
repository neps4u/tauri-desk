<script lang="ts">
  import { Dialog } from 'bits-ui';
  import { Search } from '@lucide/svelte';
  import { cn } from '../../utils/cn';
  import { t } from '../i18n/i18n.svelte';
  import type { CommandItem } from './command';

  let {
    open = $bindable(false),
    items = [],
    placeholder
  }: { open?: boolean; items?: CommandItem[]; placeholder?: string } = $props();

  let query = $state('');
  let activeIndex = $state(0);
  let inputEl = $state<HTMLInputElement | undefined>(undefined);

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack = [item.label, item.group, ...(item.keywords ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  });

  $effect(() => {
    if (open) {
      query = '';
      activeIndex = 0;
      requestAnimationFrame(() => inputEl?.focus());
    }
  });

  $effect(() => {
    if (activeIndex >= filtered.length) activeIndex = Math.max(0, filtered.length - 1);
  });

  function run(item: CommandItem) {
    open = false;
    void item.run();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = filtered[activeIndex];
      if (item) run(item);
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
    />
    <Dialog.Content
      class="bg-popover text-popover-foreground fixed top-[15%] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border shadow-2xl"
    >
      <div class="flex items-center gap-2 border-b px-3">
        <Search class="text-muted-foreground size-4 shrink-0" />
        <input
          bind:this={inputEl}
          bind:value={query}
          onkeydown={handleKeydown}
          type="text"
          autocomplete="off"
          spellcheck="false"
          placeholder={placeholder ?? t('app.search')}
          class="placeholder:text-muted-foreground h-11 w-full bg-transparent text-sm outline-none"
        />
      </div>

      {#if filtered.length === 0}
        <div class="text-muted-foreground px-3 py-8 text-center text-sm">
          {t('app.noResults')}
        </div>
      {:else}
        <ul class="max-h-80 overflow-y-auto p-1">
          {#each filtered as item, i (item.id)}
            {#if item.group && item.group !== filtered[i - 1]?.group}
              <li
                class="text-muted-foreground px-2 pt-2 pb-1 text-[0.7rem] font-semibold tracking-wider uppercase"
              >
                {item.group}
              </li>
            {/if}
            <li>
              <button
                class={cn(
                  'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors',
                  i === activeIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60'
                )}
                onmouseenter={() => (activeIndex = i)}
                onclick={() => run(item)}
              >
                {#if item.icon}
                  {@const Icon = item.icon}
                  <Icon class="text-muted-foreground size-4 shrink-0" />
                {/if}
                <span class="min-w-0 flex-1 truncate">{item.label}</span>
                {#if item.shortcut}
                  <span class="text-muted-foreground shrink-0 text-xs">{item.shortcut}</span>
                {/if}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
