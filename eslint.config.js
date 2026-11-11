import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'server/node_modules/**',
      'dist/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      '.features-gen/**',
      'migrated_prompt_history/**',
      'struktur-model-testing/**',
      'features/**',
      'steps/**',
      'vite.config.ts',
      'playwright.config.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          // Izinkan pola rest-omit: const { dipakai, ...sisa } = obj;
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['server/**/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.commonjs },
      sourceType: 'commonjs',
      parserOptions: { ecmaVersion: 2022 },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'vitest.setup.ts', 'server/tests/**/*.js'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
