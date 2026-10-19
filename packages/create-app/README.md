# create-tauri-desk-app

Scaffold a new [Tauri 2 + Svelte 5](https://v2.tauri.app/) dashboard app powered by
[`@tauri-desk/dashboard`](../dashboard).

## Usage

```bash
pnpm create @tauri-desk/app my-app
# or
npx @tauri-desk/create-app my-app
```

You'll be prompted for a product name and bundle identifier. Skip the prompts
with `--yes`.

### Options

| Flag | Description |
| --- | --- |
| `--id <bundle.id>` | Bundle identifier (default `com.tauridesk.<slug>`) |
| `--product <name>` | Product / window title |
| `--scope <@scope>` | npm scope for the generated app package |
| `--dashboard <spec>` | `@tauri-desk/dashboard` dependency spec |
| `--install` | Run `pnpm install` after scaffolding |
| `-y`, `--yes` | Skip prompts and use defaults |
| `-h`, `--help` | Show help |

## What you get

The reference app as a starting point — borderless window, theming, settings,
command palette, toasts, i18n, auth (demo provider) and updater UI — with all
identifiers rewritten for your app:

```
my-app/
├─ src/
│  ├─ App.svelte            # nav, routes, command palette wiring
│  ├─ main.ts               # bootstrap (platform, auth, settings, i18n)
│  ├─ app.css
│  └─ routes/
├─ src-tauri/               # Rust side, capabilities, icons, tauri.conf.json
├─ index.html               # pre-paint theme snippet
└─ package.json
```

## After scaffolding

```bash
cd my-app
pnpm install
pnpm tauri dev
```

Then:

- Replace the updater `endpoints` / `pubkey` in `src-tauri/tauri.conf.json`.
- Swap `createDemoAuthProvider()` for your own `AuthProvider`.
- Regenerate icons with `pnpm tauri icon path/to/icon.png`.

## How it works

The template is generated from the reference app in this repo
(`packages/create-app/scripts/sync-template.mjs`) so the scaffold can never drift
from a runnable app.

## License

MIT
