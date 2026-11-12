import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

import { parseSnapArgs, routeSlug } from './options.ts';
import { formatReport } from './report.ts';
import { snapRoute } from './snap.ts';

// Çıktı her zaman depo kökündeki .artifacts/screens/<rota> klasörüne yazılır (git dışı).
const ARTIFACTS = fileURLToPath(new URL('../../.artifacts/screens/', import.meta.url));

async function main(): Promise<number> {
  const options = parseSnapArgs(process.argv.slice(2));
  const outDir = join(ARTIFACTS, routeSlug(options.route));
  // Eski görüntüler karışmasın: rota klasörü her çalıştırmada sıfırlanır.
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  try {
    const report = await snapRoute(browser, options, outDir);
    writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
    process.stdout.write(`${formatReport(report)}\n`);
    // Sayfa hiç açılamadıysa (sunucu hatası) araç başarısız sayılır; taşma ve konsol hataları ise uyarıdır.
    return report.widths.some((width) => width.status === null || width.status >= 500) ? 1 : 0;
  } finally {
    await browser.close();
  }
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    const hint = message.includes('ERR_CONNECTION_REFUSED')
      ? '\nUygulama çalışmıyor gibi görünüyor: önce `pnpm dev` ile başlatın.'
      : '';
    process.stderr.write(`ui:snap başarısız: ${message}${hint}\n`);
    process.exitCode = 1;
  },
);
