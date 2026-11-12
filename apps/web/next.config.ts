import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Yanıt başlığında "X-Powered-By: Next.js" bilgisini gizler (gereksiz bilgi sızıntısı).
  poweredByHeader: false,
};

export default nextConfig;
