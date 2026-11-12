import { join } from 'node:path';

import type { Browser } from '@playwright/test';

import { type SnapOptions, WIDTHS } from './options.ts';
import {
  collectPageErrors,
  measureOverflow,
  type OverflowReport,
  waitForStablePage,
} from './page-checks.ts';
import { enterState } from './states.ts';

export interface WidthReport {
  width: number;
  status: number | null;
  files: string[];
  overflow: OverflowReport | null;
  errors: string[];
  notes: string[];
}

export interface SnapReport {
  route: string;
  url: string;
  outDir: string;
  widths: WidthReport[];
}

const viewportFor = (width: number) => ({ width, height: width < 768 ? 812 : 900 });

async function snapWidth(
  browser: Browser,
  options: SnapOptions,
  outDir: string,
  width: number,
): Promise<WidthReport> {
  const context = await browser.newContext({ viewport: viewportFor(width), locale: 'tr-TR' });
  const page = await context.newPage();
  const errors = collectPageErrors(page);
  const report: WidthReport = { width, status: null, files: [], overflow: null, errors, notes: [] };

  try {
    const response = await page.goto(options.url);
    report.status = response?.status() ?? null;
    await waitForStablePage(page);
    report.overflow = await measureOverflow(page);

    const fullPage = join(outDir, `${String(width)}-full.png`);
    await page.screenshot({ path: fullPage, fullPage: true });
    report.files.push(fullPage);

    for (const state of options.states) {
      // Her durum temiz sayfadan başlar; önceki hover/menü bir sonrakini etkilemesin.
      await page.reload();
      await waitForStablePage(page);
      const note = await enterState(page, state, options.selector);
      if (note !== null) {
        report.notes.push(note);
        continue;
      }
      const file = join(outDir, `${String(width)}-${state}.png`);
      await page.screenshot({ path: file });
      report.files.push(file);
    }
  } finally {
    await context.close();
  }
  return report;
}

/** Rotayı dört genişlikte açar, ekran görüntülerini `outDir`'e kaydeder ve bulguları raporlar (CLAUDE.md §4.2). */
export async function snapRoute(
  browser: Browser,
  options: SnapOptions,
  outDir: string,
): Promise<SnapReport> {
  const widths: WidthReport[] = [];
  for (const width of WIDTHS) widths.push(await snapWidth(browser, options, outDir, width));
  return { route: options.route, url: options.url, outDir, widths };
}
