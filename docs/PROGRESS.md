# İlerleme Kaydı

> Claude'un hafızası bu dosyadır. Her oturumun başında okunur, her görevin sonunda güncellenir.
> Bağlam sıkıştırılsa bile buradan kalınan yere dönülebilmelidir.

## Mevcut durum
- **Faz:** F0 ✔ tamamlandı (faz denetimi geçti) → sıradaki F1 (tasarım sistemi), ilk görev **F1.1**
- **Son tamamlanan görev:** F0.9
- **`pnpm verify` son durumu:** ✔ 2026-11-12 (`--force`, önbelleksiz) — 22/22 görev, 45/45 test (utils 11, api 15 [unit 8 +
  entegrasyon 7], web 5, admin 5, e2e/ui-snap 8); `pnpm e2e` 7/7, `pnpm e2e:a11y` 3/3. Entegrasyon testleri için Docker açık olmalı.
- **Bilinen engellemeyen a11y bulgusu:** boş sayfalarda `page-has-heading-one` (orta) — sayfalar içerik alınca (F4.4, F8.1) kapanır.
- **`ui:snap` kullanımı:** uygulama çalışıyor olmalı (`pnpm dev` veya `pnpm --filter @mobilya/web start`). Git Bash'te
  `MSYS_NO_PATHCONV=1 pnpm ui:snap / --states hover,focus,menu` (yoksa `/` Windows yoluna çevrilir). Panel için `--base http://localhost:3001`.
- **Lokal kurulum notu:** `pnpm verify` ve `pnpm dev` kökte `.env` ister (`cp .env.example .env`); yoksa web/admin build'i
  `API_URL: eksik` diyerek durur — bu bilinçli (F0.5).
- **Ortam notu:** Sistem Node'u 22.18.0; proje Node 26.13.1'i pnpm `devEngines` ile kullanıyor (ADR-005).
  Sandbox `.git/` klasörüne yazmayı engelliyor → git yazma komutları sandbox dışında çalıştırılır.
  Kullanıcının başka bir projesi (`todo_db`, `todo_mailpit`) 5432/1025/8025 portlarını kullanıyor → bizim servisler
  "1 + standart port" (15432, 16379, 17700, 19000/19001, 11025, 18025). Git Bash'te docker'a Linux yolu verirken `MSYS_NO_PATHCONV=1`.

## Aktif görev
> Görev başlarken doldurulur, bitince temizlenir.

- **ID / başlık:** —
- **Plan:**
  1. —
- **Notlar / riskler:** —

## Sonraki görevlere devredilen notlar
- CI henüz GitHub'da hiç çalışmadı (depo uzak sunucuya gönderilmedi) → F0 çıkış kapısındaki "CI yeşil" maddesi yerel `CI=1`
  provasıyla karşılandı; ilk push'tan sonra Actions sekmesinde gerçek sonuç kontrol edilecek (Kullanıcıdan beklenenler #13).
  F12 öncesi staging/production için uygulama değişkenleri `.env` yerine ortamdan gelecek → turbo `env`/`passThroughEnv` gözden geçirilir.
- Kapsam eşikleri → ROADMAP F2.3a. `/v1` öneki + üretim env sertleştirme → F2.1a. CSS token denetimi → F1.1a. `server-only` env → F4.1a.
- F2.1: API yanıtlarında `X-Powered-By: Express` var → helmet ile kaldırılacak (zaten F2.1 kapsamında).
- Windows notu: `pnpm dev` arka planda durdurulunca node alt süreçleri 3000/3001/4000'i tutmaya devam edebiliyor → PID ile kapat.

## Engeller
> 3 deneme kuralına takılan işler (CLAUDE.md §1-12). Format: tarih · görev · denenenler · hata özeti · hipotez · durum.

_(yok)_

## Kullanıcıdan beklenenler
> Bu bilgiler gelene kadar yer tutucuyla ilerlenir. Soru sorulacaksa hepsi **tek mesajda** sorulur (CLAUDE.md §8).

