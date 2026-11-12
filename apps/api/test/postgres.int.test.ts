import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startPostgres } from './support/postgres.js';

// Örnek entegrasyon testi (ROADMAP F0.6): gerçek bir Postgres konteynerine bağlanır.
// F2.2'den itibaren Prisma ile yazılan repository testleri bu yardımcıyı kullanır.
describe('Postgres test konteyneri', () => {
  let container: StartedPostgreSqlContainer;
  let client: Client;

  beforeAll(async () => {
    container = await startPostgres();
    client = new Client({ connectionString: container.getConnectionUri() });
    await client.connect();
  });

  afterAll(async () => {
    await client.end();
    await container.stop();
  });

  it('compose ile aynı ana sürümde çalışır', async () => {
    const { rows } = await client.query<{ server_version_num: string }>('SHOW server_version_num');

    expect(rows[0]?.server_version_num.slice(0, 2)).toBe('18');
  });

  it('Türkçe karakterleri bozmadan yazar ve okur', async () => {
    await client.query('CREATE TABLE probe (name text NOT NULL)');
    await client.query('INSERT INTO probe (name) VALUES ($1)', [
      'Işıklı Gardırop Çekmeceli ğüşıöçİ',
    ]);

    const { rows } = await client.query<{ name: string }>('SELECT name FROM probe');

    expect(rows).toEqual([{ name: 'Işıklı Gardırop Çekmeceli ğüşıöçİ' }]);
  });
});
