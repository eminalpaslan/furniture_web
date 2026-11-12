import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { validApiEnv } from './support/valid-env.js';

// Derlenmiş süreçleri (`pnpm build` çıktısı) gerçek bir alt süreç olarak başlatır: kabul kriteri
// "zorunlu değişken silinince uygulama hangi değişkenin eksik olduğunu söyleyerek kapanıyor" (ROADMAP F0.5).
const entries = {
  api: fileURLToPath(new URL('../dist/main.js', import.meta.url)),
  worker: fileURLToPath(new URL('../dist/main.worker.js', import.meta.url)),
};

function startWithout(entry: string, missing: keyof typeof validApiEnv) {
  const env: NodeJS.ProcessEnv = { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot };
  for (const [key, value] of Object.entries(validApiEnv)) if (key !== missing) env[key] = value;
  return spawnSync(process.execPath, [entry], { env, encoding: 'utf8', timeout: 20_000 });
}

describe.each(Object.entries(entries))('%s süreci', (_name, entry) => {
  it('DATABASE_URL eksikken değişkenin adını yazıp 1 koduyla kapanır', () => {
    const result = startWithout(entry, 'DATABASE_URL');

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('DATABASE_URL: eksik');
    expect(result.stdout).not.toContain('listening');
  });
});
