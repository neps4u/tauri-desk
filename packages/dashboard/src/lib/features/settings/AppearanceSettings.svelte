<script lang="ts">
  import Card from '../../components/Card.svelte';
  import SegmentedControl from '../../components/SegmentedControl.svelte';
  import { cn } from '../../utils/cn';
  import { settings } from '../../settings/settings.svelte';
  import {
    ACCENTS,
    ACCENT_LABELS,
    ACCENT_SWATCHES,
    type Accent,
    type Density,
    type FontFamily,
    type Radius,
    type ThemeMode
  } from '../../theme/theme.svelte';
  import { t } from '../i18n/i18n.svelte';

  const modeOptions = $derived<{ value: ThemeMode; label: string }[]>([
    { value: 'light', label: t('theme.light') },
    { value: 'dark', label: t('theme.dark') },
    { value: 'system', label: t('theme.system') }
  ]);

  const radiusOptions = $derived<{ value: Radius; label: string }[]>([
    { value: 'none', label: t('radius.none') },
    { value: 'sm', label: t('radius.sm') },
    { value: 'md', label: t('radius.md') },
    { value: 'lg', label: t('radius.lg') }
  ]);

  const densityOptions = $derived<{ value: Density; label: string }[]>([
    { value: 'compact', label: t('density.compact') },
    { value: 'cozy', label: t('density.cozy') },
    { value: 'comfortable', label: t('density.comfortable') }
  ]);

  const fontOptions = $derived<{ value: FontFamily; label: string }[]>([
    { value: 'sans', label: t('font.sans') },
    { value: 'serif', label: t('font.serif') },
    { value: 'mono', label: t('font.mono') }
  ]);
</script>

<Card>
  <div class="border-b p-6">
    <h2 class="text-base font-semibold">{t('app.appearance')}</h2>
    <p class="text-muted-foreground mt-1 text-sm">{t('appearance.description')}</p>
  </div>

  <div class="divide-y">
    <div class="flex flex-wrap items-center justify-between gap-4 p-6">
      <span class="text-sm font-medium">{t('app.theme')}</span>
      <SegmentedControl
        value={settings.theme.mode}
        options={modeOptions}
        onchange={(mode) => settings.setTheme({ mode })}
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 p-6">
      <span class="text-sm font-medium">{t('appearance.accent')}</span>
      <div class="flex flex-wrap items-center gap-2">
        {#each ACCENTS as accent (accent)}
          <button
            type="button"
            title={ACCENT_LABELS[accent]}
            aria-label={ACCENT_LABELS[accent]}
            aria-pressed={settings.theme.accent === accent}
            class={cn(
              'ring-offset-background size-7 rounded-full ring-offset-2 transition-shadow',
              settings.theme.accent === accent ? 'ring-ring ring-2' : 'ring-border ring-1'
            )}
            style="background-color: {ACCENT_SWATCHES[accent]}"
            onclick={() => settings.setTheme({ accent: accent as Accent })}
          ></button>
        {/each}
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 p-6">
      <span class="text-sm font-medium">{t('appearance.radius')}</span>
      <SegmentedControl
        value={settings.theme.radius}
        options={radiusOptions}
        onchange={(radius) => settings.setTheme({ radius })}
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 p-6">
      <span class="text-sm font-medium">{t('appearance.density')}</span>
      <SegmentedControl
        value={settings.theme.density}
        options={densityOptions}
        onchange={(density) => settings.setTheme({ density })}
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 p-6">
      <span class="text-sm font-medium">{t('appearance.font')}</span>
      <SegmentedControl
        value={settings.theme.font}
        options={fontOptions}
        onchange={(font) => settings.setTheme({ font })}
      />
    </div>
  </div>
</Card>
