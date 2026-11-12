import type { Page } from '@playwright/test';

export interface OverflowReport {
  scrollWidth: number;
  clientWidth: number;
  /** Görünür alanın dışına taşan ilk öğeler (`etiket#id.sınıf → sağ kenar px`). */
  offenders: string[];
}

/** Sayfa yatay olarak taşıyorsa ölçüleri ve taşmaya neden olan öğeleri döndürür; taşmıyorsa `null`. */
export async function measureOverflow(page: Page): Promise<OverflowReport | null> {
  return page.evaluate(() => {
    const root = document.documentElement;
    if (root.scrollWidth <= root.clientWidth) return null;

    const describe = (el: Element) => {
      const id = el.id ? `#${el.id}` : '';
      const classes = [...el.classList]
        .slice(0, 2)
        .map((name) => `.${name}`)
        .join('');
      return `${el.tagName.toLowerCase()}${id}${classes} → sağ kenar ${String(Math.round(el.getBoundingClientRect().right))}px`;
    };
    const offenders = [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > root.clientWidth + 1)
      .slice(0, 5)
      .map(describe);

    return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, offenders };
  });
}

/**
 * Sayfa açıkken oluşan konsol hatalarını, yakalanmamış istisnaları ve başarısız istekleri toplar.
 * Durum görüntüleri için sayfa yeniden yüklendiğinde aynı hata tekrar oluşur; her hata bir kez listelenir.
 */
export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  const add = (error: string) => {
    if (!errors.includes(error)) errors.push(error);
  };
  page.on('console', (message) => {
    if (message.type() === 'error') add(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => {
    add(`sayfa hatası: ${error.message}`);
  });
  page.on('requestfailed', (request) => {
    add(`başarısız istek: ${request.url()} (${request.failure()?.errorText ?? 'bilinmiyor'})`);
  });
  return errors;
}

/** Görselleri, fontları ve ağ isteklerini bekler; ekran görüntüsü yarım yüklenmiş sayfayı göstermesin. */
export async function waitForStablePage(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}
