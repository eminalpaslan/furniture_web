import { Controller, Get } from '@nestjs/common';

// `live`: süreç ayakta mı? (bağımlılıklara bakmaz). `ready` (DB, Redis, Meili, S3) F2.1'de eklenir — ARCHITECTURE §11.
@Controller('health')
export class HealthController {
  @Get('live')
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
