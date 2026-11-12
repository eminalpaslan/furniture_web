import { parseEnvOrExit } from '@mobilya/utils/env';
import { z } from 'zod';

const port = z.coerce.number().int().min(1).max(65_535);

// Her değişkenin açıklaması kökteki .env.example dosyasındadır (ARCHITECTURE §13).
export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: port.default(4000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  REDIS_URL: z.url({ protocol: /^rediss?$/ }),
  MEILI_URL: z.url(),
  MEILI_MASTER_KEY: z.string().min(16),
  S3_ENDPOINT: z.url(),
  S3_REGION: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(8),
  S3_BUCKET: z.string().min(3),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: port,
});

export type ApiEnv = z.output<typeof apiEnvSchema>;

/** API ve worker süreçlerinin ilk işi: ortam geçersizse süreç başlamadan kapanır. */
export function readApiEnvOrExit(): ApiEnv {
  return parseEnvOrExit(apiEnvSchema, process.env);
}
