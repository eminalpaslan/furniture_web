// @ts-check
import js from '@eslint/js';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// esquery regex'leri "/" karakteri içeremez; bu yüzden desenler eğik çizgisiz yazıldı.
const HEX_COLOR = String.raw`/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/`;
// Tailwind keyfi değeri: `w-[37px]`, `md:bg-[var(--x)]`. `data-[state=open]:` gibi keyfi *varyantlar* serbesttir,
// çünkü sınıf `]` ile değil `:` ile devam eder.
const TAILWIND_ARBITRARY = String.raw`/(?:^|\s)!?-?(?:[a-z0-9-]+:)*[a-z][a-z0-9-]*-\[[^\]\s]+\](?=\s|$)/`;

const HEX_MESSAGE =
  'Ham hex renk yasak; tasarım token’ı kullan (CLAUDE.md §1-11, DESIGN_SYSTEM §2).';
const ARBITRARY_MESSAGE =
  'Tailwind keyfi değeri (`[...]`) yasak; önce token ekle (CLAUDE.md §1-11, DESIGN_SYSTEM).';

/**
 * Tüm paketlerin ortak ESLint yapılandırması.
 * @param {string} tsconfigRootDir Tipe duyarlı kuralların tsconfig'i arayacağı kök (çağıran paketin klasörü).
 */
export function baseConfig(tsconfigRootDir) {
  return defineConfig(
    {
      ignores: ['**/dist/**', '**/.next/**', '**/coverage/**', '**/.turbo/**', '**/next-env.d.ts'],
    },
    // `eslint-disable` yalnızca gerekçe yazılarak kullanılabilir; artık gereksiz olanlar da hata
    // sayılır (CLAUDE.md §1-5). Örnek: `// eslint-disable-next-line kural -- neden gerekli`
    { linterOptions: { reportUnusedDisableDirectives: 'error' } },
    eslintComments.recommended,
    { rules: { '@eslint-community/eslint-comments/require-description': 'error' } },
    js.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        globals: globals.node,
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      plugins: { 'simple-import-sort': simpleImportSort },
      rules: {
        'no-console': 'error',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
      },
    },
    {
      files: ['**/*.{js,mjs,cjs}'],
      extends: [tseslint.configs.disableTypeChecked],
    },
    {
      files: ['**/*.{jsx,tsx}'],
      rules: {
        'no-restricted-syntax': [
          'error',
          { selector: `Literal[value=${HEX_COLOR}]`, message: HEX_MESSAGE },
          { selector: `TemplateElement[value.raw=${HEX_COLOR}]`, message: HEX_MESSAGE },
          { selector: `Literal[value=${TAILWIND_ARBITRARY}]`, message: ARBITRARY_MESSAGE },
          {
            selector: `TemplateElement[value.raw=${TAILWIND_ARBITRARY}]`,
            message: ARBITRARY_MESSAGE,
          },
        ],
      },
    },
    // En sonda: biçimlendirmeyle ilgili kuralları kapatır, biçim işini Prettier'a bırakır.
    prettier,
  );
}
