import { EnvValidationError, parseEnv } from '@mobilya/utils/env';
import { describe, expect, it } from 'vitest';

import { serverEnvSchema } from './env';

describe('serverEnvSchema', () => {
  it('geçerli API_URL kabul edilir', () => {
    expect(parseEnv(serverEnvSchema, { API_URL: 'http://localhost:4000' })).toEqual({
      API_URL: 'http://localhost:4000',
    });
  });

  it('API_URL eksikse adıyla birlikte reddedilir', () => {
    expect(() => parseEnv(serverEnvSchema, {})).toThrow(EnvValidationError);
    expect(() => parseEnv(serverEnvSchema, {})).toThrow('API_URL: eksik');
  });

  it('API_URL adres değilse reddedilir', () => {
    expect(() => parseEnv(serverEnvSchema, { API_URL: 'localhost-4000' })).toThrow('API_URL');
  });
});
