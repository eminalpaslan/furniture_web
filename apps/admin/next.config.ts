import { fileURLToPath } from 'node:url';

import { loadEnvFileIfExists } from '@mobilya/utils/env';
import type { NextConfig } from 'next';

import { readServerEnvOrExit, serverEnvSchema } from './env';

// Lokal geliştirmede tüm uygulamalar kökteki tek .env dosyasını paylaşır; bu süreç oradan yalnızca kendi
// şemasındaki değişkenleri alır (veritabanı/S3 şifreleri vitrine girmez). Sunucularda dosya yoktur.
loadEnvFileIfExists(
  fileURLToPath(new URL('../../.env', import.meta.url)),
  Object.keys(serverEnvSchema.shape),
);
// next dev / next build açılırken ortam doğrulanır; eksik değişkenle uygulama başlamaz (ARCHITECTURE §13).
readServerEnvOrExit();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Yanıt başlığında "X-Powered-By: Next.js" bilgisini gizler (gereksiz bilgi sızıntısı).
  poweredByHeader: false,
};

export default nextConfig;
