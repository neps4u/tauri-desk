import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  toSlug,
  validateSlug,
  validateBundleId,
  validateScope,
  validateProductName,
  makeStandaloneTsconfig
} from '../index.js';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('create-app validation', () => {
  describe('toSlug', () => {
    it('normalizes a normal app name', () => {
      assert.strictEqual(toSlug('My Dashboard App'), 'my-dashboard-app');
    });

    it('derives an empty slug from symbols only', () => {
      assert.strictEqual(toSlug('!!!'), '');
    });
  });

  describe('validateSlug', () => {
    it('accepts a valid slug', () => {
      assert.doesNotThrow(() => validateSlug('my-dashboard-app'));
    });

    it('rejects an empty slug', () => {
      assert.throws(() => validateSlug(''), /slug/);
    });

    it('rejects slugs not starting with a letter', () => {
      assert.throws(() => validateSlug('123-app'), /slug/);
    });
  });

  describe('validateBundleId', () => {
    it('accepts reverse-domain identifiers', () => {
      assert.doesNotThrow(() => validateBundleId('com.acme.app'));
      assert.doesNotThrow(() => validateBundleId('com.tauridesk.my-app'));
    });

    it('rejects bare words', () => {
      assert.throws(() => validateBundleId('myapp'), /bundle identifier/);
      assert.throws(() => validateBundleId('com'), /bundle identifier/);
    });
  });

  describe('validateScope', () => {
    it('accepts scoped names', () => {
      assert.doesNotThrow(() => validateScope('@acme'));
      assert.doesNotThrow(() => validateScope('@my-org-1'));
    });

    it('rejects unscoped names', () => {
      assert.throws(() => validateScope('acme'), /scope/);
      assert.throws(() => validateScope('@ACME'), /scope/);
    });
  });

  describe('validateProductName', () => {
    it('rejects quotes and backslashes', () => {
      assert.throws(() => validateProductName('My "Quoted" App'), /product name/);
      assert.throws(() => validateProductName('App\\Name'), /product name/);
    });

    it('rejects control characters', () => {
      assert.throws(() => validateProductName('App\u0001Name'), /product name/);
    });

    it('accepts normal names', () => {
      assert.doesNotThrow(() => validateProductName('My Dashboard App'));
      assert.doesNotThrow(() => validateProductName('Acme Console'));
    });
  });
});

describe('makeStandaloneTsconfig', () => {
  it('inlines base options and drops extends for standalone apps', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tauri-desk-test-'));
    try {
      writeFileSync(
        join(dir, 'tsconfig.json'),
        JSON.stringify(
          {
            extends: '../../tsconfig.base.json',
            compilerOptions: {
              types: ['svelte', 'vite/client', 'node']
            },
            paths: { '$app/*': ['./src/*'] },
            include: ['src/**/*.ts', 'src/**/*.svelte']
          },
          null,
          2
        )
      );

      makeStandaloneTsconfig(dir);

      const out = JSON.parse(readFileSync(join(dir, 'tsconfig.json'), 'utf8'));
      assert.strictEqual(out.extends, undefined);
      assert.strictEqual(out.compilerOptions.target, 'ES2022');
      assert.strictEqual(out.compilerOptions.moduleResolution, 'bundler');
      assert.strictEqual(out.compilerOptions.strict, true);
      assert.strictEqual(out.compilerOptions.types[0], 'svelte');
      assert.deepStrictEqual(out.paths, { '$app/*': ['./src/*'] });
      assert.deepStrictEqual(out.include, ['src/**/*.ts', 'src/**/*.svelte']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('leaves a tsconfig without extends untouched apart from options merge', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tauri-desk-test-'));
    try {
      writeFileSync(
        join(dir, 'tsconfig.json'),
        JSON.stringify({ compilerOptions: { strict: false } }, null, 2)
      );
      makeStandaloneTsconfig(dir);
      const out = JSON.parse(readFileSync(join(dir, 'tsconfig.json'), 'utf8'));
      assert.strictEqual(out.compilerOptions.strict, false); // template wins over defaults
      assert.strictEqual(out.compilerOptions.target, 'ES2022');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
