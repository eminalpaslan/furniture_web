# Teknoloji Sürümleri

> `CLAUDE.md §3` sürüm politikası: her paketin **doğrulama günündeki en güncel kararlı** sürümü `pnpm view <paket> version`
> (gerekirse `dist-tags`) ile doğrulanır ve `package.json`'a tam sürüm olarak yazılır. Beta / RC / canary kullanılmaz.
> Ana sürüm yükseltmesi yalnızca ADR ile yapılır.
>
> "Kurulum" sütunu paketin hangi görevde projeye eklendiğini gösterir. Henüz kurulmamış paketler kurulacakları görevde
> **yeniden doğrulanır**; o arada çıkan yama/ara sürüm varsa tablo güncellenir.

**Doğrulama tarihi:** 2026-11-12

## Çalışma zamanı ve paket yöneticisi

| Araç | Sürüm | Kurulum | Not |
|---|---|---|---|
| Node.js (LTS "Lithium") | 26.13.1 | F0.1 | `.nvmrc` + `package.json → devEngines.runtime` (pnpm proje için indirir). Kaynak: nodejs.org/dist/index.json |
| pnpm | 12.18.0 | F0.1 | `packageManager` alanında sabit |
| Turborepo (`turbo`) | 2.11.11 | F0.1 | |
| TypeScript | 6.0.3 | F0.1 | 7.0.2 mevcut ama typescript-eslint `<6.1.0` destekliyor → ADR-004 |

## Ön yüz

| Paket | Sürüm | Kurulum | Not |
|---|---|---|---|
| next | 16.4.6 | F0.4 | |
| react / react-dom | 19.3.1 | F0.4 | |
| tailwindcss / @tailwindcss/postcss | 4.3.5 | F0.4 | |
| @types/react / @types/react-dom | 19.3.0 | F0.4 | |
| @next/eslint-plugin-next | 16.4.6 | F0.4 | `packages/config/eslint/next.js` |
| eslint-plugin-react-hooks | 7.1.1 | F0.4 | |
| @radix-ui/react-* | (ör. dialog 1.3.1) | F1.x | Her primitive ayrı paket; kurulduğunda tek tek yazılır |
| motion | 14.13.0 | F1.3 | |
| embla-carousel-react | 8.6.0 | F1.7 | |
| react-hook-form | 7.92.0 | F1.5 | |
| @hookform/resolvers | 7.0.6 | F1.5 | |
| @tanstack/react-query | 5.107.1 | F4.1 | |

## API ve veri

| Paket | Sürüm | Kurulum | Not |
|---|---|---|---|
| @nestjs/core / common / platform-express | 12.5.0 | F0.4 | Nest 12 **ESM** paket (`type: module`) |
| @nestjs/cli | 12.0.12 | F0.4 | Kendi içinde TypeScript ~6.0.2 kullanır |
| reflect-metadata | 0.2.2 | F0.4 | Nest DI için |
| rxjs | 7.8.2 | F0.4 | Nest peer bağımlılığı |
| @types/express | 5.0.6 | — | F0.4'te kuruldu, kullanılmadığı için (knip) kaldırıldı; gerektiğinde eklenecek |
| @nestjs/swagger | 12.1.1 | F2.1 | |
| prisma / @prisma/client | 7.10.1 | F2.2 | `latest` etiketi 8.0.0-rc.33 (RC) → kullanılmaz; kararlı son sürüm 7.10.1 |
| zod | 4.6.7 | F0.5 | utils, api, web, admin |
| bullmq | 6.7.5 | F2.6 | |
| ioredis | 6.0.0 | F2.6 | |
| meilisearch (JS istemcisi) | 0.63.0 | F3.8 | |
| @aws-sdk/client-s3 | 3.1167.0 | F3.3 | |
| pino | 10.4.0 | F2.1 | |
| nestjs-pino | 5.3.1 | F2.1 | |
| helmet | 8.3.0 | F2.1 | |

## Test ve kalite

| Paket | Sürüm | Kurulum | Not |
|---|---|---|---|
| vitest | 5.1.0 | F0.5 | env testleri için paket başına sade kuruldu; workspace düzeni F0.6 |
| @vitest/coverage-v8 | 5.1.0 | F0.6 | |
| @testcontainers/postgresql | 12.2.1 | F0.6 | `testcontainers` çekirdeğini kendisi getirir |
| supertest / @types/supertest | 7.3.2 / 7.2.1 | F0.6 | |
| @nestjs/testing | 12.5.0 | F0.6 | |
| pg / @types/pg | 8.23.1 | F0.6 | Şimdilik örnek entegrasyon testi; F2.2'de Prisma sürücü adaptörü |
| @playwright/test | 1.65.0 | F0.6 | Chromium: `pnpm e2e:install` |
| @axe-core/playwright | 4.14.0 | F0.6 | |
| @vitest/eslint-plugin | 1.6.28 | F0.6 | `.only`/`.skip` yasağı |
| eslint-plugin-playwright | 2.12.2 | F0.6 | `.only`/`.skip` yasağı |
| fast-check | 4.10.2 | F2.3 | |
| eslint | 10.14.0 | F0.2 | |
| typescript-eslint | 8.72.2 | F0.2 | peer: `typescript >=4.8.4 <6.1.0` |
| prettier | 3.10.1 | F0.2 | |
| knip | 6.45.1 | F0.2 | |
| husky | 9.1.7 | F0.2 | |
| lint-staged | 17.6.0 | F0.2 | |
| @commitlint/cli / config-conventional | 21.2.4 | F0.2 | |
| @types/node | 26.6.6 | F0.2 | Node 26 ile eşleşir |
| @eslint/js | 10.0.1 | F0.2 | ESLint'in önerilen temel kuralları |
| eslint-plugin-simple-import-sort | 14.0.0 | F0.2 | import sırası |
| eslint-config-prettier | 10.1.8 | F0.2 | Prettier ile çakışan kuralları kapatır |
| @eslint-community/eslint-plugin-eslint-comments | 4.8.1 | F0.2 | gerekçesiz `eslint-disable` yasağı |
| globals | 17.14.0 | F0.2 | ortam global'leri (node, browser) |

## Lokal servisler (Docker imajları — `docker-compose.yml`)

| Servis | İmaj | Kurulum | Not |
|---|---|---|---|
| PostgreSQL | `postgres:18.6-alpine3.24` | F0.3 | `19rc1` RC → alınmadı. Volume `/var/lib/postgresql` (PG18 düzeni) |
| Redis | `redis:8.8.4-alpine3.23` | F0.3 | `8.12-rc2` RC → alınmadı. AOF açık |
| Meilisearch | `getmeili/meilisearch:v1.56.2` | F0.3 | |
| S3 (RustFS) | `rustfs/rustfs:1.0.5` | F0.3 | MinIO arşivlendi → ADR-006 |
| Mailpit | `axllent/mailpit:v1.33.1` | F0.3 | |
| AWS CLI | `amazon/aws-cli:2.40.1` | F0.3 | Yalnızca `s3-init` (bucket oluşturma) |