| # | Bilgi | Gerektiği görev | Varsayılan / yer tutucu | Durum |
|---|---|---|---|---|
| 1 | Marka adı ve logo (SVG) | F4.2 | `[MARKA_ADI]`, metin logo | bekleniyor |
| 2 | Marka renkleri (varsa) | F1.1 | `DESIGN_SYSTEM §2` paleti | opsiyonel |
| 3 | Referans ekran görüntüleri (`docs/reference/`) | F4.2–F4.8 | `REFERENCE.md` şartnamesi | opsiyonel |
| 4 | iyzico sandbox API anahtarları | F6.4 | `FakePaymentProvider` | bekleniyor |
| 5 | iyzico canlı anahtarları | F12.4 | — | sonra |
| 6 | Şirket bilgileri (unvan, adres, vergi no, MERSİS, KEP, telefon) | F6.5, F9.2 | yer tutucu | bekleniyor |
| 7 | Yasal metinlerin hukukçu onayı | F12.4 | "HUKUKİ ONAY BEKLİYOR" | sonra |
| 8 | Teslimat politikası (bölgeler, ücretler, kurulum, süreler) | F3.6 | tüm Türkiye, ücretsiz teslimat + kurulum, 7 iş günü | bekleniyor |
| 9 | E-posta / SMS / e-Arşiv sağlayıcı tercihleri ve hesapları | F11.4 | Mailpit + fake sağlayıcılar | sonra |
| 10 | Alan adı ve barındırma tercihi (KVKK) | F12.1 | — | sonra |
| 11 | WhatsApp destek numarası, sosyal medya hesapları | F4.2 | yer tutucu | bekleniyor |
| 12 | Gerçek ürün verisi ve fotoğrafları | F12.3 | seed verisi | sonra |
| 13 | GitHub deposu (özel) — kod oraya gönderilince CI çalışır | F0.8 doğrulaması | yerel prova (`CI=1`) | opsiyonel |

## Ölçümler
> Lighthouse, paket boyutu, yük testi sonuçları. Format: tarih · sayfa/senaryo · değerler.

_(yok)_

## Günlük
> En yeni en üstte. Format:
> `### YYYY-MM-DD · F0.1 Monorepo iskeleti — ✔`
> - Yapılanlar: …
> - Kanıt: `pnpm verify` → yeşil (typecheck 0, lint 0, test 12/12, build OK)
> - Görsel kontrol: (UI ise) `[rota] 10/10 ✔` veya bulgular
> - Not: …

### 2026-11-12 · F0.9 Faz denetimi — ✔ (F0 FAZ DENETİM RAPORU)
**README:** `README.md` — gereksinimler, sıfırdan kurulum, beklenen adresler, komutlar, portlar, sık sorunlar.

**Temiz klon testi (KK):** `git clone` → README adımları harfiyen.
- Deneme 1: `pnpm install` → `ERR_PNPM_IGNORED_BUILDS` (ssh2, cpu-features, protobufjs) — ana klasörde görünmüyordu. → `allowBuilds`
  ile reddedildi (DECISIONS). Ayrıca Windows MAX_PATH: uzun test yolunda (279 karakter) pnpm yazamadı → kısa yolla tekrar; README'ye uyarı.
- Deneme 2: install ✔, `cp .env.example .env` ✔, `infra:up` ✔, `e2e:install` ✔, `verify` 22/22 ✔, `e2e` 7/7 ✔, `pnpm dev` → api/web/admin
  200, Mailpit 200; RustFS konsolu kökte 403 → doğru adres `/rustfs/console/` (README ve OGRENME düzeltildi).
- Deneme 3 (denetim düzeltmelerinden sonra): install ✔, **`pnpm lint` tek başına 11/11** ✔, verify 22/22 ✔, e2e 7/7 ✔.

**Bağımsız denetim (alt ajan) — kriter tablosu özeti:** F0.1–F0.8'in tüm KK'ları ✔; denetçi 3 maddeyi ✘/? işaretledi:
| Madde | Durum | Yapılan |
|---|---|---|
| F0.5 web/admin "uygulama kapanıyor" testi yok | ✘ → ✔ | `apps/{web,admin}/next.config.test.ts`: API_URL'siz açılış exit 1 + mesaj |
| F0.9 temiz klonda `pnpm lint` kırılıyor | ✘ → ✔ | turbo `lint` `^build`'e bağlandı; temiz klonda 11/11 |
| "CI yeşil" kanıtı | ? | Depo push edilmedi; yerel `CI=1` provası yeşil (F0.8). İlk push'ta doğrulanacak |

