<script lang="ts">
  import { isTauri } from '@tauri-apps/api/core';
  import Card from '../../components/Card.svelte';
  import Button from '../../components/Button.svelte';
  import { t } from '../i18n/i18n.svelte';
  import { updater } from '../updater/updater.svelte';

  let { appName = '' }: { appName?: string } = $props();

  let currentVersion = $state('—');

  $effect(() => {
    void (async () => {
      if (!isTauri()) return;
      try {
        const { getVersion } = await import('@tauri-apps/api/app');
        currentVersion = await getVersion();
      } catch {
        /* ignore */
      }
    })();
  });

  const busy = $derived(updater.status === 'checking' || updater.status === 'downloading');
</script>

<div class="space-y-6">
  <Card>
    <div class="border-b p-6">
      <h2 class="text-base font-semibold">{t('app.about')}</h2>
    </div>
    <div class="flex items-center justify-between gap-4 p-6">
      <span class="text-sm font-medium">{appName}</span>
      <span class="text-muted-foreground text-sm">{t('about.version')} {currentVersion}</span>
    </div>
  </Card>

  <Card>
    <div class="border-b p-6">
      <h2 class="text-base font-semibold">{t('updates.title')}</h2>
      <p class="text-muted-foreground mt-1 text-sm">{t('updates.description')}</p>
    </div>

    <div class="space-y-4 p-6">
      {#if updater.status === 'available'}
        <p class="text-sm">
          {t('updates.available', { version: updater.version ?? '' })}
        </p>
      {:else if updater.status === 'up-to-date'}
        <p class="text-muted-foreground text-sm">{t('updates.upToDate')}</p>
      {:else if updater.status === 'ready'}
        <p class="text-muted-foreground text-sm">{t('updates.ready')}</p>
      {:else if updater.status === 'error'}
        <p class="text-destructive text-sm">
          {t('updates.error', { message: updater.error ?? '' })}
        </p>
      {/if}

      {#if updater.status === 'downloading'}
        <div class="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            class="bg-primary h-full rounded-full transition-[width] duration-200"
            style="width: {updater.progress}%"
          ></div>
        </div>
        <p class="text-muted-foreground text-xs">
          {t('updates.downloading', { progress: updater.progress })}
        </p>
      {/if}

      <div class="flex flex-wrap gap-2">
        {#if updater.status === 'ready'}
          <Button onclick={() => void updater.restart()}>{t('app.restart')}</Button>
        {:else if updater.status === 'available'}
          <Button onclick={() => void updater.install()}>{t('updates.install')}</Button>
        {:else}
          <Button variant="outline" disabled={busy} onclick={() => void updater.check()}>
            {updater.status === 'checking' ? t('updates.checking') : t('updates.check')}
          </Button>
        {/if}
      </div>
    </div>
  </Card>
</div>
