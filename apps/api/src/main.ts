import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

// F0.5'te Zod ile doğrulanan ortam değişkenine (env.ts) taşınacak.
const API_PORT = 4000;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  // SIGTERM gelince açık bağlantılar düzgün kapatılır (konteyner/dağıtım yeniden başlatmaları).
  app.enableShutdownHooks();
  await app.listen(API_PORT);
  Logger.log(`API listening on http://localhost:${String(API_PORT)}`, 'Bootstrap');
}

void bootstrap();