**Bulgular ve sonuçları:**
| # | Bulgu | Sonuç |
|---|---|---|
| 1 | turbo lint yarışı (temiz klon) | düzeltildi |
| 2 | Docker portları 0.0.0.0'a açık, bilinen şifreler | düzeltildi: `127.0.0.1` |
| 3 | Token lint boşlukları (v4 `(--x)`, `[p:v]`, `!`, `.ts` dosyaları) | düzeltildi (deneme dosyası: 7 yasak yakalandı, 5 serbest geçti); CSS → **F1.1a** |
| 4 | Next env: tüm kök `.env` vitrine yükleniyor; `.env` önbellek girdisi değil; server-only yok | yalnızca şema anahtarları yükleniyor (testli); `globalDependencies: [.env]`; server-only → **F4.1a** |
| 5 | `void bootstrap()` hataları ham; a11y orta bulgular görünmez; CI retry kararsızlığı gizler | `runBootstrap` (port dolu testi önce kırmızı, sonra yeşil); a11y best-practice + not; `failOnFlakyTests` |
| 6 | `allowBuilds` için DECISIONS kaydı yok | eklendi |
| 7 | Kapsam eşiği ROADMAP'e bağlı değil | **F2.3a** |
| 8 | `ARCHITECTURE §4` `/v1` öneki yok | **F2.1a** (üretim env sertleştirmesiyle) |
| 9 | `.env.example` compose değişkenleri açıklamasız; README'de `pnpm e2e` yok; STACK'te kaldırılmış paket satırı | düzeltildi |
| 10 | Postgres imajı iki yerde | compose'a çapraz uyarı yorumu |

- Kanıt (son durum, önbelleksiz): `pnpm verify --force` 22/22, `pnpm e2e` 7/7, `pnpm e2e:a11y` 3/3, `pnpm knip` ✔, `pnpm format:check` ✔,
  `pnpm lint:ci` ✔, `docker compose ps` 5/5 healthy ve yalnızca 127.0.0.1.
