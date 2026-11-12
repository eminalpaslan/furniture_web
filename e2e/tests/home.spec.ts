import { expect, test } from '@playwright/test';

import { expectNoA11yViolations } from '../support/a11y';
import { adminMessages, webMessages } from '../support/messages';
import { ADMIN_URL } from '../support/urls';

test.describe('vitrin', () => {
  test('ana sayfa Türkçe dil etiketi ve başlıkla açılır', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
    await expect(page).toHaveTitle(webMessages.meta.title);
  });

  test(
    'ana sayfada ciddi/kritik erişilebilirlik ihlali yok',
    { tag: '@a11y' },
    async ({ page }) => {
      await page.goto('/');

      await expectNoA11yViolations(page);
    },
  );
});

test.describe('yönetim paneli', () => {
  test('arama motorlarına kapalıdır', async ({ page }) => {
    await page.goto(ADMIN_URL);

    await expect(page).toHaveTitle(adminMessages.meta.title);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });

  test(
    'ana sayfada ciddi/kritik erişilebilirlik ihlali yok',
    { tag: '@a11y' },
    async ({ page }) => {
      await page.goto(ADMIN_URL);

      await expectNoA11yViolations(page);
    },
  );
});
