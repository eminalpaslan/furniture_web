// GitHub Actions iş akışlarını actionlint ile denetler (ROADMAP F0.8). Ayrı kurulum gerektirmesin diye
// resmi Docker imajı kullanılır (içinde shellcheck de var: `run:` adımlarındaki kabuk betiklerini de denetler).
// Docker'a mutlak yol gerekir; pnpm scriptleri Windows'ta cmd ile çalıştığı için yol burada hesaplanır.
import { spawnSync } from 'node:child_process';

const IMAGE = 'rhysd/actionlint:1.7.12';

const result = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--mount',
    `type=bind,src=${process.cwd()},dst=/repo,readonly`,
    '--workdir',
    '/repo',
    IMAGE,
    '-color',
  ],
  { stdio: 'inherit' },
);

process.exit(result.status ?? 1);
