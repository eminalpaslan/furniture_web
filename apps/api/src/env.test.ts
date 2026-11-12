import { EnvValidationError, parseEnv } from '@mobilya/utils/env';
import { describe, expect, it } from 'vitest';

import { validApiEnv } from '../test/support/valid-env.js';
import { apiEnvSchema } from './env.js';

function withoutKey(key: keyof typeof validApiEnv): Record<string, string> {
  return Object.fromEntries(Object.entries(validApiEnv).filter(([name]) => name !== key));
}

describe('apiEnvSchema', () => {
  it('örnek ortamı kabul eder ve sayıları dönüştürür', () => {
    const env = parseEnv(apiEnvSchema, validApiEnv);

    expect(env.API_PORT).toBe(4999);
    expect(env.SMTP_PORT).toBe(11025);
  });

  it('API_PORT verilmezse 4000 kullanır', () => {
    expect(parseEnv(apiEnvSchema, withoutKey('API_PORT')).API_PORT).toBe(4000);
  });

  it.each(['DATABASE_URL', 'REDIS_URL', 'MEILI_MASTER_KEY', 'S3_SECRET_KEY', 'SMTP_HOST'] as const)(
    '%s eksikse adıyla birlikte reddeder',
    (key) => {
      expect(() => parseEnv(apiEnvSchema, withoutKey(key))).toThrow(EnvValidationError);
      expect(() => parseEnv(apiEnvSchema, withoutKey(key))).toThrow(key);
    },
  );

  it('veritabanı adresinin postgres olmasını şart koşar', () => {
    expect(() =>
      parseEnv(apiEnvSchema, { ...validApiEnv, DATABASE_URL: 'mysql://localhost/db' }),
    ).toThrow('DATABASE_URL');
  });
});
