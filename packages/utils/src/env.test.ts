import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { EnvValidationError, loadEnvFileIfExists, parseEnv, parseEnvOrExit } from './env.js';

const schema = z.object({
  DATABASE_URL: z.url(),
  API_PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

function captureError(fn: () => unknown): EnvValidationError {
  try {
    fn();
  } catch (error) {
    if (error instanceof EnvValidationError) return error;
    throw error;
  }
  throw new Error('parseEnv hata fırlatmadı');
}

describe('parseEnv', () => {
  it('geçerli değerleri dönüştürüp döndürür ve varsayılanları uygular', () => {
    const env = parseEnv(schema, {
      DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
      API_PORT: '4100',
    });

    expect(env).toEqual({
      DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
      API_PORT: 4100,
      NODE_ENV: 'development',
    });
  });

  it('eksik değişkenin adını hata mesajında söyler', () => {
    const error = captureError(() => parseEnv(schema, {}));

    expect(error.message).toContain('DATABASE_URL');
    expect(error.message).toContain('eksik');
    expect(error.variables).toEqual(['DATABASE_URL']);
  });

  it('boş string değeri eksik sayar', () => {
    const error = captureError(() => parseEnv(schema, { DATABASE_URL: '' }));

    expect(error.variables).toEqual(['DATABASE_URL']);
    expect(error.message).toContain('eksik');
  });

  it('geçersiz değerleri neden geçersiz olduklarıyla birlikte listeler', () => {
    const error = captureError(() =>
      parseEnv(schema, { DATABASE_URL: 'adres-degil', API_PORT: 'dörtbin', NODE_ENV: 'staging' }),
    );

    expect(error.variables).toEqual(['DATABASE_URL', 'API_PORT', 'NODE_ENV']);
    expect(error.message).not.toContain('eksik');
  });

  it('gizli değerleri hata mesajına yazmaz', () => {
    const secretSchema = z.object({ S3_SECRET_KEY: z.string().min(16) });

    const error = captureError(() => parseEnv(secretSchema, { S3_SECRET_KEY: 'kisa-sir' }));

    expect(error.message).toContain('S3_SECRET_KEY');
    expect(error.message).not.toContain('kisa-sir');
  });

  it('şemada olmayan değişkenleri sonuca taşımaz', () => {
    const env = parseEnv(schema, { DATABASE_URL: 'postgresql://localhost/db', PATH: '/usr/bin' });

    expect(env).not.toHaveProperty('PATH');
  });
});

describe('parseEnvOrExit', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('geçerli ortamda değeri döndürür, süreci kapatmaz', () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    expect(parseEnvOrExit(schema, { DATABASE_URL: 'postgresql://localhost/db' }).API_PORT).toBe(
      4000,
    );
    expect(exit).not.toHaveBeenCalled();
  });

  it('geçersiz ortamda nedeni stderr’e yazar ve 1 koduyla çıkar', () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    parseEnvOrExit(schema, {});

    expect(exit).toHaveBeenCalledWith(1);
    expect(stderr).toHaveBeenCalledWith(expect.stringContaining('DATABASE_URL: eksik'));
  });
});

describe('loadEnvFileIfExists', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function writeEnvFile(content: string): string {
    const file = join(mkdtempSync(join(tmpdir(), 'mobilya-env-')), '.env');
    writeFileSync(file, content);
    return file;
  }

  it('istenen değişkenleri yükler ama zaten tanımlı olanı ezmez', () => {
    const file = writeEnvFile('MOBILYA_TEST_NEW=dosyadan\nMOBILYA_TEST_SET=dosyadan\n');
    vi.stubEnv('MOBILYA_TEST_NEW', undefined);
    vi.stubEnv('MOBILYA_TEST_SET', 'ortamdan');

    loadEnvFileIfExists(file, ['MOBILYA_TEST_NEW', 'MOBILYA_TEST_SET']);

    expect(process.env.MOBILYA_TEST_NEW).toBe('dosyadan');
    expect(process.env.MOBILYA_TEST_SET).toBe('ortamdan');
  });

  it('listede olmayan değişkenleri (ör. başka sürecin şifresi) yüklemez', () => {
    const file = writeEnvFile('MOBILYA_TEST_API_URL=http://x\nMOBILYA_TEST_DB_SECRET=gizli\n');
    vi.stubEnv('MOBILYA_TEST_API_URL', undefined);
    vi.stubEnv('MOBILYA_TEST_DB_SECRET', undefined);

    loadEnvFileIfExists(file, ['MOBILYA_TEST_API_URL']);

    expect(process.env.MOBILYA_TEST_API_URL).toBe('http://x');
    expect(process.env.MOBILYA_TEST_DB_SECRET).toBeUndefined();
  });

  it('dosya yoksa hata vermeden geçer', () => {
    expect(() => {
      loadEnvFileIfExists(join(tmpdir(), 'olmayan-klasor', '.env'), ['X']);
    }).not.toThrow();
  });
});
