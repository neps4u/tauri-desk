<script lang="ts">
  import { Button, Card, notify, toast } from '@tauri-desk/dashboard';
  import { invoke, isTauri } from '@tauri-apps/api/core';
  import { Bell, Plus, Sparkles, Terminal } from '@lucide/svelte';

  const canInvoke = isTauri();

  async function greet() {
    try {
      const message = await invoke<string>('greet', { name: 'Tauri Desk' });
      toast.success(message);
    } catch (error) {
      toast.error(String(error));
    }
  }

  const stats = [
    { label: 'Active users', value: '2,318', delta: '+12.5%' },
    { label: 'Revenue', value: '$48.2k', delta: '+4.1%' },
    { label: 'Open tickets', value: '37', delta: '-8.0%' },
    { label: 'Uptime', value: '99.98%', delta: '+0.02%' }
  ];
</script>

<div class="space-y-6">
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each stats as stat (stat.label)}
      <Card class="p-5">
        <p class="text-muted-foreground text-sm">{stat.label}</p>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-semibold">{stat.value}</span>
          <span class="text-muted-foreground text-xs">{stat.delta}</span>
        </div>
      </Card>
    {/each}
  </div>

  <Card class="p-6">
    <div class="flex items-center gap-2">
      <Sparkles class="text-primary size-4" />
      <h2 class="text-base font-semibold">Master dashboard</h2>
    </div>
    <p class="text-muted-foreground mt-2 max-w-2xl text-sm">
      This reference app exercises the shared shell — theming, navigation, the command palette
      (Ctrl/Cmd&nbsp;+&nbsp;K), toasts and native notifications — all from
      <code class="bg-muted rounded px-1 py-0.5 text-xs">@tauri-desk/dashboard</code>.
    </p>
    <div class="mt-5 flex flex-wrap gap-2">
      <Button onclick={() => toast.success('Saved!')}>
        <Plus /> Show toast
      </Button>
      <Button
        variant="outline"
        onclick={() => void notify({ title: 'Tauri Desk', body: 'Native notification' })}
      >
        <Bell /> Notify
      </Button>
      {#if canInvoke}
        <Button variant="outline" onclick={() => void greet()}>
          <Terminal /> Call greet
        </Button>
      {/if}
    </div>
  </Card>
</div>
