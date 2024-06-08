import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';

const compat = new FlatCompat();

export default tseslint.config(
  {
    ignores: ['.next/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  ...fixupConfigRules(compat.extends('plugin:@next/next/core-web-vitals')),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '_', argsIgnorePattern: '_' }],
    },
  },
);
