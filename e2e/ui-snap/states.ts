import type { Page } from '@playwright/test';

import type { SnapState } from './options.ts';

// --selector verilmezse her durum için sayfadaki ilk uygun öğe kullanılır.
const DEFAULT_SELECTORS: Record<SnapState, string> = {
  hover: 'a[href], button',
  focus: 'a[href], button, input, select, textarea',
  menu: '[aria-haspopup="true"], [aria-haspopup="menu"], [aria-expanded="false"]',
};

// Menü/hover geçişlerinin bitmesi için (DESIGN_SYSTEM §6 süreleri bunun altında kalır).
const SETTLE_MS = 400;

/**
 * Sayfayı istenen etkileşim durumuna getirir. Uygun öğe yoksa açıklama döndürür (görüntü alınmaz).
 * Odak için önce Tab'a basılır: tarayıcı klavye kipine geçer ve `:focus-visible` halkası görünür.
 */
export async function enterState(
  page: Page,
  state: SnapState,
  selector: string | undefined,
): Promise<string | null> {
  const target = page.locator(selector ?? DEFAULT_SELECTORS[state]).first();
  if ((await target.count()) === 0 || !(await target.isVisible())) {
    return `${state}: "${selector ?? DEFAULT_SELECTORS[state]}" ile eşleşen görünür öğe yok`;
  }

  switch (state) {
    case 'hover':
      await target.hover();
      break;
    case 'focus':
      await page.keyboard.press('Tab');
      await target.focus();
      break;
    case 'menu':
      await target.click();
      break;
  }
  await page.waitForTimeout(SETTLE_MS);
  return null;
}
