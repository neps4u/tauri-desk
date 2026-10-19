import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

const runes = {
  $state: 'readonly',
  $derived: 'readonly',
  $props: 'readonly',
  $effect: 'readonly',
  $bindable: 'readonly',
  $inspect: 'readonly',
  $host: 'readonly'
};

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.svelte-kit/**',
      '**/src-tauri/target/**',
      '**/src-tauri/gen/**',
      '**/create-app/template/**',
      '**/app-icon.png'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node, ...runes }
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }
      ]
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte']
      }
    }
  },
  {
    files: ['**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser
      }
    }
  }
);
