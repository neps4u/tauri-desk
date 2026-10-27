# Contributing

Thanks for taking the time to contribute! This is a pnpm monorepo with three
workspace packages:

| Path                  | Package                  | Purpose                                   |
| --------------------- | ------------------------ | ----------------------------------------- |
| `packages/dashboard`  | `@tauri-desk/dashboard`  | Reusable Tauri 2 + Svelte 5 shell library |
| `packages/create-app` | `@tauri-desk/create-app` | Scaffolder CLI                            |
| `apps/reference`      | `@tauri-desk/reference`  | Runnable reference app (private)          |

## Setup

```bash
corepack enable
pnpm install
```

Rust + the [Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/) are
required for `pnpm tauri dev` / `pnpm tauri build`.

## Development workflow

- `pnpm dev` — Vite dev server (browser) for the reference app
- `pnpm tauri dev` — full desktop app
- `pnpm test` — Vitest unit + component tests
- `pnpm check` — `svelte-check`
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm format` / `pnpm format:check` — Prettier

Keep the dashboard package free of app-specific assumptions: anything used by the
reference app but not reusable belongs in `apps/reference`.

### Tests

Tests live in `packages/dashboard/tests` (kept outside `src/lib` so they are never
published). Prefer unit tests for pure logic/stores and add component tests with
`@testing-library/svelte` where behaviour matters. The store modules are singletons
(`settings`, `i18n`, `auth`) — reset them in `beforeEach` when shared.

### The reference app is the template

`packages/create-app` copies `apps/reference` (via
`scripts/sync-template.mjs`, run automatically on `prepack`). If you change the
reference app, the next scaffold picks it up — no duplicate template to maintain.

## Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`,
`docs:`, `chore:`, `refactor:`, `test:`, scoped where helpful (e.g.
`feat(dashboard): add tooltip`).

## Releases (Changesets)

This repo uses [Changesets](https://github.com/changesets/changesets).

1. Add a changeset for any user-facing change to a published package:
   ```bash
   pnpm changeset
   ```
2. Commit the generated markdown file with your change.
3. On merge to `main`, the release workflow opens a **Version Packages** PR.
   Merging it publishes to npm (`@tauri-desk/dashboard`, `@tauri-desk/create-app`).

The workflow needs an `NPM_TOKEN` repository secret (or npm trusted publishing).
Private packages (`@tauri-desk/reference`) are never versioned or published.

## Before publishing

Verify the publishable packages locally:

```bash
pnpm --filter @tauri-desk/dashboard build
pnpm --filter @tauri-desk/dashboard publint
pnpm --filter @tauri-desk/dashboard attw
```

`attw` deliberately ignores `internal-resolution-error` and `cjs-resolves-to-esm`
(Svelte component libraries are bundler-only) and the `./theme.css` entrypoint
(CSS has no types). `publint` and the `bundler` resolution must stay green.

## Pull request checklist

- [ ] `pnpm lint && pnpm format:check && pnpm check && pnpm test` pass locally
- [ ] Dashboard build is clean (`pnpm --filter @tauri-desk/dashboard build`)
- [ ] A changeset is included for user-facing changes
- [ ] Docs updated (`README.md`, package READMEs) when the public API changes
