import type { SnapReport, WidthReport } from './snap.ts';

function formatWidth(report: WidthReport): string[] {
  const lines = [`■ ${String(report.width)} px — HTTP ${String(report.status ?? '?')}`];
  for (const file of report.files) lines.push(`  görüntü: ${file}`);

  if (report.overflow === null) {
    lines.push('  ✔ yatay taşma yok');
  } else {
    const { scrollWidth, clientWidth, offenders } = report.overflow;
    lines.push(`  ⚠ YATAY TAŞMA: sayfa ${String(scrollWidth)}px, ekran ${String(clientWidth)}px`);
    for (const offender of offenders) lines.push(`      ${offender}`);
  }

  if (report.errors.length === 0) {
    lines.push('  ✔ konsol hatası yok');
  } else {
    lines.push(`  ⚠ KONSOL/AĞ HATASI (${String(report.errors.length)}):`);
    for (const error of report.errors) lines.push(`      ${error}`);
  }

  for (const note of report.notes) lines.push(`  ℹ ${note}`);
  return lines;
}

/** Terminalde okunacak rapor. Uyarılar ⚠ ile başlar; görsel kontrolde bunlar tek tek ele alınır. */
export function formatReport(report: SnapReport): string {
  return [
    `ui:snap ${report.route} → ${report.url}`,
    `çıktı: ${report.outDir}`,
    '',
    ...report.widths.flatMap((width) => [...formatWidth(width), '']),
    `Özet: ${String(countWarnings(report))} uyarı.`,
  ].join('\n');
}

export function countWarnings(report: SnapReport): number {
  return report.widths.reduce(
    (total, width) => total + (width.overflow === null ? 0 : 1) + width.errors.length,
    0,
  );
}
