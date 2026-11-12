import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// DESIGN_SYSTEM §10: hedef WCAG 2.2 AA. `best-practice`: başlık sırası, landmark gibi WCAG dışı ama
// ekran okuyucu deneyimini doğrudan etkileyen kurallar da taranır.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

/**
 * Sayfayı axe ile tarar. **Ciddi** ve **kritik** ihlaller testi düşürür (CLAUDE.md §4.1 G6).
 * Orta/hafif bulgular testi düşürmez ama görünmez de kalmaz: test raporuna not (annotation) olarak
 * yazılır ve tüm sonuç JSON ek olarak eklenir; F10.3 erişilebilirlik turunda sıfırlanır.
 */
export async function expectNoA11yViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const describe = (violation: (typeof results.violations)[number]) =>
    `${violation.id} (${String(violation.impact)}): ${violation.help} — ${String(violation.nodes.length)} öğe`;

  const info = test.info();
  await info.attach('axe-ihlalleri.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  const blocking = results.violations.filter((v) => BLOCKING_IMPACTS.has(String(v.impact)));
  const nonBlocking = results.violations.filter((v) => !BLOCKING_IMPACTS.has(String(v.impact)));
  for (const violation of nonBlocking) {
    info.annotations.push({ type: 'a11y (engellemeyen)', description: describe(violation) });
  }

  expect(blocking.map(describe), 'Ciddi/kritik erişilebilirlik ihlali bulunmamalı').toEqual([]);
}
