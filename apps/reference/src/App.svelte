<script lang="ts">
  import Router, { push, router } from 'svelte-spa-router';
  import {
    AppShell,
    Button,
    CommandPalette,
    LoginPage,
    Toaster,
    auth,
    t,
    type CommandItem,
    type Crumb,
    type NavConfig
  } from '@tauri-desk/dashboard';
  import {
    Command,
    Info,
    LayoutDashboard,
    LogOut,
    Palette,
    SlidersHorizontal
  } from '@lucide/svelte';

  import DashboardPage from './routes/DashboardPage.svelte';
  import SettingsAboutPage from './routes/SettingsAboutPage.svelte';
  import SettingsAppearancePage from './routes/SettingsAppearancePage.svelte';
  import SettingsGeneralPage from './routes/SettingsGeneralPage.svelte';

  const routes = {
    '/': DashboardPage,
    '/settings/appearance': SettingsAppearancePage,
    '/settings/general': SettingsGeneralPage,
    '/settings/about': SettingsAboutPage
  };

  let commandOpen = $state(false);

  const nav = $derived<NavConfig>([
    { items: [{ label: 'Dashboard', href: '/', icon: LayoutDashboard, exact: true }] },
    {
      title: t('app.settings'),
      items: [
        { label: t('app.appearance'), href: '/settings/appearance', icon: Palette },
        { label: t('app.general'), href: '/settings/general', icon: SlidersHorizontal },
        { label: t('app.about'), href: '/settings/about', icon: Info }
      ]
    }
  ]);

  const meta = $derived.by<{ title: string; crumbs: Crumb[] }>(() => {
    const path = router.location;
    if (path === '/') return { title: 'Dashboard', crumbs: [{ label: 'Dashboard' }] };
    if (path.startsWith('/settings')) {
      const sub = path.split('/')[2] ?? 'appearance';
      const label =
        sub === 'general'
          ? t('app.general')
          : sub === 'about'
            ? t('app.about')
            : t('app.appearance');
      return {
        title: label,
        crumbs: [{ label: t('app.settings'), href: '/settings/appearance' }, { label }]
      };
    }
    return { title: '', crumbs: [] };
  });

  const commands = $derived<CommandItem[]>([
    {
      id: 'go-dashboard',
      label: 'Dashboard',
      group: 'Navigation',
      icon: LayoutDashboard,
      run: () => push('/')
    },
    {
      id: 'go-appearance',
      label: t('app.appearance'),
      group: 'Navigation',
      icon: Palette,
      run: () => push('/settings/appearance')
    },
    {
      id: 'go-general',
      label: t('app.general'),
      group: 'Navigation',
      icon: SlidersHorizontal,
      run: () => push('/settings/general')
    },
    {
      id: 'go-about',
      label: t('app.about'),
      group: 'Navigation',
      icon: Info,
      run: () => push('/settings/about')
    },
    {
      id: 'sign-out',
      label: t('app.signOut'),
      group: 'Account',
      icon: LogOut,
      run: () => void auth.signOut()
    }
  ]);

  function onKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      commandOpen = !commandOpen;
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if !auth.isAuthenticated}
  <LoginPage />
{:else}
  <AppShell {nav} appName="Tauri Desk" title={meta.title} breadcrumbs={meta.crumbs}>
    {#snippet topbarActions()}
      <Button variant="outline" size="sm" onclick={() => (commandOpen = true)}>
        <Command />
        <span class="text-muted-foreground text-xs">Ctrl K</span>
      </Button>
    {/snippet}
    <Router {routes} />
  </AppShell>

  <CommandPalette bind:open={commandOpen} items={commands} />
  <Toaster />
{/if}
