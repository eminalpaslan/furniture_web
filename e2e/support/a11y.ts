import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// DESIGN_SYSTEM §10: hedef WCAG 2.2 AA.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Sayfayı axe ile tarar. Tüm bulgular rapora ek olarak eklenir; **ciddi** ve **kritik** ihlaller testi
 * düşürür (CLAUDE.md §4.1 G6). Hafif/orta bulgular raporda görünür, F10.3 erişilebilirlik turunda ele alınır.
 */
export async function expectNoA11yViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  await test.info().attach('axe-ihlalleri.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  const blocking = results.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map(
      (violation) =>
        `${violation.id} (${String(violation.impact)}): ${violation.help} — ${String(violation.nodes.length)} öğe`,
    );

  expect(blocking, 'Ciddi/kritik erişilebilirlik ihlali bulunmamalı').toEqual([]);
}
