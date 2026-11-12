import { baseConfig } from '@mobilya/config/eslint';

// Kökteki betik ve yapılandırma dosyaları için. Uygulama ve paketler kendi eslint.config.js'lerini kullanır
// (ESLint 10, her dosya için en yakın yapılandırmayı bulur) ve kendi `lint` görevleriyle denetlenir.
export default [
  { ignores: ['apps/**', 'packages/**', 'e2e/**'] },
  ...baseConfig(import.meta.dirname),
];
