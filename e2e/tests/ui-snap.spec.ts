import { existsSync } from 'node:fs';

import { expect, test } from '@playwright/test';

import { parseSnapArgs } from '../ui-snap/options.ts';
import { countWarnings } from '../ui-snap/report.ts';
import { snapRoute } from '../ui-snap/snap.ts';

// ROADMAP F0.7 kabul kriterleri: kasıtlı yatay taşma → uyarı; konsol hatası → rapor; 4+ görüntü.
const page = (body: string) =>
  `data:text/html;charset=utf-8,${encodeURIComponent(
    `<!doctype html><html lang="tr"><head><title>deneme</title></head><body>${body}</body></html>`,
  )}`;

const OVERFLOWING = page(
  '<main><div id="genis-kutu" style="width:600px">taşan kutu</div><button>Sepete ekle</button></main>' +
    '<script>console.error("kasıtlı konsol hatası")</script>',
);
const CLEAN = page('<main><p>Temiz sayfa</p></main>');

const optionsFor = (url: string, states: string[] = []) => ({
  ...parseSnapArgs(['/deneme', ...(states.length > 0 ? ['--states', states.join(',')] : [])]),
  url,
});

test('ui:snap 4 genişlikte görüntü alır, taşmayı ve konsol hatasını raporlar', async ({
  browser,
}, testInfo) => {
  const report = await snapRoute(
    browser,
    optionsFor(OVERFLOWING, ['hover', 'focus']),
    testInfo.outputDir,
  );

  expect(report.widths.map((width) => width.width)).toEqual([375, 768, 1280, 1440]);
  for (const file of report.widths.flatMap((width) => width.files))
    expect(existsSync(file)).toBe(true);
  expect(report.widths[0]?.files).toHaveLength(3);

  const mobile = report.widths[0];
  expect(mobile?.overflow?.scrollWidth).toBeGreaterThan(375);
  expect(mobile?.overflow?.offenders.join('\n')).toContain('div#genis-kutu');
  // 768 px ve üstünde 600 px'lik kutu sığar.
  expect(report.widths[1]?.overflow).toBeNull();

  expect(mobile?.errors).toContain('console: kasıtlı konsol hatası');
  expect(countWarnings(report)).toBe(1 + 4);
});

test('ui:snap temiz sayfada uyarı vermez ve eksik öğeyi not eder', async ({
  browser,
}, testInfo) => {
  const report = await snapRoute(browser, optionsFor(CLEAN, ['menu']), testInfo.outputDir);

  expect(countWarnings(report)).toBe(0);
  expect(report.widths[0]?.notes[0]).toContain('menu:');
});
