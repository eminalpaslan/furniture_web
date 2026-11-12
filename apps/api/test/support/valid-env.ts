// Testlerde kullanılan, şemayı geçen örnek ortam (değerler docker-compose.yml'deki lokal servislerle uyumlu).
export const validApiEnv = {
  NODE_ENV: 'test',
  API_PORT: '4999',
  DATABASE_URL: 'postgresql://mobilya:mobilya_dev@localhost:15432/mobilya',
  REDIS_URL: 'redis://localhost:16379',
  MEILI_URL: 'http://localhost:17700',
  MEILI_MASTER_KEY: 'mobilya_dev_master_key_32_chars_x',
  S3_ENDPOINT: 'http://localhost:19000',
  S3_REGION: 'us-east-1',
  S3_ACCESS_KEY: 'mobilya',
  S3_SECRET_KEY: 'mobilya_dev_secret',
  S3_BUCKET: 'media',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '11025',
} as const satisfies Record<string, string>;
