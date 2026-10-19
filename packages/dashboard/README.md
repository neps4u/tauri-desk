# @tauri-desk/dashboard

Shared dashboard shell, theming and settings for **Tauri 2 + Svelte 5** apps.

- Borderless window chrome with native controls
- Theming: light / dark / system, accent, radius, density, font
- Sidebar + topbar + breadcrumbs layout shell
- Command palette, toasts, native notifications
- Auth abstraction, i18n, auto-updater UI, platform detection
- Persistence via Tauri Store, `localStorage`, or in-memory

## Install

```bash
pnpm add @tauri-desk/dashboard
```

Peer dependency: `svelte@^5`. Tauri plugins (`store`, `notification`, `updater`,
`process`, `os`, `opener`) are pulled in as dependencies — add the matching
**Rust** plugins to `src-tauri/Cargo.toml` for the features you use, plus the
permissions in `src-tauri/capabilities/default.json`.

## Quick start

```ts
// src/main.ts
import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';
import { auth, createDemoAuthProvider, i18n, initPlatform, settings } from '@tauri-desk/dashboard';

await initPlatform();
auth.configure(createDemoAuthProvider());
await settings.bootstrap({ onReady: (s) => i18n.setLocale(s.locale) });

mount(App, { target: document.getElementById('app')! });
```

```svelte
<!-- src/App.svelte -->
<script lang="ts">
  import { AppShell, Toaster, CommandPalette, t, type NavConfig } from '@tauri-desk/dashboard';

  const nav: NavConfig = [
    { items: [{ label: 'Dashboard', href: '/', exact: true }] }
  ];
</script>

<AppShell {nav} appName="My App">
  <slot />
</AppShell>
<Toaster />
```

## Theming

Import the design tokens once:

```css
/* src/app.css */
@import 'tailwindcss';
@import '@tauri-desk/dashboard/theme.css';
```

The theme is reflected onto `<html>` as `class="dark"` plus `data-accent`,
`data-radius`, `data-density` and `data-font` attributes. `ThemeConfig`:

| Field | Values |
| --- | --- |
| `mode` | `light` · `dark` · `system` |
| `accent` | `neutral` · `blue` · `violet` · `emerald` · `rose` · `amber` · `orange` |
| `radius` | `none` · `sm` · `md` · `lg` |
| `density` | `compact` · `cozy` · `comfortable` |
| `font` | `sans` · `serif` · `mono` |

Add this snippet to `index.html` to apply the persisted theme before first paint
(avoids a flash):

```html
<script>
  (function () {
    try {
      var theme = JSON.parse(localStorage.getItem('tauri-desk:theme') || 'null');
      var mode = theme && theme.mode ? theme.mode : 'system';
      var dark =
        mode === 'dark' ||
        (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var root = document.documentElement;
      root.classList.toggle('dark', dark);
      if (theme) {
        root.dataset.accent = theme.accent;
        root.dataset.radius = theme.radius;
        root.dataset.density = theme.density;
        root.dataset.font = theme.font;
      }
      root.style.colorScheme = dark ? 'dark' : 'light';
    } catch (e) {}
  })();
</script>
```

## API overview

### Settings

`settings.bootstrap(options)` loads persisted state, applies the theme and starts
saving (debounced). Returns a teardown function.

```ts
const dispose = await settings.bootstrap({
  adapter: createStorageAdapter(),          // optional override
  locale: 'en',
  onReady: (s) => i18n.setLocale(s.locale)
});
```

Methods: `setTheme(partial)`, `setLocale(locale)`, `toggleSidebar()`,
`setSidebarCollapsed(bool)`, `reset()`, `save()`, `dispose()`. Read state via
`settings.theme`, `settings.locale`, `settings.sidebarCollapsed`, `settings.snapshot`,
`settings.resolvedMode`.

Storage adapters: `TauriStoreAdapter`, `LocalStorageAdapter`, `MemoryAdapter`, or
`createStorageAdapter()` to auto-detect.

### Layout

`AppShell` props: `nav`, `appName`, `title`, `breadcrumbs`, `fluid`, and the
snippets `brand`, `sidebarFooter`, `topbarActions`, `children`.

`NavConfig` is a list of sections: `{ title?, items: NavItem[] }`, where
`NavItem` is `{ label, href, icon?, badge?, exact?, hideWhenCollapsed? }`.
Use `isActive(current, item)` for custom highlighting.

### i18n

`i18n.register(locale, messages)`, `i18n.extend(messages)`, `i18n.setLocale(locale)`,
and the reactive `t(key, vars?)` helper. English strings ship in `DEFAULT_MESSAGES`.

### Command palette

```svelte
<CommandPalette bind:open={commandOpen} items={commands} />
```

Each `CommandItem` is `{ id, label, group?, icon?, keywords?, shortcut?, run() }`.
The palette filters on label, group and keywords, and supports arrow keys + Enter.

### Notifications, auth, updater

```ts
import { notify, ensureNotificationPermission } from '@tauri-desk/dashboard';
await notify({ title: 'Done', body: 'Export finished' });

import { auth, createDemoAuthProvider } from '@tauri-desk/dashboard';
auth.configure(createDemoAuthProvider()); // replace with your AuthProvider
await auth.signIn({ email, password });
auth.signOut();

import { updater } from '@tauri-desk/dashboard';
await updater.check();
await updater.install();
```

### Platform

```ts
import { initPlatform, platform } from '@tauri-desk/dashboard';
await initPlatform();
platform.isTauri; // boolean
platform.isMac;   // boolean
```

## Publishing note

This package ships compiled output in `dist/` (`svelte-package`). During local
development inside the monorepo, Vite's `development` export condition resolves
to the raw `src/lib` sources so no build step is needed in dev.

## License

MIT
