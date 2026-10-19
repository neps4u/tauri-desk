#!/usr/bin/env node
/**
 * create-tauri-desk-app
 *
 * Scaffolds a new Tauri 2 + Svelte 5 dashboard app by copying the reference app
 * (single source of truth for the shell) and rewriting identifiers.
 *
 * Usage:
 *   pnpm create @tauri-desk/app my-app
 *   node packages/create-app/index.js my-app --id com.acme.myapp --product "My App"
 *
 * Options:
 *   --id <bundle.id>        Bundle identifier (default: com.tauridesk.<slug>)
 *   --product <name>        Product / window title (default: derived from app name)
 *   --scope <@scope>        npm scope for the app package (default: none)
 *   --dashboard <spec>      @tauri-desk/dashboard dependency spec
 *                           (default: workspace:* inside this repo, else ^0.1.0)
 *   --install               Run `pnpm install` after scaffolding
 *   --yes                   Skip prompts, use defaults
 *   -h, --help              Show help
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const BUNDLED_TEMPLATE = path.join(__dirname, 'template');
const REPO_TEMPLATE = path.join(REPO_ROOT, 'apps', 'reference');
const TEMPLATE_DIR = fs.existsSync(BUNDLED_TEMPLATE) ? BUNDLED_TEMPLATE : REPO_TEMPLATE;
const DEFAULT_DASHBOARD_SPEC = '^0.1.0';

const EXCLUDE = new Set(['node_modules', '.svelte-kit', 'dist', 'target', 'gen', '.turbo']);
const EXCLUDE_FILES = new Set(['app-icon.png', 'pnpm-lock.yaml', 'package-lock.json']);
const TEXT_EXT = new Set([
  '.ts',
  '.js',
  '.svelte',
  '.json',
  '.toml',
  '.html',
  '.rs',
  '.css',
  '.md',
  '.mjs',
  '.cjs'
]);

const args = process.argv.slice(2);
const flags = parseFlags(args);

if (flags.help) {
  printHelp();
  process.exit(0);
}

main().catch((error) => {
  console.error(`\n✖ ${error.message}`);
  process.exit(1);
});

async function main() {
  const rl = flags.yes ? null : readline.createInterface({ input, output });
  try {
    const appName = flags._[0] ?? (rl ? await ask(rl, 'App name', 'my-dashboard-app') : null);
    if (!appName) throw new Error('An app name is required.');

    const slug = toSlug(appName);
    const productName =
      flags.product ??
      (rl ? await ask(rl, 'Product / window title', toTitle(appName)) : toTitle(appName));
    const bundleId =
      flags.id ??
      (rl ? await ask(rl, 'Bundle identifier', `com.tauridesk.${slug}`) : `com.tauridesk.${slug}`);
    const scope = flags.scope ?? '';

    const targetDir = path.resolve(process.cwd(), appName);

    if (!fs.existsSync(TEMPLATE_DIR)) {
      throw new Error(`Template directory not found: ${TEMPLATE_DIR}`);
    }
    if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
      throw new Error(`Target directory already exists and is not empty: ${targetDir}`);
    }

    const insideRepo =
      isInside(targetDir, REPO_ROOT) && fs.existsSync(path.join(REPO_ROOT, 'pnpm-workspace.yaml'));
    const dashboardSpec =
      flags.dashboard ?? (insideRepo ? 'workspace:*' : readTemplateDashboardSpec());

    console.log(`\n▸ Creating ${productName} in ${targetDir}`);
    copyTemplate(TEMPLATE_DIR, targetDir);

    const libName = `${slug.replace(/-/g, '_')}_lib`;
    const packageName = scope ? `${scope}/${slug}` : slug;

    rewriteFiles(targetDir, {
      $BUNDLE_ID: bundleId,
      $PRODUCT_NAME: productName,
      $LIB_NAME: libName,
      $CARGO_PKG: slug,
      $PKG_NAME: packageName
    });
    setDashboardDependency(path.join(targetDir, 'package.json'), dashboardSpec);

    if (!insideRepo) {
      writeWorkspaceFile(targetDir, slug);
    }

    if (flags.install) {
      console.log('\n▸ Installing dependencies (pnpm install)…');
      const result = spawnSync('pnpm', ['install'], {
        cwd: targetDir,
        stdio: 'inherit',
        shell: true
      });
      if (result.status !== 0) console.warn('! pnpm install failed — run it manually.');
    }

    printSuccess({ appName, productName, bundleId, targetDir, dashboardSpec });
  } finally {
    rl?.close();
  }
}

function readTemplateDashboardSpec() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(TEMPLATE_DIR, 'package.json'), 'utf8'));
    const spec = pkg.dependencies?.['@tauri-desk/dashboard'];
    return typeof spec === 'string' && spec !== 'workspace:*' ? spec : DEFAULT_DASHBOARD_SPEC;
  } catch {
    return DEFAULT_DASHBOARD_SPEC;
  }
}

function parseFlags(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') out.help = true;
    else if (arg === '--yes' || arg === '-y') out.yes = true;
    else if (arg === '--install') out.install = true;
    else if (arg === '--id') out.id = argv[++i];
    else if (arg === '--product') out.product = argv[++i];
    else if (arg === '--scope') out.scope = argv[++i];
    else if (arg === '--dashboard') out.dashboard = argv[++i];
    else out._.push(arg);
  }
  return out;
}

function copyTemplate(src, dest) {
  fs.cpSync(src, dest, {
    recursive: true,
    filter: (source) => {
      const base = path.basename(source);
      if (EXCLUDE.has(base) || EXCLUDE_FILES.has(base)) return false;
      return true;
    }
  });
  fs.rmSync(path.join(dest, 'app-icon.png'), { force: true });
}

function rewriteFiles(dir, tokens) {
  const replacements = [
    [/com\.tauridesk\.app/g, tokens.$BUNDLE_ID],
    [/Tauri Desk/g, tokens.$PRODUCT_NAME],
    [/tauri_desk_lib/g, tokens.$LIB_NAME],
    [/name = "tauri-desk"/g, `name = "${tokens.$CARGO_PKG}"`],
    [/"name": "@tauri-desk\/reference"/g, `"name": "${tokens.$PKG_NAME}"`]
  ];

  for (const file of walk(dir)) {
    if (!TEXT_EXT.has(path.extname(file))) continue;
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    for (const [pattern, value] of replacements) {
      if (pattern.test(content)) {
        content = content.replace(pattern, value);
        changed = true;
      }
    }
    if (changed) fs.writeFileSync(file, content);
  }
}

function setDashboardDependency(pkgPath, spec) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkg.dependencies?.['@tauri-desk/dashboard']) {
    pkg.dependencies['@tauri-desk/dashboard'] = spec;
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function writeWorkspaceFile(dir, slug) {
  fs.writeFileSync(
    path.join(dir, '.npmrc'),
    ['engine-strict=false', 'auto-install-peers=true', 'strict-peer-dependencies=false', ''].join(
      '\n'
    )
  );
  const readme = [
    `# ${slug}`,
    '',
    'Scaffolded with `@tauri-desk/create-app`.',
    '',
    '## Getting started',
    '',
    '```bash',
    'pnpm install',
    'pnpm dev          # frontend only (browser)',
    'pnpm tauri dev    # full desktop app',
    '```',
    '',
    '## Notes',
    '',
    '- The dashboard shell lives in `@tauri-desk/dashboard`. Once that package is published,',
    '  update its version in `package.json` and run `pnpm up @tauri-desk/dashboard` to pull changes.',
    '- Replace the updater `endpoints`/`pubkey` in `src-tauri/tauri.conf.json` before shipping.',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'README.md'), readme);
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE.has(entry.name)) continue;
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function printSuccess({ appName, productName, bundleId, targetDir, dashboardSpec }) {
  const rel = path.relative(process.cwd(), targetDir) || appName;
  console.log(`\n✔ ${productName} created at ${rel}`);
  console.log(`  bundle identifier : ${bundleId}`);
  console.log(`  dashboard dep     : @tauri-desk/dashboard@${dashboardSpec}`);
  console.log('\nNext steps:');
  console.log(`  cd ${rel}`);
  if (!flags.install) console.log('  pnpm install');
  console.log('  pnpm tauri dev\n');
}

function printHelp() {
  console.log('create-tauri-desk-app — scaffold a Tauri 2 + Svelte 5 dashboard app\n');
  console.log('Usage: node index.js <app-name> [options]\n');
  console.log('Options:');
  console.log('  --id <bundle.id>    Bundle identifier (default com.tauridesk.<slug>)');
  console.log('  --product <name>    Product / window title');
  console.log('  --scope <@scope>    npm scope for the app package');
  console.log('  --dashboard <spec>  @tauri-desk/dashboard dependency spec');
  console.log('  --install           Run pnpm install afterwards');
  console.log('  -y, --yes           Skip prompts, use defaults');
  console.log('  -h, --help          Show this help');
}

async function ask(rl, question, fallback) {
  const answer = (await rl.question(`${question} (${fallback}): `)).trim();
  return answer || fallback;
}

function toSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toTitle(name) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function isInside(child, parent) {
  const rel = path.relative(parent, child);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}
