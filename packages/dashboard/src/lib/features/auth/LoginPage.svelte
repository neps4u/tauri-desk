<script lang="ts">
  import { toast } from 'svelte-sonner';
  import Button from '../../components/Button.svelte';
  import { t } from '../i18n/i18n.svelte';
  import { auth } from './auth.svelte';

  let {
    title,
    subtitle,
    onSuccess
  }: { title?: string; subtitle?: string; onSuccess?: () => void } = $props();

  let email = $state('');
  let password = $state('');

  const loading = $derived(auth.status === 'authenticating');

  const inputClass =
    'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40';

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (loading) return;
    const ok = await auth.signIn({ email, password });
    if (ok) {
      toast.success(t('app.signIn'));
      onSuccess?.();
    } else {
      toast.error(auth.error ?? t('auth.invalidCredentials'));
    }
  }
</script>

<div class="bg-background flex min-h-screen w-full items-center justify-center p-6">
  <div class="w-full max-w-sm">
    <div class="mb-6 text-center">
      <h1 class="text-xl font-semibold">{title ?? t('auth.signInTitle')}</h1>
      <p class="text-muted-foreground mt-1 text-sm">{subtitle ?? t('auth.signInSubtitle')}</p>
    </div>

    <form class="bg-card space-y-4 rounded-xl border p-6 shadow-sm" onsubmit={submit}>
      <div class="space-y-1.5">
        <label class="text-sm font-medium" for="login-email">{t('auth.email')}</label>
        <input
          id="login-email"
          type="email"
          bind:value={email}
          placeholder={t('auth.emailPlaceholder')}
          autocomplete="username"
          required
          class={inputClass}
        />
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium" for="login-password">{t('auth.password')}</label>
        <input
          id="login-password"
          type="password"
          bind:value={password}
          autocomplete="current-password"
          required
          class={inputClass}
        />
      </div>

      {#if auth.status === 'error' && auth.error}
        <p class="text-destructive text-sm">{auth.error}</p>
      {/if}

      <Button type="submit" class="w-full" disabled={loading}>
        {loading ? t('auth.signingIn') : t('app.signIn')}
      </Button>
    </form>
  </div>
</div>
