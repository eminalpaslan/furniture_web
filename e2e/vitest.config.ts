import { defineConfig } from 'vitest/config';

// Yalnızca ui:snap'in saf yardımcılarının birim testleri; tarayıcı testleri Playwright'tadır (tests/).
export default defineConfig({
  test: {
    include: ['ui-snap/**/*.test.ts'],
  },
});
