import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { readApiEnvOrExit } from './env.js';
import { runBootstrap } from './run-bootstrap.js';

async function bootstrap(): Promise<void> {
  const env = readApiEnvOrExit();
  const app = await NestFactory.create(AppModule);
  // SIGTERM gelince açık bağlantılar düzgün kapatılır (konteyner/dağıtım yeniden başlatmaları).
  app.enableShutdownHooks();
  await app.listen(env.API_PORT);
  Logger.log(`API listening on http://localhost:${String(env.API_PORT)}`, 'Bootstrap');
}

runBootstrap(bootstrap);
