import { Logger } from '@nestjs/common';

/**
 * Süreç açılışını çalıştırır; açılış hatası (port dolu, modül kurulamadı…) yakalanmamış bir
 * "unhandled rejection" yığını olarak değil, uygulamanın kendi log'uyla yazılır ve süreç 1 koduyla kapanır.
 */
export function runBootstrap(bootstrap: () => Promise<void>): void {
  bootstrap().catch((error: unknown) => {
    const detail = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    Logger.error(`Startup failed: ${detail}`, stack, 'Bootstrap');
    process.exit(1);
  });
}
