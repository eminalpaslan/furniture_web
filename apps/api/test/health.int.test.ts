import type { Server } from 'node:http';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';

// Örnek HTTP entegrasyon testi: uygulama modülü gerçek Nest çatısıyla kurulur, istek Supertest ile atılır.
describe('GET /health/live', () => {
  // Tip parametresi: getHttpServer() any yerine http.Server döner (no-unsafe-argument).
  let app: INestApplication<Server>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('200 ve { status: "ok" } döner', async () => {
    const response = await request(app.getHttpServer()).get('/health/live');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('tanımsız adreste 404 döner', async () => {
    const response = await request(app.getHttpServer()).get('/health/olmayan');

    expect(response.status).toBe(404);
  });
});
