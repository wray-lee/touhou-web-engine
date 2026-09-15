import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        performance: 'readonly',
        AudioContext: 'readonly',
        HTMLAudioElement: 'readonly',
        navigator: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        addEventListener: 'readonly',
        removeEventListener: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      // The `BulletWorld` bridges hand the transform handlers live getters over the
      // player, the RNG and the etama tables, so they capture `this` as `self` inside
      // an object literal: those getters would read the world object itself otherwise.
      '@typescript-eslint/no-this-alias': ['error', { allowedNames: ['self'] }],
      // TypeScript already resolves identifiers; no-undef false-positives on DOM lib types
      'no-undef': 'off',
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.ts',
      '*.config.js',
      'src/**/*.test.ts',
    ],
  },
];
