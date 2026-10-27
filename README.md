# Tauri Desk

A production-ready desktop dashboard shell for **Tauri 2 + Svelte 5**, packaged as a
reusable library (`@tauri-desk/dashboard`) plus a scaffolder (`@tauri-desk/create-app`)
and a runnable reference app.

- Custom (borderless) window chrome with native controls
- Theming engine: light/dark/system, accent colors, radius, density, font
- Settings with pluggable persistence (Tauri Store / localStorage / memory)
- Layout shell: sidebar, topbar, breadcrumbs
- Command palette (`Ctrl/Cmd + K`), toasts, native notifications
- Auth abstraction with a demo provider, i18n, auto-updater UI, platform detection

## Repository layout

| Path                  | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `packages/dashboard`  | `@tauri-desk/dashboard` — the reusable shell library |
| `packages/create-app` | `@tauri-desk/create-app` — project scaffolder CLI    |
| `apps/reference`      | Reference Tauri app wiring everything together       |

## Prerequisites

- **Node.js** ≥ 20 (see `.nvmrc`)
- **pnpm** ≥ 12 (`corepack enable` recommended)
- **Rust** (stable) and the [Tauri 2 system dependencies](https://v2.tauri.app/start/prerequisites/)
  for your OS

## Quickstart

```bash
pnpm install
pnpm tauri dev        # launch the desktop app (runs `vite` + Tauri)
```

Prefer a browser-only loop? Use `pnpm dev` and open http://localhost:1420 — the
dashboard falls back to `localStorage` outside the Tauri runtime.

## Scripts

| Command                             | Description                                         |
| ----------------------------------- | --------------------------------------------------- |
| `pnpm dev`                          | Vite dev server for the reference app (browser)     |
| `pnpm tauri dev`                    | Full desktop app with hot reload                    |
| `pnpm build`                        | Build the dashboard package, then the reference app |
| `pnpm tauri build`                  | Produce native bundles/installers                   |
| `pnpm check`                        | `svelte-check` across all packages                  |
| `pnpm test`                         | Vitest unit + component tests                       |
| `pnpm lint`                         | ESLint (flat config)                                |
| `pnpm format` / `pnpm format:check` | Prettier write / verify                             |

## Creating a new app

```bash
pnpm create @tauri-desk/app my-app
# or, from this repo:
node packages/create-app/index.js my-app --product "My App" --id com.acme.myapp
```

Options: `--id <bundle.id>`, `--product <name>`, `--scope <@scope>`,
`--dashboard <spec>`, `--install`, `--yes`. See `packages/create-app/README.md`.

## Using the dashboard package

```bash
pnpm add @tauri-desk/dashboard
```

```svelte
<!-- src/app.css -->
@import 'tailwindcss'; @import '@tauri-desk/dashboard/theme.css';
```

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

Full reference: [`packages/dashboard/README.md`](packages/dashboard/README.md).

## Releasing

This monorepo uses [Changesets](https://github.com/changesets/changesets). Add a
changeset for any user-facing change, then merge the generated "Version Packages"
PR to publish. See [`CONTRIBUTING.md`](CONTRIBUTING.md) and `.github/workflows/release.yml`.

## License

MIT