- **Faz çıkış kapısı:** `pnpm verify` ✔ · `pnpm e2e` ✔ · `pnpm ui:snap` ✔ · CI → yerel prova ✔ (GitHub'da çalıştırma kullanıcı deposuna bağlı).

### 2026-11-12 · F0.8 CI (GitHub Actions) — ✔
- Yapılanlar: `.github/workflows/ci.yml` (PR + main push; checkout → Node(.nvmrc) → pnpm + önbellek → frozen install → `.env` →
  format:check → verify → knip → infra:up → Chromium → e2e → Playwright raporu artefakt). Action'lar SHA ile sabit, `permissions:
  contents: read`, `concurrency` iptal. `scripts/actionlint.mjs` + `pnpm lint:ci` (Docker `rhysd/actionlint:1.7.12`).
  turbo `globalPassThroughEnv: [CI, NEXT_TELEMETRY_DISABLED]`.
- Kanıt:
  - KK: `pnpm lint:ci` → temiz (exit 0). Kasıtlı hatalı `probe.yml` (`github.evnt`, bilinmeyen girdi) → actionlint hata + exit 1 (silindi).
  - KK (adımlar = scriptler): YAML'daki her `run:` bir pnpm scripti (yalnızca `cp .env.example .env` ve `playwright install` hariç).
  - Prova: `CI=1` ile aynı sıra yerelde → frozen install ✔, format ✔, verify 22/22 ✔, knip ✔, infra:up ✔, e2e 7/7 ✔
    (Playwright `::notice` GitHub özet satırı üretildi). `act` kurulu değil; gerçek GitHub çalıştırması ilk push'ta görülecek.

### 2026-11-12 · F0.7 Görsel öz-kontrol aracı (`ui:snap`) — ✔
- Yapılanlar: `e2e/ui-snap/` → `options.ts` (argümanlar, slug), `page-checks.ts` (taşma ölçümü + taşan öğeler, konsol/sayfa/istek
  hataları — tekrarsız, kararlı sayfa bekleme), `states.ts` (hover/focus[Tab + focus]/menu, öğe yoksa not), `snap.ts`
  (375/768/1280/1440; `<genişlik>-full.png` + durumlar), `report.ts` (metin rapor, uyarı sayısı), `cli.ts` (`.artifacts/screens/<slug>/`,
  `report.json`). Kök `pnpm ui:snap`; `scripts/not-ready.mjs` silindi (artık yer tutucu script yok).
- Kanıt:
  - KK1: `pnpm ui:snap / --states hover,focus,menu` → 4 görüntü (`375/768/1280/1440-full.png`) + report.json; 0 uyarı; ana sayfada
    etkileşimli öğe olmadığı için durumlar "öğe yok" notu. `375-full.png` Read ile açıldı: 375×812 boş beyaz sayfa (beklenen).
  - KK2 + KK3: `tests/ui-snap.spec.ts` — 600 px'lik kutulu sayfada 375'te taşma (`div#genis-kutu` taşan öğe olarak), 768'de yok;
    `console.error` raporda; toplam 5 uyarı. Temiz sayfada 0 uyarı. `375-focus.png` Read ile açıldı: butonda odak halkası görünür.
  - Birim: `options.test.ts` 8/8. `pnpm verify` 22/22, `pnpm e2e` 7/7, knip ve format temiz.
- Yolda bulunan: durum görüntüleri için sayfa yeniden yüklendiğinden aynı konsol hatası 3 kez sayılıyordu → toplayıcı tekrarı ayıklıyor
  (test önce 13 uyarı gösterip kırmızıya döndü, düzeltmeyle 5).

### 2026-11-12 · F0.6 Test altyapısı — ✔
- Yapılanlar: `apps/api` Vitest projeleri `unit` + `integration`; `test/support/postgres.ts` (Testcontainers, compose ile aynı
  `postgres:18.6-alpine3.24`), `test/support/valid-env.ts`; örnek testler `test/postgres.int.test.ts` (pg ile gerçek bağlantı,
  sürüm 18, Türkçe karakter yaz/oku), `test/health.int.test.ts` (@nestjs/testing + Supertest: 200 ve 404), `startup.test.ts` →
  `test/startup.int.test.ts`. Coverage: `@vitest/coverage-v8` + `test:coverage`. `e2e/`: `playwright.config.ts` (webServer: api/web/admin
  derlenmiş, `reuseExistingServer` lokal), `support/a11y.ts` (`expectNoA11yViolations`), `support/messages.ts`, `support/urls.ts`,
  `tests/home.spec.ts`, `tests/a11y-helper.spec.ts`. turbo `e2e`/`e2e:a11y` (`^build`, önbelleksiz, `CI` geçişli). Kök: `e2e`, `e2e:a11y`,
  `e2e:install`. Lint: `.only`/`.skip` yasağı (vitest + playwright eklentileri), `expect…` yardımcıları beklenti sayılır.
- Kanıt:
  - KK `pnpm test`: 21/21 görev; api 14/14 (Postgres konteyneri gerçekten başlatıldı, `SHOW server_version_num` → 18…).
  - KK `pnpm e2e`: 5/5 (lang=tr, başlık, admin noindex, iki a11y taraması, yardımcı `image-alt (critical)` yakalıyor).
  - KK `pnpm e2e:a11y`: 3/3.
  - Nest constructor injection Vitest'te çalışıyor (geçici deneme testi geçti, silindi).
  - `.only`/`.skip` deneme dosyaları → `vitest/no-focused-tests`, `vitest/no-disabled-tests`, `playwright/no-focused-test`,
    `playwright/no-skipped-test` hataları (silindi). `pnpm knip` temiz, `pnpm format:check` temiz.
- Yolda düzeltilenler: `getHttpServer()` `any` döndürüyordu → `INestApplication<Server>`; knip: doğrudan `testcontainers`
  gereksizdi (kaldırıldı).

### 2026-11-12 · F0.5 Ortam değişkeni doğrulama — ✔
- Yapılanlar: `packages/utils` artık derlenen paket (`tsc` → `dist`, `exports["./env"]`): `parseEnv`, `parseEnvOrExit`,
  `EnvValidationError`, `loadEnvFileIfExists`. `apps/api/src/env.ts` (NODE_ENV, API_PORT, DATABASE_URL, REDIS_URL, MEILI_*,
  S3_*, SMTP_*) → `main.ts` ve `main.worker.ts` ilk iş olarak doğrular; `API_PORT` sabiti kalktı. `apps/web|admin/env.ts`
  (`API_URL`) → `next.config.ts` açılışta doğrular. Kök `.env.example` (her değişken açıklamalı, compose değişkenleri dahil).
  API `.env`'i `node --env-file-if-exists=../../.env` ile okur (dev: `nest start --exec`). `tsconfig.build.json` testleri derlemez.
  turbo: `@mobilya/api#test` → `build`'e bağlı.
- Kanıt:
  - KK (testle): `apps/api/src/startup.test.ts` derlenmiş `dist/main.js` ve `dist/main.worker.js`'i `DATABASE_URL`'siz başlatır →
    çıkış kodu 1, stderr `DATABASE_URL: eksik`, "listening" yok. ✔ (2/2)
  - Elle: geçersiz ortamla `node dist/main.js` → 11 satırlık liste (eksik/geçersiz + neden), exit 1, değerler mesajda yok.
  - `.env` yokken `pnpm --filter @mobilya/web build` → `API_URL: eksik (zorunlu)`, exit 1.
  - `.env` ile `pnpm dev` → api 200 (`API listening on http://localhost:4000`), web 200, admin 200.
  - `pnpm verify` → 19/19 görev; testler utils 10/10, api 10/10, web 3/3, admin 3/3. `pnpm knip` temiz
    (knip'in dist→src eşlemesi için `packages/utils/tsconfig.json`'a `outDir` eklendi).

### 2026-11-12 · F0.4 Uygulama iskeletleri — ✔
- Yapılanlar: `packages/config` → `tsconfig/nextjs.json`, `tsconfig/nestjs.json`, `eslint/next.js` (core-web-vitals + react-hooks),
  `eslint/nest.js` (dekoratörlü boş sınıf izni). `apps/web` (3000) ve `apps/admin` (3001, noindex): Next.js 16.4.6 App Router,
  Tailwind 4, `messages/tr.json` (başlık `[MARKA_ADI]`), boş `<main />`. `apps/api` (4000): NestJS 12 ESM, `HealthModule` →
  `GET /health/live`, `main.worker.ts` + `WorkerModule` (boş). `typecheck` Next'te `next typegen && tsc --noEmit`.
- Kanıt:
  - `pnpm verify` → 12/12 görev ✔ (web/admin `next build` statik `/` üretti; api `nest build`).
  - `pnpm dev` → `curl localhost:4000/health/live` → `HTTP/1.1 200 OK {"status":"ok"}`; `localhost:3000` → 200, `<html lang="tr">`,
    `<title>[MARKA_ADI]</title>`, `<main></main>`; `localhost:3001` → 200, `noindex, nofollow`; web'de `X-Powered-By` yok.
  - `pnpm --filter @mobilya/api start:worker` → "WorkerModule dependencies initialized", "Worker started".
- Not: Next ve turbo anonim telemetri mesajı basıyor; zararsız, kapatma kararı CI görevinde (F0.8) verilecek.

### 2026-11-12 · F0.3 Lokal servisler (Docker Compose) — ✔
- Yapılanlar: `docker-compose.yml` (proje adı `mobilya`): postgres, redis (AOF), meilisearch, s3 (RustFS), mailpit — hepsi
  healthcheck'li ve adlandırılmış volume'lu; `s3-init` (profil `init`, AWS CLI, idempotent bucket `media`).
  Scriptler: `infra:up` (`up -d --wait` + `run --rm s3-init`), `infra:down`, `infra:reset` (`down --volumes` + `infra:up`).
  ADR-006: MinIO deposu arşivlendi → RustFS 1.0.5. CLAUDE.md §3, ARCHITECTURE §1, ROADMAP F0.3 metinleri güncellendi.
- Denenen ve bırakılan: RustFS yerleşik bucket bootstrap'ı → "bundled RustFS CLI does not support bucket Public Access Block"
  hatasıyla konteyner çıktı (deneme 1). `s3-init` önce `up` ile birlikte başlatıldı; `--wait` işin bitmesini beklemedi (deneme 2).
  Son çözüm: profil + senkron `docker compose run`.
- Kanıt:
  - KK1: `pnpm infra:reset` → postgres, redis, meilisearch, s3, mailpit `Up (healthy)`; `s3-init` → bucket oluştu.
  - KK2: her servise veri yazıldı (pg tablo `kk_probe`, redis anahtar, meili indeks, `s3://media/kk_probe.txt`, mailpit e-posta) →
    `pnpm infra:reset` → pg tablo YOK, redis `exists`=0, meili indeks 0, mailpit mesaj 0, `media` bucket boş.
  - Tekrar `pnpm infra:up` → "bucket media zaten var" (idempotent). `pnpm verify` ✔, `pnpm format:check` ✔.

### 2026-11-12 · F0.2 TypeScript, ESLint, Prettier, git kancaları — ✔
- Yapılanlar: `packages/config` → `tsconfig/base.json` (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes,
  noImplicitOverride…), `eslint/base.js` (`baseConfig(tsconfigRootDir)`: strictTypeChecked + stylisticTypeChecked,
  simple-import-sort, no-console, gerekçesiz eslint-disable yasağı, TSX/JSX'te ham hex + Tailwind keyfi değer yasağı,
  eslint-config-prettier), `prettier/index.js`. Kök: `eslint.config.js`, `commitlint.config.js`, `lint-staged.config.js`,
  `.prettierignore` (md hariç), `knip.json`, `.husky/pre-commit` + `.husky/commit-msg` (`pnpm exec`), turbo `//#lint:root`,
  scriptler `format`, `format:check`, `knip`, `prepare`.
- Kanıt:
  - KK (lint): geçici `kk-probe/bad.tsx` → 10 hata: no-restricted-syntax ×3 (hex ×2, `w-[37px]`), no-explicit-any,
    ban-ts-comment, no-console, prefer-const, no-unsafe-*; `data-[state=open]:bg-surface` doğru şekilde serbest.
    Gerekçesiz `eslint-disable` → require-description hatası.
  - KK (typecheck): aynı dosyada TS2322 (noUncheckedIndexedAccess), TS2375 (exactOptionalPropertyTypes). Sonra silindi.
  - KK (commit kancası): `git commit -m "kotu mesaj formati"` → commitlint `subject-empty`, `type-empty` ile reddetti; git log değişmedi.
  - `pnpm verify` → 3/3 görev ✔; `pnpm knip` → temiz; `pnpm format:check` → temiz.
- Not: `.only`/`.skip` lint yasağı F0.6'da test eklentileriyle gelecek.

### 2026-11-12 · F0.1 Monorepo iskeleti ve sürüm kilidi — ✔
- Yapılanlar: `git init -b main`; pnpm 12.18.0 global kuruldu; kök `package.json` (packageManager, devEngines Node 26.13.1,
  scriptler), `pnpm-workspace.yaml` (saveExact, minimumReleaseAgeExclude), `turbo.json`, `.nvmrc`, `.editorconfig`,
  `.gitignore`, `.gitattributes`; §3.1 klasörleri + boş `@mobilya/{config,ui,contracts,utils,e2e}` paketleri;
  henüz kurulmamış scriptler (`e2e`, `e2e:a11y`, `ui:snap`, `knip`) `scripts/not-ready.mjs` ile açıkça hata veriyor.
  `docs/STACK.md` (45 paket, 2026-11-12), ADR-004 (TS 6.0.3), ADR-005 (Node/pnpm), `docs/OGRENME.md` (kullanıcı isteği).
- Kanıt:
  - KK1: `pnpm view` ile tüm paketler sorgulandı → `docs/STACK.md`. prisma `latest`=8.0.0-rc.33 (RC) → kararlı 7.10.1.
  - KK2: `package.json`'da `^`/`~` sayısı 0; `pnpm-lock.yaml` mevcut.
  - KK3: `node_modules` silindi → `pnpm install --frozen-lockfile` ✔ (supply-chain policy ✔) → `pnpm verify` ✔ (0 görev);
    `pnpm exec node -v` → v26.13.1; `pnpm e2e` → beklenen açıklayıcı hata, exit 1.
- Not: Kullanıcı isteğiyle `docs/OGRENME.md` öğrenme rehberi eklendi; CLAUDE.md §2.2-6'ya güncelleme adımı yazıldı.
