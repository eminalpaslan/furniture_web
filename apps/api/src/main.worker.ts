import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { WorkerModule } from './worker.module.js';

// Kuyruk işçisi ayrı bir süreçtir: HTTP sunucusu açmaz, yalnızca uygulama bağlamını (DI) kurar.
// Kuyruklar F2.6'da eklenir; o zamana kadar dinlenecek iş olmadığından süreç açılıp kapanır.
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
  Logger.log('Worker started', 'Bootstrap');
}

void bootstrap();
