import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

// docker-compose.yml ile aynı imaj: testler lokal ve üretimdeki Postgres sürümüyle çalışır (docs/STACK.md).
const POSTGRES_IMAGE = 'postgres:18.6-alpine3.24';

/**
 * Her test dosyası için yalıtılmış, geçici bir Postgres konteyneri başlatır (Testcontainers).
 * Lokal `pnpm infra:up` veritabanına dokunmaz; testler bitince `stop()` ile konteyner silinir.
 */
export async function startPostgres(): Promise<StartedPostgreSqlContainer> {
  return new PostgreSqlContainer(POSTGRES_IMAGE)
    .withDatabase('mobilya_test')
    .withUsername('mobilya')
    .withPassword('mobilya_test')
    .start();
}
