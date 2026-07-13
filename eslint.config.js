import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default tseslint.config(
  {
    name: 'js/ts-recommended',
    files: ['**/*.ts', '**/*.js'],
    ignores: ['**/*.svelte.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: globals.browser,
    },
  },
  ...eslintPluginSvelte.configs['flat/recommended'],
  {
    name: 'svelte-ts-parser',
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'svelte/valid-compile': ['error', { ignoreWarnings: false }],
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '.vscode/', '.worktrees/'],
  },
);
