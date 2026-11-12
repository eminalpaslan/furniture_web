import { expect, test } from '@playwright/test';

import { expectNoA11yViolations } from '../support/a11y';

// Yardımcının kendisini doğrular: gerçekten ihlal yakalamayan bir denetim "sahte başarı" olurdu (CLAUDE.md §1-6).
test('erişilebilirlik yardımcısı kritik ihlali yakalar', { tag: '@a11y' }, async ({ page }) => {
  // Alternatif metni olmayan görsel → axe "image-alt" (kritik).
  await page.setContent(
    '<html lang="tr"><head><title>deneme</title></head><body><main><img src="x.png"></main></body></html>',
  );

  await expect(expectNoA11yViolations(page)).rejects.toThrow(/image-alt \(critical\)/);
});
