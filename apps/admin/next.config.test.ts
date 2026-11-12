import type * as utilsEnv from '@mobilya/utils/env';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// next.config.ts, `next dev` / `next build` açılışında çalışan ilk koddur (ROADMAP F0.5 kabul kriteri).
// Kök .env okuması devre dışı bırakılır ki test yalnızca verilen ortamla çalışsın.
vi.mock('@mobilya/utils/env', async (importOriginal) => ({
  ...(await importOriginal<typeof utilsEnv>()),
  loadEnvFileIfExists: vi.fn(),
}));

describe('next.config açılışı', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('API_URL eksikse adını yazıp 1 koduyla kapanır', async () => {
    vi.stubEnv('API_URL', undefined);
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    await import('./next.config');

    expect(exit).toHaveBeenCalledWith(1);
    expect(stderr).toHaveBeenCalledWith(expect.stringContaining('API_URL: eksik'));
  });

  it('geçerli ortamda kapanmaz', async () => {
    vi.stubEnv('API_URL', 'http://localhost:4000');
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    const { default: config } = await import('./next.config');

    expect(exit).not.toHaveBeenCalled();
    expect(config.poweredByHeader).toBe(false);
  });
});
