import { defineConfig } from 'vitest/config';

// İki proje: `unit` hızlıdır ve dış bağımlılık istemez; `integration` gerçek süreçler ve
// Docker konteynerleri (Testcontainers) kullanır — Docker Desktop açık olmalı.
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/main.ts', 'src/main.worker.ts'],
      reporter: ['text', 'html'],
    },
    projects: [
      {
        extends: true,
        test: { name: 'unit', include: ['src/**/*.test.ts'] },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['test/**/*.int.test.ts'],
          // Konteyner imajının ilk indirilmesi ve başlatılması uzun sürebilir.
          testTimeout: 30_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
});
