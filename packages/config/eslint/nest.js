// @ts-check
import { defineConfig } from 'eslint/config';

import { baseConfig } from './base.js';

/**
 * NestJS API'si (apps/api) için ESLint yapılandırması.
 * @param {string} tsconfigRootDir Çağıran uygulamanın klasörü.
 */
export function nestConfig(tsconfigRootDir) {
  return defineConfig(baseConfig(tsconfigRootDir), {
    rules: {
      // Nest modülleri gövdesi boş, yalnızca dekoratörlü sınıflardır (`@Module({...}) class X {}`).
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
    },
  });
}
