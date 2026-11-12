import { spawnSync } from 'node:child_process';
import { type AddressInfo, createServer, type Server } from 'node:net';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { validApiEnv } from './support/valid-env.js';

// Derlenmiş süreçleri (`pnpm build` çıktısı) gerçek bir alt süreç olarak başlatır: kabul kriteri
// "zorunlu değişken silinince uygulama hangi değişkenin eksik olduğunu söyleyerek kapanıyor" (ROADMAP F0.5).
const entries = {
  api: fileURLToPath(new URL('../dist/main.js', import.meta.url)),
  worker: fileURLToPath(new URL('../dist/main.worker.js', import.meta.url)),
};

function start(entry: string, env: Record<string, string>) {
  const processEnv: NodeJS.ProcessEnv = {
    PATH: process.env.PATH,
    SystemRoot: process.env.SystemRoot,
    ...env,
  };
  return spawnSync(process.execPath, [entry], {
    env: processEnv,
    encoding: 'utf8',
    timeout: 20_000,
  });
}

function startWithout(entry: string, missing: keyof typeof validApiEnv) {
  const env = Object.fromEntries(Object.entries(validApiEnv).filter(([key]) => key !== missing));
  return start(entry, env);
}

describe.each(Object.entries(entries))('%s süreci', (_name, entry) => {
  it('DATABASE_URL eksikken değişkenin adını yazıp 1 koduyla kapanır', () => {
    const result = startWithout(entry, 'DATABASE_URL');

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('DATABASE_URL: eksik');
    expect(result.stdout).not.toContain('listening');
  });
});

describe('api süreci açılış hatası', () => {
  let blocker: Server;

  beforeAll(async () => {
    blocker = createServer();
    await new Promise<void>((resolve) => blocker.listen(0, resolve));
  });

  afterAll(async () => {
    await new Promise<void>((resolve) =>
      blocker.close(() => {
        resolve();
      }),
    );
  });

  it('port doluysa hatayı loglayıp 1 koduyla kapanır', () => {
    const { port } = blocker.address() as AddressInfo;

    const result = start(entries.api, { ...validApiEnv, API_PORT: String(port) });

    expect(result.status).toBe(1);
    // Ham "unhandled rejection" yığını değil, uygulamanın kendi log'u (Bootstrap bağlamı) görünmeli.
    expect(result.stderr).toMatch(/Bootstrap.*Startup failed/);
    expect(result.stderr).toContain('EADDRINUSE');
  });
});
