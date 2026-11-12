// @ts-check
import nextPlugin from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

import { baseConfig } from './base.js';

/**
 * Next.js uygulamaları (apps/web, apps/admin) için ESLint yapılandırması.
 * @param {string} tsconfigRootDir Çağıran uygulamanın klasörü.
 */
export function nextConfig(tsconfigRootDir) {
  return defineConfig(
    baseConfig(tsconfigRootDir),
    nextPlugin.configs['core-web-vitals'],
    reactHooks.configs.flat.recommended,
    {
      languageOptions: { globals: { ...globals.browser, ...globals.node } },
    },
  );
}
