#!/usr/bin/env node
/**
 * Copies the reference app into `packages/create-app/template` so the
 * scaffolder can ship a self-contained template (the reference app stays the
 * single source of truth). Runs automatically on `pnpm pack` / publish.
 */
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = resolve(__dirname, '..');
const REPO_ROOT = resolve(PACKAGE_DIR, '..', '..');
const SOURCE_DIR = join(REPO_ROOT, 'apps', 'reference');
const OUT_DIR = join(PACKAGE_DIR, 'template');
const DASHBOARD_PKG = join(REPO_ROOT, 'packages', 'dashboard', 'package.json');

const EXCLUDED_DIRS = new Set(['node_modules', '.svelte-kit', 'dist', 'target', 'gen', '.turbo']);
const EXCLUDED_FILES = new Set([
  'app-icon.png',
  'pnpm-lock.yaml',
  'package-lock.json',
  '.DS_Store'
]);

if (!existsSync(SOURCE_DIR)) {
  console.error(`✖ Reference app not found: ${SOURCE_DIR}`);
  process.exit(1);
}

rmSync(OUT_DIR, { recursive: true, force: true });
cpSync(SOURCE_DIR, OUT_DIR, {
  recursive: true,
  filter: (source) => {
    const base = source.split(/[\\/]/).pop() ?? '';
    if (EXCLUDED_DIRS.has(base) || EXCLUDED_FILES.has(base)) return false;
    if (base.endsWith('.tgz')) return false;
    return true;
  }
});

const dashboardVersion = JSON.parse(readFileSync(DASHBOARD_PKG, 'utf8')).version;
const pkgPath = join(OUT_DIR, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.dependencies ??= {};

if (pkg.dependencies['@tauri-desk/dashboard']) {
  pkg.dependencies['@tauri-desk/dashboard'] = `^${dashboardVersion}`;
}

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log(`✔ Template synced to ${OUT_DIR} (@tauri-desk/dashboard@^${dashboardVersion})`);
