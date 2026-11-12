# Karar Kaydı (ADR)

> Mimari, teknoloji, bağımlılık ve kabul kriteri değişiklikleri buraya yazılır. En yeni en üstte.
> Küçük bağımlılıklar için tek satır yeterlidir: `- YYYY-MM-DD · paket@sürüm · neden · alternatif neden değil`.

## Şablon
```
### ADR-XXX · Başlık
- Tarih:
- Durum: önerildi | kabul | yerini aldı (ADR-YYY)
- Bağlam: Hangi sorun / görev?
- Karar: Ne yapıyoruz?
- Alternatifler: Neler değerlendirildi, neden seçilmedi?
- Sonuçlar: Artılar, eksiler, geri dönüş maliyeti.
```

---

### ADR-006 · Lokal S3: MinIO yerine RustFS
- Tarih: 2026-11-12
- Durum: kabul
- Bağlam: F0.3. `minio/minio` imajı Docker Hub'da artık yok; `github.com/minio/minio` deposu **arşivlenmiş** (son push 2026-04-24).
  Bakımı yapılmayan bir bileşen, güvenlik güncellemesi almayacağı için kullanılmamalı. CLAUDE.md §3 yalnızca "S3 uyumlu"
  depolama şart koşuyor; MinIO lokal emülatör olarak anılıyordu.
- Karar: Lokal S3 emülatörü olarak **RustFS 1.0.5** (`rustfs/rustfs:1.0.5`, Apache-2.0, kararlı 1.0 serisi, aktif geliştirme).
  Uygulama kodu yalnızca standart S3 API'sini (`@aws-sdk/client-s3`) kullanır; emülatör değişse de kod değişmez.
  Bucket oluşturma: tek seferlik `s3-init` servisi (`amazon/aws-cli:2.40.1`, `head-bucket || create-bucket`, idempotent).
  RustFS'in yerleşik bucket bootstrap'ı denendi; 1.0.5 imajındaki `rc` CLI "public access block" desteklemediği için açılışta
  hata verdi → kullanılmadı.
- Alternatifler: SeaweedFS (S3 dışında çok bileşenli, ayarı daha karmaşık); Garage (Docker Hub'da yalnızca commit etiketli
  imajlar, sürüm etiketi az); Versity Gateway (daha küçük topluluk); arşivlenmiş MinIO'nun eski imajı (güvenlik güncellemesi yok).
- Sonuçlar: CLAUDE.md §3, ARCHITECTURE §1 ve ROADMAP F0.3 metni güncellendi. Üretimde hangi S3 sağlayıcısının
  kullanılacağı F12.1 barındırma kararında belirlenir.

### ADR-005 · Node sürümünü pnpm yönetir; yeni sürümler için tek tek istisna
- Tarih: 2026-11-12
- Durum: kabul
- Bağlam: F0.1. Güncel Node LTS 26.13.1; geliştirme makinesinde sistem Node'u 22.18.0. pnpm 12, varsayılan olarak
  çok yeni yayınlanmış paket sürümlerini (minimumReleaseAge) kurmayı reddediyor; sürüm politikamız ise "en güncel kararlı".
- Karar: (1) `package.json → devEngines.runtime` ile Node 26.13.1 sabitlenir, `onFail: download` sayesinde pnpm doğru
  Node'u projeye indirir; tüm `pnpm <script>` komutları bu sürümle çalışır. `.nvmrc` aynı sürümü gösterir (nvm/CI için).
  (2) Bilinçli olarak sabitlenen yeni sürümler `pnpm-workspace.yaml → minimumReleaseAgeExclude` listesine **tam sürümle** yazılır;
  genel güvenlik bekletmesi kapatılmaz (dolaylı bağımlılıklar korunmaya devam eder).
- Alternatifler: Sistem Node'unu yükseltmek (kullanıcının makinesini değiştirir, diğer projeleri etkiler); nvm-windows
  (ek araç kurulumu); bekletmeyi tamamen kapatmak (tedarik zinciri korumasını kaybettirir).
- Sonuçlar: Temiz makinede yalnızca pnpm yeterli. İstisna listesi her yeni doğrudan bağımlılıkta güncellenir.

### ADR-004 · TypeScript 6.0.x (7.x değil)
- Tarih: 2026-11-12
- Durum: kabul
- Bağlam: F0.1 sürüm doğrulamasında `typescript@latest` = 7.0.2 (Go ile yeniden yazılmış derleyici). ESLint entegrasyonu
  (`typescript-eslint@8.72.2`) peer olarak `typescript >=4.8.4 <6.1.0` istiyor; F0.2'deki tipe duyarlı lint kuralları buna bağlı.
- Karar: 6.x serisinin son kararlı sürümü **6.0.3** kullanılır.
- Alternatifler: TS 7 + lint'te tip bilgisi kullanmamak (CLAUDE.md'nin strict lint hedefini zayıflatır).
- Sonuçlar: typescript-eslint TS 7'yi desteklediğinde yükseltme yeni ADR ile yapılır.

