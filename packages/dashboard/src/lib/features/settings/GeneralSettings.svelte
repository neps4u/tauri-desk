<script lang="ts">
  import Card from '../../components/Card.svelte';
  import Button from '../../components/Button.svelte';
  import { settings } from '../../settings/settings.svelte';
  import { i18n, t } from '../i18n/i18n.svelte';

  let {
    locales = [{ value: 'en', label: 'English' }],
    onLocaleChange,
    showReset = true
  }: {
    locales?: { value: string; label: string }[];
    onLocaleChange?: (locale: string) => void;
    showReset?: boolean;
  } = $props();

  const selectClass =
    'h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40';

  function changeLocale(locale: string) {
    settings.setLocale(locale);
    i18n.setLocale(locale);
    onLocaleChange?.(locale);
  }
</script>

<Card>
  <div class="border-b p-6">
    <h2 class="text-base font-semibold">{t('app.general')}</h2>
  </div>

  <div class="divide-y">
    <div class="flex flex-wrap items-center justify-between gap-4 p-6">
      <span class="text-sm font-medium">{t('app.language')}</span>
      <select
        class={selectClass}
        value={settings.locale}
        onchange={(event) => changeLocale(event.currentTarget.value)}
      >
        {#each locales as locale (locale.value)}
          <option value={locale.value}>{locale.label}</option>
        {/each}
      </select>
    </div>

    {#if showReset}
      <div class="flex flex-wrap items-center justify-between gap-4 p-6">
        <span class="text-sm font-medium">{t('app.reset')}</span>
        <Button variant="outline" size="sm" onclick={() => void settings.reset()}>
          {t('app.reset')}
        </Button>
      </div>
    {/if}
  </div>
</Card>
