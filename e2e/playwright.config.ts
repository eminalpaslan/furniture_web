import { defineConfig, devices } from '@playwright/test';

import { ADMIN_URL, API_URL, WEB_URL } from './support/urls';

const isCI = Boolean(process.env.CI);

// Uygulamalar derlenmiş (production) hâlleriyle başlatılır; `pnpm e2e` önce turbo ile build alır.
// Lokalde zaten çalışan bir sunucu varsa (ör. `pnpm dev`) onu kullanır.
const server = (filter: string, url: string) => ({
  command: `pnpm --filter ${filter} start`,
  url,
  reuseExistingServer: !isCI,
  timeout: 120_000,
});

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: WEB_URL,
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    server('@mobilya/api', `${API_URL}/health/live`),
    server('@mobilya/web', WEB_URL),
    server('@mobilya/admin', ADMIN_URL),
  ],
});