### ADR-001 · Modüler monolit + ayrı Next.js uygulamaları
- Tarih: proje başlangıcı
- Durum: kabul
- Bağlam: Tek geliştirici (Claude) ve az müdahale isteyen kullanıcı; sağlam ama yönetilebilir bir backend gerekiyor.
- Karar: NestJS modüler monolit (`apps/api`) + vitrin ve panel için iki Next.js uygulaması; ortak sözleşmeler `packages/contracts`.
- Alternatifler: Mikroservisler (operasyon yükü fazla); hazır e-ticaret motoru (Türkiye'ye özgü takım fiyatlama, taksit, yasal belgeler ve teslimat/kurulum akışlarında özelleştirme maliyeti yüksek); yalnızca Next.js (iş kuralları ve kuyruk işçileri için zayıf ayrım).
- Sonuçlar: Modül sınırları lint ile korunur; ileride bir modül ayrı servise çıkarılabilir.

### ADR-002 · Para kuruş tamsayı, fiyat yalnızca sunucuda
- Tarih: proje başlangıcı
- Durum: kabul
- Karar: `ARCHITECTURE §6`.
- Sonuçlar: Yuvarlama hataları ve istemci tarafı fiyat manipülasyonu engellenir.

### ADR-003 · Ödeme: barındırılan form + 3DS, sağlayıcı arayüzü arkasında
- Tarih: proje başlangıcı
- Durum: kabul
- Karar: Kart verisi sunucuya gelmez; iyzico ilk sağlayıcı; `PaymentProvider` arayüzü ile değiştirilebilir.
- Sonuçlar: PCI kapsamı minimum; ikinci sağlayıcı eklemek arayüz uygulamasıyla sınırlı.

## Bağımlılık kayıtları
- 2026-11-12 · turbo@2.11.11 · monorepo görev çalıştırıcı ve önbellek (CLAUDE.md §3) · Nx daha ağır, stack'te kilitli değil
- 2026-11-12 · typescript@6.0.3 · bkz. ADR-004
- 2026-11-12 · eslint@10.14.0 + typescript-eslint@8.72.2 + @eslint/js@10.0.1 · lint (CLAUDE.md §3); strictTypeChecked + stylisticTypeChecked · —
- 2026-11-12 · eslint-plugin-simple-import-sort@14.0.0 · import sırası (F0.2) · eslint-plugin-import-x daha ağır ve tipe duyarlı çözümleme gerektirir; yalnızca sıralama için gereksiz
- 2026-11-12 · eslint-config-prettier@10.1.8 · biçim kurallarını Prettier'a bırakır · —
- 2026-11-12 · @eslint-community/eslint-plugin-eslint-comments@4.8.1 · gerekçesiz `eslint-disable` yasağını otomatik zorlar (CLAUDE.md §1-5) · elle inceleme güvenilmez
- 2026-11-12 · globals@17.14.0 · ESLint ortam global tanımları · —
- 2026-11-12 · prettier@3.10.1 · biçimlendirme; **Markdown belgeleri hariç** (`.prettierignore`): Türkçe tablo/satır düzeni elle korunur · —
- 2026-11-12 · husky@9.1.7 + lint-staged@17.6.0 · git kancaları; kancalar araçları `pnpm exec` ile çağırır, çünkü lint-staged Node ≥22.22.1 ister (ADR-005 Node'u) · simple-git-hooks daha az yaygın
- 2026-11-12 · @commitlint/cli + config-conventional@21.2.4 · Conventional Commits zorlaması (CLAUDE.md §7) · —
- 2026-11-12 · knip@6.45.1 · ölü kod / kullanılmayan bağımlılık (CLAUDE.md §3) · —
- 2026-11-12 · Docker imajları: postgres:18.6-alpine3.24, redis:8.8.4-alpine3.23, getmeili/meilisearch:v1.56.2,
  rustfs/rustfs:1.0.5 (ADR-006), axllent/mailpit:v1.33.1, amazon/aws-cli:2.40.1 (yalnızca bucket kurulumu) · CLAUDE.md §3 lokal ortam ·
  postgres 19rc1 ve redis 8.12-rc2 etiketleri RC olduğu için alınmadı
- 2026-11-12 · next@16.4.6, react/react-dom@19.3.1, tailwindcss + @tailwindcss/postcss@4.3.5 · vitrin ve panel (CLAUDE.md §3) · —
- 2026-11-12 · @nestjs/core|common|platform-express@12.5.0, @nestjs/cli@12.0.12, reflect-metadata@0.2.2, rxjs@7.8.2 · API (CLAUDE.md §3); Nest 12 ESM olduğu için API de `type: module` + NodeNext, göreli importlar `.js` uzantılı · —
- 2026-11-12 · @next/eslint-plugin-next@16.4.6, eslint-plugin-react-hooks@7.1.1 · Next/React lint kuralları (`@mobilya/config/eslint/next`) · eslint-config-next kendi typescript-eslint/import eklentilerini getirip ortak taban ile çakışırdı
- 2026-11-12 · zod@4.6.7 · ortam doğrulama (F0.5), ileride sözleşmeler (CLAUDE.md §3) · —
- 2026-11-12 · vitest@5.1.0 · F0.5 kabul kriteri test istediği için F0.6 öncesi paket başına sade kuruldu · —
- 2026-11-12 · Karar (F0.5): lokal `.env` kökte tek dosya. API onu kodla değil `node --env-file-if-exists=../../.env`
  bayrağıyla okur (üretimde dosya okuma kod yolu yok; süreç testi uygulamayı dosyasız başlatabilir). Next uygulamaları
  `next.config.ts` içinde `loadEnvFileIfExists` ile okur (Next'te bayrak yok). Ortak doğrulama `@mobilya/utils/env`
  (`parseEnv`, `parseEnvOrExit`); hata mesajı değer değil yalnızca değişken adı ve nedeni içerir.
- 2026-11-12 · @testcontainers/postgresql@12.2.1, supertest@7.3.2, @nestjs/testing@12.5.0, @vitest/coverage-v8@5.1.0 · entegrasyon testleri (CLAUDE.md §3) · —
- 2026-11-12 · pg@8.23.1 · örnek entegrasyon testinde gerçek bağlantı; Prisma 7'nin `@prisma/adapter-pg`'si de bunu kullanır (F2.2) · konteyner içinde `psql` çalıştırmak "bağlantı" kanıtı olarak zayıf
- 2026-11-12 · @playwright/test@1.65.0, @axe-core/playwright@4.14.0 · e2e + a11y (CLAUDE.md §3) · —
- 2026-11-12 · @vitest/eslint-plugin@1.6.28, eslint-plugin-playwright@2.12.2 · `.only`/`.skip` lint yasağı (CLAUDE.md §1-5) · —
- 2026-11-12 · Karar (F0.8): CI tek iş (`ubuntu-24.04`): checkout → setup-node (.nvmrc) → pnpm/action-setup (packageManager,
  mağaza önbelleği) → `pnpm install --frozen-lockfile` → `cp .env.example .env` → `format:check` → `verify` → `knip` → `infra:up` →
  Chromium → `e2e` → rapor artefaktı. Action'lar commit SHA'sıyla sabit (checkout v7.0.1, setup-node v7.1.0, action-setup v6.1.1,
  upload-artifact v7.0.2). actionlint 1.7.12 Docker imajıyla (`pnpm lint:ci`), ayrı kurulum yok. Turbo katı env modu için
  `globalPassThroughEnv: [CI, NEXT_TELEMETRY_DISABLED]`; uygulama değişkenleri `.env` dosyasından okunduğu için turbo'ya ayrıca verilmez.
- 2026-11-12 · Karar (F0.7): `ui:snap` `e2e/ui-snap/` altında; derleme adımı olmadan Node 26'nın yerleşik TypeScript
  çalıştırmasıyla (`node ui-snap/cli.ts`) çalışır — bu yüzden göreli importlar `.ts` uzantılı (`allowImportingTsExtensions`).
  Çıktı: `.artifacts/screens/<slug>/<genişlik>-{full|hover|focus|menu}.png` + `report.json`. Taşma ve konsol hataları uyarıdır
  (çıkış 0); sayfa açılamazsa / 5xx ise çıkış 1. Aynı hata yeniden yüklemelerde tekrar sayılmaz. Mevcut bir sunucuya bağlanır
  (gerekirse `pnpm dev`); `--base http://localhost:3001` ile panel. `scripts/not-ready.mjs` son yer tutucu kalktığı için silindi.
- 2026-11-12 · Karar (F0.6): "Vitest workspace" = `apps/api` içinde iki Vitest projesi (`unit`: `src/**/*.test.ts`,
  `integration`: `test/**/*.int.test.ts`); diğer paketler tek proje. Turborepo paket başına `vitest run` çalıştırır.
  Nest DI metadatası Vitest'te ek eklenti olmadan çalışıyor (Vite 8 dönüştürücüsü tsconfig `emitDecoratorMetadata`'yı okuyor —
  constructor injection deneme testiyle doğrulandı). e2e paketi uygulamalara `workspace:*` ile bağlı: tek amacı turbo'nun
  `e2e` öncesi `^build` ile onları derlemesi (knip'te `ignoreDependencies`). a11y: WCAG 2.0/2.1/2.2 A+AA etiketleri,
  ciddi/kritik = hata; yardımcının ihlal yakaladığı ayrı bir testle kanıtlanır.
