# Öğrenme Rehberi — Bu site nasıl yapılıyor?

> Bu dosya **senin için** yazılıyor. Kodu Claude yazıyor; burada her adımda hangi dosyanın ne işe yaradığını,
> hangi aracın neden seçildiğini ve nasıl kullanıldığını sade bir dille anlatıyorum.
> Her görev bittiğinde güncellenir. En alttaki **"Adım adım günlük"** bölümü kronolojik hikâyedir;
> üstteki bölümler ise o ana kadar öğrenilenlerin derli toplu hâlidir.

**Nasıl okumalı?**
1. Önce "Büyük resim"i oku — sitenin parçalarını kafanda canlandır.
2. Bilmediğin bir kelime görünce "Sözlük"e bak.
3. Projede bir dosya görüp "bu ne?" dersen "Dosya rehberi"ne bak.
4. Her görevin sonunda günlükteki **"Kendin dene"** kısmındaki komutları kendi terminalinde çalıştır. En hızlı öğrenme yolu budur.

---

## 1. Büyük resim

Bir e-ticaret sitesi tek bir program değil, birlikte çalışan birkaç programdır:

```
 Müşteri (tarayıcı)              Mağaza çalışanı (tarayıcı)
        │                                 │
        ▼                                 ▼
  apps/web  (vitrin)               apps/admin  (yönetim paneli)
  Ürünleri gösterir,               Ürün ekler, siparişleri yönetir
  sepet, ödeme ekranı              
        │                                 │
        └──────────┬──────────────────────┘
                   ▼  (internet üzerinden JSON veri alışverişi)
             apps/api  (arka uç / backend)
             Bütün iş kuralları burada: fiyat hesabı, stok,
             sipariş, ödeme, kullanıcı girişi...
                   │
     ┌─────────────┼──────────────┬──────────────┐
     ▼             ▼              ▼              ▼
 PostgreSQL      Redis       Meilisearch    RustFS (S3)
 (veritabanı)  (hızlı bellek, (arama motoru) (ürün görselleri)
               iş kuyruğu)
```

- **Ön yüz (frontend)** = kullanıcının gördüğü kısım (`apps/web`, `apps/admin`).
- **Arka uç (backend)** = görünmeyen, kuralları uygulayan ve veriyi saklayan kısım (`apps/api`).
- Ön yüz veritabanına **asla** doğrudan bağlanmaz; her şeyi API'ye sorar. Böylece kurallar tek yerde olur ve
  kötü niyetli biri tarayıcıda fiyatı değiştirse bile sunucu doğru fiyatı kendisi hesaplar.

Bu üç uygulama ve ortak kod parçaları **tek bir depoda** (monorepo) duruyor. Neden? Ön yüz ile API'nin
aynı veri tiplerini paylaşabilmesi için (`packages/contracts`). API'de bir alanın adı değişirse, ön yüzdeki hata
daha kod çalışmadan TypeScript tarafından yakalanır.

---

## 2. Sözlük

| Terim | Anlamı |
|---|---|
| **Node.js** | JavaScript'i tarayıcı dışında (bilgisayarda/sunucuda) çalıştıran program. Bütün araçlarımız onun üzerinde çalışır. |
| **LTS** | "Long Term Support" — uzun süre güvenlik güncellemesi alan, üretimde kullanılması önerilen sürüm. |
| **Paket (package)** | Başkalarının yazıp paylaştığı hazır kod kütüphanesi (ör. `react`). npm kayıt deposundan indirilir. |
| **Paket yöneticisi** | Paketleri indiren, sürümlerini takip eden araç. Biz **pnpm** kullanıyoruz. |
| **Bağımlılık (dependency)** | Projemizin çalışmak için ihtiyaç duyduğu paket. `devDependencies` = yalnızca geliştirirken gerekenler. |
| **Monorepo** | Birden çok uygulama/paketin tek bir git deposunda durması. |
| **Workspace** | Monorepo içindeki her bir paket/uygulama (ör. `apps/web`, `packages/ui`). |
| **Script** | `package.json` içinde isim verilmiş komut. `pnpm build` yazınca "build" script'i çalışır. |
| **Lockfile** | `pnpm-lock.yaml`. Her paketin (ve onların bağımlılıklarının) tam olarak hangi sürümünün kurulduğunu kaydeder. Herkes aynı kurulumu alır. |
| **Semver** | Sürüm numarası düzeni: `ANA.ARA.YAMA` (ör. 26.13.1). Ana sürüm değişince eski kod bozulabilir. |
| **`^` / `~`** | package.json'da "bu sürüm veya uyumlu daha yenisi" anlamına gelir. Biz kullanmıyoruz: sürümler **tam** yazılır, sürpriz güncelleme olmaz. |
| **RC / beta / canary** | Henüz kararlı olmayan, deneme sürümleri. Kullanmıyoruz. |
| **Git** | Kodun her değişikliğini kayıt altına alan sürüm kontrol sistemi. |
| **Commit** | Git'te kaydedilmiş bir değişiklik paketi ("kayıt noktası"). |
| **TypeScript** | Tip bilgisi eklenmiş JavaScript. `fiyat: number` gibi; yanlış tipte veri verirsen kod çalışmadan hata gösterir. |
| **Typecheck** | TypeScript'in bütün kodu tip hatalarına karşı taraması. |
| **Lint** | Kodu hata riskli kalıplar ve kurallar açısından tarayan otomatik kontrol (ESLint). |
| **Build** | Kaynak kodu, çalıştırılabilir/yayınlanabilir hâle derlemek. |
| **tsconfig** | TypeScript'in ayar dosyası (`tsconfig.json`): ne kadar katı olacağı, hangi dosyaları kontrol edeceği. |
| **`extends`** | Bir ayar dosyasının başka bir ayar dosyasını "miras alması". Ortak ayar bir kez yazılır, herkes onu genişletir. |
| **Formatter (biçimlendirici)** | Kodun *görünüşünü* (girinti, tırnak, satır uzunluğu) otomatik düzenleyen araç — Prettier. Lint'ten farkı: lint *hatayı*, formatter *görünüşü* düzeltir. |
| **Git hook (kanca)** | Git'in belirli anlarda (commit'ten önce, commit mesajı yazılınca…) otomatik çalıştırdığı betik. |
| **Staged** | `git add` ile commit'e hazırlanmış (sahneye alınmış) değişiklikler. |
| **Conventional Commits** | Commit mesajı standardı: `tip(kapsam): açıklama`. Geçmişi okunur ve otomatik işlenebilir kılar. |
| **Ölü kod** | Hiçbir yerden çağrılmayan, silinebilecek kod veya kullanılmayan bağımlılık. |
| **Docker / konteyner** | Bir programı, ihtiyaç duyduğu her şeyle birlikte paketleyip bilgisayarından yalıtılmış bir "kutu"da çalıştırma. Postgres'i bilgisayarına kurmadan çalıştırırsın. |
| **İmaj (image)** | Konteynerin kalıbı (ör. `postgres:18.6-alpine3.24`). Konteyner = imajdan çalıştırılmış örnek. |
| **Docker Compose** | Birden çok konteyneri tek bir dosyayla (`docker-compose.yml`) tanımlayıp birlikte başlatma aracı. |
| **Volume** | Konteyner silinse bile verinin saklandığı disk alanı. Silinirse veri de gider (`infra:reset` bunu yapar). |
| **Port** | Bir programın ağda dinlediği "kapı numarası". `15432:5432` = bilgisayarının 15432 kapısı → konteynerin 5432 kapısı. |
| **Healthcheck** | Docker'ın konteynere düzenli olarak "iyi misin?" diye sorduğu komut. Cevap olumluysa durum `healthy` olur. |
| **Idempotent** | Bir işlemi 1 kez de yapsan 10 kez de yapsan sonuç aynı. (Bucket varsa tekrar oluşturmaya çalışmaz.) |
| **S3 / bucket** | Amazon'un dosya depolama standardı. Dosyalar "bucket" denen kovalarda durur. Ürün görselleri burada saklanacak. |
| **Arşivlenmiş depo** | Sahibinin geliştirmeyi durdurduğu, artık güncelleme almayan açık kaynak proje. Güvenlik açısından kullanılmamalı. |
| **Ortam değişkeni (environment variable)** | Programa dışarıdan verilen ayar: `DATABASE_URL=postgresql://...`. Aynı kod, farklı ortamlarda (lokal, canlı) farklı ayarlarla çalışır. Şifreler koda değil buraya yazılır. |
| **`.env` dosyası** | Lokal geliştirmede ortam değişkenlerini tutan metin dosyası. Gizlidir, git'e girmez. Paylaşılan kopyası `.env.example`'dır (gerçek şifresiz). |
| **Şema (schema)** | Verinin nasıl olması gerektiğinin tarifi: "DATABASE_URL zorunlu ve postgres adresi olmalı". **Zod** bu tarifi kodla yazmamızı sağlar. |
| **Birim testi (unit test)** | Tek bir fonksiyonu yalıtılmış olarak deneyen küçük otomatik test. |
| **Süreç testi** | Uygulamayı gerçekten ayrı bir program olarak başlatıp davranışını (çıkış kodu, ekrana yazdığı) kontrol eden test. |
| **Çıkış kodu (exit code)** | Program kapanırken bıraktığı sayı: `0` = başarılı, `1` (veya başka) = hata. Otomasyon araçları buna bakar. |
| **Entegrasyon testi** | Birden çok parçanın (kod + gerçek veritabanı + HTTP) birlikte doğru çalıştığını deneyen test. |
| **E2E (uçtan uca) testi** | Gerçek tarayıcıda, gerçek kullanıcı gibi siteyi gezen test. |
| **Mock (sahte)** | Testte gerçek bir parçanın yerine konan taklit. Hızlıdır ama gerçek hataları gizleyebilir. |
| **Erişilebilirlik (a11y)** | Sitenin görme, işitme, hareket engelli kullanıcılar dahil herkes tarafından kullanılabilmesi. "a11y" = a + 11 harf + y. |
| **WCAG** | Web erişilebilirlik standardı. Hedefimiz WCAG 2.2 AA seviyesi. |
| **Coverage (kapsam)** | Testlerin kodun yüzde kaçını çalıştırdığı. Ödeme/sepet gibi kritik modüllerde hedef ≥ %85. |

---

## 3. Dosya rehberi

> Projede gördüğün her dosya ve klasörün kısa açıklaması. Yeni dosyalar eklendikçe tablo büyür.

### Kök dizindeki dosyalar

| Dosya | Ne işe yarar? | Hangi görevde geldi |
|---|---|---|
| `CLAUDE.md` | Claude'un çalışma kuralları (anayasa). | başlangıç |
| `ROADMAP.md` | Bütün görevler ve kabul kriterleri. `[x]` = bitti. | başlangıç |
| `BASLARKEN.md` | Senin için kısa başlangıç kılavuzu. | başlangıç |
| `package.json` | Kök projenin kimlik kartı: hangi pnpm/Node sürümü, hangi komutlar (`scripts`), hangi araçlar. | F0.1 |
| `pnpm-workspace.yaml` | pnpm'e "şu klasörlerdeki her şey bu projenin parçası" der; ayrıca pnpm ayarları. | F0.1 |
| `pnpm-lock.yaml` | Kilit dosyası — otomatik üretilir, **elle düzenlenmez**, commit'lenir. | F0.1 |
| `turbo.json` | Turborepo'ya görevlerin (build, test…) nasıl ve hangi sırayla çalışacağını söyler. | F0.1 |
| `.nvmrc` | Projenin Node sürümü (26.13.1). nvm gibi araçlar ve CI bunu okur. | F0.1 |
| `.editorconfig` | Editörlere ortak kural: UTF-8, 2 boşluk girinti, LF satır sonu. Herkesin kodu aynı biçimde. | F0.1 |
| `.gitignore` | Git'in **takip etmeyeceği** dosyalar: `node_modules`, derleme çıktıları, gizli `.env` dosyaları. | F0.1 |
| `.gitattributes` | Windows'ta bile depoda satır sonlarının LF kalmasını sağlar (Windows CRLF kullanır, karışıklık olmasın). | F0.1 |
| `scripts/not-ready.mjs` | Henüz kurulmamış komutları (`pnpm e2e` gibi) çağırınca "şu görevde gelecek" diye **hata** veren küçük betik. Sessizce "başarılı" demesin diye. | F0.1 → F0.7'de silindi (son yer tutucu da gerçek komutla değişti) |
| `eslint.config.js` | Kökteki dosyalar için ESLint ayarı. Asıl kurallar `packages/config/eslint/base.js`'te; bu dosya onları çağırır. | F0.2 |
| `commitlint.config.js` | Commit mesajı kuralları (Conventional Commits). | F0.2 |
| `lint-staged.config.js` | Commit'ten önce **yalnızca değişen dosyalarda** hangi kontrollerin çalışacağı. | F0.2 |
| `.husky/pre-commit` | Her commit'ten **önce** çalışan kanca → `lint-staged`'i çalıştırır. | F0.2 |
| `.husky/commit-msg` | Commit mesajı yazılınca çalışan kanca → `commitlint` ile mesajı denetler. | F0.2 |
| `.prettierignore` | Prettier'ın dokunmayacağı dosyalar (kilit dosyası ve Markdown belgeleri). | F0.2 |
| `knip.json` | Knip'e (ölü kod avcısı) projenin giriş noktalarını söyler. | F0.2 |
| `.github/workflows/ci.yml` | **CI iş akışı**: GitHub'a her kod gönderildiğinde bütün kontrolleri (biçim, tip, lint, test, derleme, e2e) otomatik çalıştırır. | F0.8 |
| `scripts/actionlint.mjs` | CI dosyasını hatalara karşı denetleyen `actionlint` aracını Docker ile çalıştırır (`pnpm lint:ci`). | F0.8 |
| `docker-compose.yml` | Lokal servislerin tarifi: veritabanı, Redis, arama motoru, dosya deposu, e-posta yakalayıcı. | F0.3 |
| `.env.example` | **Bütün ortam değişkenlerinin açıklamalı listesi** (gerçek şifre yok). Kopyalayıp `.env` yaparsın. | F0.5 |
| `.env` | Senin lokal ayarların (`.env.example`'ın kopyası). **Git'e girmez.** Silinirse uygulamalar "şu değişken eksik" diyerek açılmaz. | F0.5 |

### `packages/utils` içi

| Dosya | Ne işe yarar? | Görev |
|---|---|---|
| `src/env.ts` | Ortam değişkenlerini doğrulayan ortak yardımcılar: `parseEnv` (kontrol et, sorunluları listele), `parseEnvOrExit` (sorun varsa yaz ve programı kapat). | F0.5 |
| `src/env.test.ts` | Yukarıdakilerin testleri (eksik, boş, geçersiz değer; gizli değerin mesaja sızmaması…). | F0.5 |
| `tsconfig.build.json` | Paketi `dist/`'e derleme ayarı (testleri dışarıda bırakır). Diğer uygulamalar derlenmiş `dist/`'i kullanır. | F0.5 |
| `vitest.config.ts` | Test aracının ayarı: hangi dosyalar test. | F0.5 |

### `packages/config` içi

| Dosya | Ne işe yarar? | Görev |
|---|---|---|
| `tsconfig/base.json` | Bütün projenin **ortak TypeScript ayarı**. Her uygulama bunu `extends` ile miras alır. | F0.2 |
| `eslint/base.js` | Bütün projenin **ortak lint kuralları** (bir fonksiyon: `baseConfig(klasör)`). | F0.2 |
| `prettier/index.js` | Ortak biçim kuralları: tek tırnak, satır sonu virgülü, 100 karakter satır. | F0.2 |
| `eslint.config.js`, `tsconfig.json` | Config paketinin **kendi** dosyalarını denetlemek için (evet, ayar dosyaları da denetleniyor). | F0.2 |
| `tsconfig/nextjs.json`, `tsconfig/nestjs.json` | Ortak tabanın Next.js ve NestJS için özelleştirilmiş hâlleri. | F0.4 |
| `eslint/next.js`, `eslint/nest.js` | Ortak lint kurallarına Next/React ve Nest'e özel kuralların eklenmiş hâlleri. | F0.4 |

### `apps/web` ve `apps/admin` içi (Next.js — ikisi aynı yapıda)

| Dosya | Ne işe yarar? | Görev |
|---|---|---|
| `app/` | **App Router** klasörü: buradaki klasör yapısı = sitenin adresleri. `app/page.tsx` → `/`, ileride `app/urun/[slug]/page.tsx` → `/urun/koltuk-takimi`. | F0.4 |
| `app/layout.tsx` | Bütün sayfaları saran ortak çerçeve: `<html lang="tr">`, `<body>`. Header/footer ileride buraya gelir. Sayfa başlığı (`metadata`) burada. | F0.4 |
| `app/page.tsx` | Ana sayfanın kendisi (şimdilik boş `<main />`). | F0.4 |
| `app/globals.css` | Global stil dosyası; Tailwind'i içeri alır. | F0.4 |
| `messages/tr.json` | **Kullanıcıya görünen bütün Türkçe metinler.** Kodun içine metin gömülmez; ileride İngilizce eklemek için `en.json` yeter. | F0.4 |
| `next.config.ts` | Next.js ayarları. Açılışta kökteki `.env`'i okur ve ortamı doğrular (F0.5). | F0.4 |
| `env.ts` | Bu uygulamanın ihtiyaç duyduğu ortam değişkenlerinin şeması (şimdilik `API_URL`). | F0.5 |
| `env.test.ts`, `vitest.config.ts` | Şema testleri ve test ayarı. | F0.5 |
| `postcss.config.mjs` | CSS işleme hattı; Tailwind eklentisini çalıştırır. | F0.4 |
| `tsconfig.json`, `eslint.config.js` | Ortak ayarları (`packages/config`) miras alan kısa dosyalar. | F0.4 |
| `.next/`, `next-env.d.ts` | Next'in ürettiği derleme çıktısı ve tip dosyası — **otomatik**, git'e girmez. | F0.4 |

### `apps/api` içi (NestJS)

| Dosya | Ne işe yarar? | Görev |
|---|---|---|
| `src/main.ts` | API'nin **giriş noktası**: önce ortamı doğrular, sonra uygulamayı kurar ve `API_PORT`'u (4000) dinler. | F0.4 |
| `src/env.ts` | API ve worker'ın ortam değişkenleri şeması: veritabanı, Redis, arama, S3, SMTP adresleri. | F0.5 |
| `src/env.test.ts` | Şema testleri: her zorunlu değişken eksikken adıyla reddediliyor mu? | F0.5 |
| `test/` | **Entegrasyon testleri** (`*.int.test.ts`): gerçek veritabanı, gerçek HTTP isteği, gerçek süreç. `src/` içindeki `*.test.ts` ise birim testleri. | F0.6 |
| `test/startup.int.test.ts` | **Derlenmiş** API ve worker'ı `DATABASE_URL` olmadan gerçekten başlatır; "eksik" deyip 1 koduyla kapandığını kontrol eder. | F0.5 |
| `test/postgres.int.test.ts` | Docker'da geçici bir Postgres açar, bağlanır, Türkçe karakterli veri yazıp okur. | F0.6 |
| `test/health.int.test.ts` | API'yi test modunda kurar, `GET /health/live`'a gerçek HTTP isteği atar (200), olmayan adrese 404. | F0.6 |
| `test/support/postgres.ts` | Testler için geçici Postgres konteyneri başlatan yardımcı (Testcontainers). | F0.6 |
| `test/support/valid-env.ts` | Testlerde kullanılan örnek geçerli ortam. Derlemeye girmez. | F0.5 |
| `vitest.config.ts` | İki test projesi: `unit` (hızlı) ve `integration` (Docker ister); kapsam (coverage) ayarı. | F0.6 |
| `tsconfig.build.json` | `nest build`'in kullandığı derleme ayarı (test dosyalarını dışarıda bırakır). | F0.5 |
| `src/main.worker.ts` | **İşçi (worker)** sürecinin giriş noktası: e-posta gönderme, arama indeksleme gibi arka plan işleri burada çalışacak (F2.6). | F0.4 |
| `src/app.module.ts` | API'nin **kök modülü**: bütün özellik modüllerini (health, ileride catalog, cart, orders…) bir araya getirir. | F0.4 |
| `src/worker.module.ts` | İşçinin kök modülü. | F0.4 |
| `src/health/health.controller.ts` | `GET /health/live` adresi: "API ayakta mı?" sorusuna `{"status":"ok"}` cevabı. | F0.4 |
| `src/health/health.module.ts` | Health controller'ını paketleyen modül. | F0.4 |
| `nest-cli.json` | Nest CLI ayarı: kaynak `src/`, derleyici `tsc`. | F0.4 |
| `dist/` | Derlenmiş JavaScript — **otomatik**, git'e girmez. | F0.4 |

### `e2e/` içi (Playwright)

| Dosya | Ne işe yarar? | Görev |
|---|---|---|
| `playwright.config.ts` | Tarayıcı testlerinin ayarı: hangi tarayıcı, Türkçe dil/saat dilimi, testlerden önce hangi sunucuların başlatılacağı. | F0.6 |
| `tests/*.spec.ts` | Tarayıcı testleri. `home.spec.ts`: ana sayfa ve panel; `a11y-helper.spec.ts`: denetim aracının kendisini test eder. | F0.6 |
| `support/a11y.ts` | `expectNoA11yViolations(page)`: sayfayı axe ile tarar, ciddi/kritik ihlalde testi düşürür. | F0.6 |
| `support/messages.ts` | Testler sayfa metnini uygulamanın `messages/tr.json` dosyasından okur (metin değişse de test bozulmaz). | F0.6 |
| `support/urls.ts` | Uygulama adresleri (3000, 3001, 4000). | F0.6 |
| `playwright-report/`, `test-results/` | Test raporu ve hata anındaki ekran görüntüleri — **otomatik**, git'e girmez. | F0.6 |
| `ui-snap/cli.ts` | `pnpm ui:snap` komutunun giriş noktası: tarayıcıyı açar, sonuçları `.artifacts/screens/`'e yazar. | F0.7 |
| `ui-snap/options.ts` | Komut argümanlarını okur (`/rota --states hover,focus`), rotayı klasör adına çevirir. | F0.7 |
| `ui-snap/snap.ts` | Asıl iş: her ekran genişliğinde sayfayı açar, ekran görüntülerini alır. | F0.7 |
| `ui-snap/page-checks.ts` | Yatay taşma ölçümü ve konsol hatası toplama. | F0.7 |
| `ui-snap/states.ts` | Sayfayı "üzerine gelinmiş", "odaklanmış", "menü açık" durumlarına getirir. | F0.7 |
| `ui-snap/report.ts` | Okunur raporu üretir (⚠ uyarılar, ✔ temiz). | F0.7 |
| `tests/ui-snap.spec.ts` | Aracın kendisinin testi: bilerek taşan + konsola hata yazan sayfada uyarı veriyor mu? | F0.7 |

Kökteki `.artifacts/` klasörü: `ui:snap` çıktıları (ekran görüntüleri + `report.json`) — **otomatik**, git'e girmez.

### Klasörler

| Klasör | Ne işe yarar? |
|---|---|
| `apps/web` | Müşterilerin gördüğü vitrin sitesi (Next.js) — `localhost:3000`. |
| `apps/admin` | Yönetim paneli (Next.js) — `localhost:3001`. |
| `apps/api` | Arka uç API'si (NestJS) — `localhost:4000`. Veritabanı şeması da burada olacak (F2.2). |
| `packages/ui` | Ortak tasarım sistemi: renkler, butonlar, formlar… web ve admin aynısını kullanır. |
| `packages/contracts` | API ile ön yüz arasındaki "sözleşme": veri şemaları (Zod). |
| `packages/config` | Ortak ayar dosyaları: TypeScript, ESLint, Tailwind. |
| `packages/utils` | Küçük, saf yardımcı fonksiyonlar: para biçimlendirme, slug, telefon, tarih. |
| `e2e/` | Uçtan uca testler: gerçek tarayıcı açıp siteyi müşteri gibi gezen testler (Playwright). |
| `docs/` | Proje belgeleri. |
| `node_modules/` | İndirilen paketler. **Git'e girmez**, silinirse `pnpm install` ile geri gelir. |

### `docs/` belgeleri

| Dosya | Ne anlatır? |
|---|---|
| `PROGRESS.md` | İlerleme günlüğü: ne yapıldı, hangi testler geçti, ne bekleniyor. |
| `DECISIONS.md` | Teknik kararlar ve **neden** öyle karar verildiği (ADR = Architecture Decision Record). |
| `STACK.md` | Kullanılan her aracın tam sürümü ve ne zaman doğrulandığı. |
| `ARCHITECTURE.md` | Backend mimarisi, veri modeli, ödeme/sipariş akışları. |
| `DESIGN_SYSTEM.md` | Renkler, yazı tipleri, buton kuralları, animasyon kuralları. |
| `REFERENCE.md` | Sayfaların şartnamesi (ana sayfa, ürün sayfası…). |
| `OGRENME.md` | Bu dosya. |

---

## 4. Araçlar — ne, neden, nasıl?

### pnpm (paket yöneticisi)
- **Ne:** Paketleri indirir ve monorepo'daki paketleri birbirine bağlar.
- **Neden npm değil:** Paketleri diskte tek bir yerde tutup projelere bağlantı verir → hızlı ve az yer kaplar.
  Ayrıca bir paketin, `package.json`'unda yazmadığı bir paketi "kazara" kullanmasına izin vermez (katı ve güvenli).
- **Bizdeki özel ayar:** `package.json → devEngines.runtime` alanı. pnpm, projenin Node 26.13.1 ile çalışmasını
  sağlamak için bu sürümü **kendisi indirir** — senin bilgisayarındaki Node (22) değişmeden kalır.
- **Güvenlik özelliği:** pnpm 12, yeni yayınlanmış paket sürümlerini bir süre bekletir (kötü niyetli bir sürüm
  yayınlanıp hemen fark edilirse diye). Biz en güncel kararlı sürümü bilinçli olarak seçtiğimiz için o sürümleri
  `pnpm-workspace.yaml` içinde tek tek istisna yazıyoruz (ADR-005).
- **Sık komutlar:**
  - `pnpm install` → bütün bağımlılıkları kurar.
  - `pnpm install --frozen-lockfile` → kilit dosyasına **birebir** uyarak kurar; uyuşmazlık varsa hata verir (CI böyle kurar).
  - `pnpm <script-adı>` → package.json'daki script'i çalıştırır (ör. `pnpm verify`).
  - `pnpm view <paket> version` → bir paketin en güncel sürümünü sorar.
  - `pnpm --filter @mobilya/web <komut>` → komutu yalnızca bir pakette çalıştırır.

### Turborepo (`turbo`)
- **Ne:** Monorepo'daki bütün paketlerde görevleri (build, test, lint…) çalıştıran yönetici.
- **Neden:** (1) Bağımlılık sırasını bilir: `packages/ui` derlenmeden `apps/web` derlenmez (`turbo.json`'daki `"dependsOn": ["^build"]`
  bunu söyler; `^` = "önce bağımlı olduğum paketler"). (2) **Önbellek:** Bir paketin kodu değişmediyse sonucu
  önceki çalıştırmadan getirir, tekrar derlemez → çok hızlı. (3) Birbirinden bağımsız görevleri paralel çalıştırır.
- **Nasıl:** Kök `package.json`'da `"build": "turbo run build"` yazıyor. Turbo, içinde `build` script'i olan her paketi bulup çalıştırır.

### TypeScript
- **Ne / neden:** Yukarıda sözlükte. Büyük projede hataların çoğunu kod çalışmadan yakalar.
- **Sürüm notu:** TypeScript 7 çıkmış (Go diliyle yeniden yazılmış, çok hızlı) ama lint aracımız henüz desteklemiyor.
  Bu yüzden 6.0.3 kullanıyoruz (ADR-004). Bu, "en yeniyi körü körüne almamak, araçların uyumuna bakmak" için güzel bir örnek.

### TypeScript ayarlarımız (`packages/config/tsconfig/base.json`) — neden bu kadar katı?
| Ayar | Ne yapar? | Mobilya sitesinde hangi hatayı önler? |
|---|---|---|
| `strict` | Bütün temel katı kontrolleri açar (ör. `null` olabilecek değeri kontrol etmeden kullanamazsın). | Ürünün indirimli fiyatı yokken `null.toFixed()` çökmesi. |
| `noUncheckedIndexedAccess` | `liste[0]` her zaman "belki `undefined`" sayılır. | Galeride hiç görsel yokken `gorseller[0].url` ile sayfanın çökmesi. |
| `exactOptionalPropertyTypes` | İsteğe bağlı alan "hiç yok" ile "değeri `undefined`" arasında ayrım yapar. | API'ye "alanı silme" ile "alanı boş bırak" farkının karışması. |
| `noImplicitReturns` | Fonksiyonun her yolu bir değer döndürmeli. | Bir `if` dalında fiyat döndürmeyi unutmak. |

### ESLint (lint aracı)
- **Ne:** Kodu okuyup kurallara aykırı kalıpları bulur. TypeScript "tip yanlış" der; ESLint "bu kod tehlikeli/kurala aykırı" der.
- **Kurallarımızdan örnekler** (hepsi `packages/config/eslint/base.js`'te):
  - `no-explicit-any`: `any` tipi yasak — TypeScript'in korumasını kapatır.
  - `no-console`: `console.log` üretim koduna kalmasın (log için ileride düzgün bir log aracı — pino — gelecek).
  - **Ham hex renk yasağı:** `.tsx` dosyalarında `'#ff0000'` yazamazsın; renkler tasarım token'larından gelmeli
    (`bg-primary` gibi). Böylece marka rengi değişince tek yerden değişir. (`no-restricted-syntax` kuralıyla, kendi yazdığımız desenle.)
  - **Tailwind keyfi değer yasağı:** `w-[37px]` gibi "o ana özel" ölçüler yasak; tasarım tutarlı kalsın.
  - Gerekçesiz `eslint-disable` yasak: bir kuralı kapatmak istersen yanına **neden** yazmalısın: `// eslint-disable-next-line kural -- neden`.
  - `simple-import-sort`: `import` satırları hep aynı sırada → farklar (diff) temiz.
- **Tipe duyarlı (type-aware) kurallar:** Bazı kurallar TypeScript'in tip bilgisini kullanır (ör. "bu değer `Promise` ama `await` edilmemiş").
  Bu yüzden ESLint'e tsconfig'in yeri söylenir (`projectService`).

### Prettier (biçimlendirici)
- **Ne:** Kodun görünüşünü otomatik düzeltir. Kimse "tek tırnak mı çift tırnak mı" tartışmaz; Prettier karar verir.
- **Neden Markdown hariç:** Belgelerimizdeki Türkçe tablolar ve uzun satırlar elle düzenlendi; Prettier onları yeniden dizerdi.
- **Komutlar:** `pnpm format` (düzelt), `pnpm format:check` (yalnızca kontrol et).

### Husky + lint-staged + commitlint (git kancaları)
Commit'i "kalite kapısı"na çeviren üçlü:
```
git commit -m "..."
   │
   ├─ .husky/pre-commit  → lint-staged → değişen dosyalarda: eslint --fix + prettier --write
   │                                      (hata varsa commit DURUR)
   └─ .husky/commit-msg  → commitlint → mesaj "tip(kapsam): açıklama" biçiminde mi?
                                         (değilse commit DURUR)
```
- **Husky:** Kancaları `.husky/` klasöründen git'e tanıtır (`pnpm install` sırasında `prepare` script'iyle).
- **Neden `pnpm exec` ile çağırıyoruz?** lint-staged Node ≥22.22.1 istiyor; senin bilgisayarındaki Node 22.18.
  `pnpm exec` projenin Node 26'sını kullanır. (Böyle bir uyumsuzluğu bulmak için paketin `engines` alanına bakılır.)

### Knip (ölü kod avcısı)
- **Ne:** Hiç kullanılmayan dosyaları, export'ları ve `package.json`'da yazılı ama kullanılmayan bağımlılıkları bulur.
- **Komut:** `pnpm knip`. Proje büyüdükçe "unutulmuş çöp" birikmesini önler.

### Next.js (vitrin ve yönetim paneli)
- **Ne:** React ile web sitesi yapma çatısı (framework). React sayfa *parçalarını* yazar; Next.js bunları adreslere bağlar,
  sunucuda HTML üretir, görselleri optimize eder, derleme yapar.
- **Neden:** E-ticarette Google'da görünmek (SEO) ve hızlı açılmak kritik. Next.js sayfaları **sunucuda** hazırlayıp
  (Server Components) tarayıcıya hazır HTML gönderir → hızlı ilk açılış, arama motorları içeriği okur.
- **App Router mantığı:** Klasör = adres. `app/sepet/page.tsx` dosyası oluşturursan `/sepet` sayfası olur.
- **`layout.tsx` vs `page.tsx`:** Layout, sayfa değişse de kalan çerçeve (header, footer); page, değişen içerik.
- **Komutlar:** `next dev` (geliştirme — kaydedince anında yenilenir), `next build` (yayın için derle), `next start` (derlenmişi çalıştır).

### Tailwind CSS
- **Ne:** Hazır küçük CSS sınıflarıyla stil verme: `class="p-4 text-lg"` = iç boşluk 4 birim, büyük yazı.
- **Neden:** Ayrı CSS dosyalarında kaybolmak yerine stil, bileşenin yanında durur; F1.1'de sadece **bizim tasarım token'larımız**
  kullanılabilecek şekilde kısıtlanacak (rastgele renk/ölçü yok → tutarlı tasarım).

### NestJS (API)
- **Ne:** Node.js ile sunucu (API) yazma çatısı. Kodu **modüllere** böler: her modülün bir *controller*'ı (adresleri karşılar),
  bir *service*'i (iş kuralları) ve ileride bir *repository*'si (veritabanı) olur.
  ```
  İstek → Controller (ince: sadece karşılar) → Service (fiyat hesapla, stok kontrol et) → Repository (veritabanı)
  ```
- **Neden:** Mağazanın kuralları karmaşık (takım fiyatı, stok rezervasyonu, ödeme). Düzenli bir yapı olmadan büyük projede kod
  birbirine dolanır. Nest bu düzeni zorlar (ADR-001: modüler monolit).
- **Dekoratörler (`@Controller`, `@Get`, `@Module`):** Sınıflara/fonksiyonlara "etiket" yapıştırır. `@Get('live')` = "bu fonksiyon
  `GET /health/live` isteğini karşılar".
- **Bağımlılık enjeksiyonu (DI):** Bir sınıf ihtiyacı olan servisi kendisi oluşturmaz; Nest onu verir. Test ederken sahte servis
  vermeyi kolaylaştırır. (`reflect-metadata` paketi bunun için gerekli.)
- **ESM notu:** Nest 12 yeni JavaScript modül sistemini (ESM) kullanıyor. Bu yüzden API'de importlar `.js` uzantısıyla yazılır:
  `import { AppModule } from './app.module.js'` — dosya `.ts` olsa bile! (Derlendikten sonra `.js` olacağı için.)
- **API vs Worker:** İkisi aynı kod tabanından iki ayrı süreç. API kullanıcı isteklerine anında cevap verir; worker yavaş işleri
  (e-posta göndermek gibi) arka planda yapar. Böylece müşteri "sipariş ver"e basınca e-postanın gitmesini beklemez.

### Ortam değişkenleri ve Zod
- **Sorun:** Uygulama veritabanının adresini, şifreleri vb. bilmeli. Bunları koda yazarsak (1) şifreler git'e girer,
  (2) lokal ve canlı ortam için kodu değiştirmek gerekir. Çözüm: **ortam değişkenleri**.
- **Nereden gelir?** Lokalde kökteki `.env` dosyasından; canlı sunucuda sunucunun gizli bilgi yöneticisinden.
- **Zod ne yapıyor?** Değişkenleri program açılırken kontrol eder. Örnek (`apps/api/src/env.ts`):
  ```ts
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),   // zorunlu, postgres adresi olmalı
  API_PORT: port.default(4000),                           // verilmezse 4000; "4000" yazısını sayıya çevirir
  ```
  Bir sorun varsa program **hiç başlamaz** ve tam olarak neyin yanlış olduğunu söyler:
  ```
  Ortam değişkenleri geçersiz:
    • DATABASE_URL: eksik (zorunlu)
    • SMTP_PORT: geçersiz — Invalid input: expected number, received NaN
  Açıklamalar için kökteki .env.example dosyasına bakın.
  ```
- **Neden "başlamasın"?** Veritabanı adresi yanlış bir API açılsa da ilk siparişte çöker — müşterinin önünde. Açılışta
  hata vermek, sorunu kimse zarar görmeden yakalar ("fail fast" = erken ve gürültülü hata).
- **Güvenlik detayı:** Hata mesajı değişkenin **adını** söyler ama **değerini** asla yazmaz; şifre yanlış girilse bile
  log dosyasına düşmez. Bunu bir testle de garanti altına aldık.

### Vitest (test aracı)
- **Ne:** Otomatik testleri çalıştıran araç. `*.test.ts` dosyalarını bulur, içindeki `it('...')` bloklarını çalıştırır.
- **Bir testin yapısı** (`packages/utils/src/env.test.ts`'ten):
  ```ts
  it('eksik değişkenin adını hata mesajında söyler', () => {
    const error = captureError(() => parseEnv(schema, {}));   // hazırlık + eylem
    expect(error.message).toContain('DATABASE_URL');           // beklenti
  });
  ```
- **Komutlar:** `pnpm test` (hepsi), `pnpm --filter @mobilya/utils test` (tek paket). İzleme modu için paket klasöründe `pnpm exec vitest`.
  API'de: `pnpm --filter @mobilya/api test:unit` (yalnız birim), `test:int` (yalnız entegrasyon), `test:coverage` (kapsam raporu).

### Test piramidi — hangi test ne zaman?
```
            ▲  E2E (Playwright)          az, yavaş, en gerçekçi: tarayıcı açıp müşteri gibi gezer
           ▲▲▲ Entegrasyon (Vitest)      orta: gerçek veritabanı, gerçek HTTP isteği
         ▲▲▲▲▲▲ Birim (Vitest)           çok, hızlı: tek fonksiyon (ör. fiyat hesabı)
```
- **Birim:** "Takım fiyatından 1 parça çıkarınca toplam doğru mu?" — milisaniyeler sürer, yüzlercesi olur.
- **Entegrasyon:** "Sipariş kaydı veritabanına gerçekten yazılıyor mu? Aynı anda 20 kişi son ürünü alırsa 1 kişi mi alır?" — saniyeler.
- **E2E:** "Müşteri ana sayfadan ürüne, sepete, ödemeye gidebiliyor mu?" — en yavaşı, en az sayıda.

### Testcontainers
- **Ne:** Test başlarken Docker'da **geçici** bir servis (bizde Postgres) açar, test bitince siler.
- **Neden:** Sahte (mock) veritabanı, gerçeğin davranışını taklit eder ama birebir değildir — gerçek hatalar ancak gerçek
  veritabanında görünür. Lokal `pnpm infra:up` veritabanına da dokunmaz, her test dosyası tertemiz bir veritabanıyla başlar.
- Docker Desktop açık değilse entegrasyon testleri hata verir.

### Supertest + @nestjs/testing
- API'yi port açmadan bellekte kurup ona gerçek HTTP isteği atmayı sağlar: `request(app.getHttpServer()).get('/health/live')`.

### Playwright (e2e) ve axe (erişilebilirlik)
- **Playwright:** Gerçek bir tarayıcıyı (Chromium) kodla yönetir: sayfaya git, tıkla, yaz, "şu yazı görünüyor mu?" diye bak.
  `e2e/playwright.config.ts` testlerden önce üç uygulamayı kendisi başlatır (`webServer`).
- **axe:** Sayfayı engelli kullanıcılar açısından tarar (görselde alternatif metin var mı, renk kontrastı yeterli mi, klavyeyle
  kullanılabilir mi…). Kuralımız: **ciddi** veya **kritik** ihlal varsa test düşer. Hedef standart: WCAG 2.2 AA.
- **Testi test etmek:** `tests/a11y-helper.spec.ts`, alternatif metni olmayan bir görselle sahte sayfa kurar ve yardımcımızın
  bunu **yakaladığını** doğrular. Hiçbir şey yakalamayan bir denetim, hiç denetim olmamasından daha kötüdür: yanlış güven verir.
- **Etiketler:** Erişilebilirlik testleri `@a11y` etiketli; `pnpm e2e:a11y` yalnızca onları çalıştırır.

### Docker Compose ve lokal servislerimiz
Sitemizin arka ucu 5 yardımcı servise ihtiyaç duyar. Hepsini bilgisayarına tek tek kurmak yerine Docker konteynerlerinde çalıştırıyoruz:

| Servis | Ne işe yarar? | Senin bilgisayarındaki adres | Tarayıcıdan bak |
|---|---|---|---|
| **PostgreSQL** | Ana veritabanı: ürünler, siparişler, kullanıcılar. | `localhost:15432` | — |
| **Redis** | Çok hızlı bellek-içi depo: oturumlar, oran sınırlama, iş kuyruğu (BullMQ). | `localhost:16379` | — |
| **Meilisearch** | Arama motoru: "gardırop" yazınca "gardirop"u da bulur, yazım hatası tolere eder. | `localhost:17700` | http://localhost:17700 |
| **RustFS (S3)** | Dosya deposu: ürün fotoğrafları. Amazon S3 ile aynı dili konuşur. | `localhost:19000` | Konsol: http://localhost:19001 (kullanıcı `mobilya` / şifre `mobilya_dev_secret`) |
| **Mailpit** | Sahte e-posta sunucusu: site e-posta gönderince gerçek kişiye gitmez, burada yakalanır. | SMTP `localhost:11025` | http://localhost:18025 |

- **Neden portlar 15432 gibi?** Bilgisayarında başka bir projenin (todo) Postgres'i zaten 5432'de çalışıyor. Aynı kapıyı iki
  program kullanamaz. Kural basit: **standart port'un başına 1** (5432 → 15432).
- **Neden MinIO değil de RustFS?** Belgelerde MinIO yazıyordu. Kurarken gördük ki MinIO'nun açık kaynak projesi **arşivlenmiş**:
  artık güvenlik güncellemesi almıyor. Aynı S3 dilini konuşan, aktif geliştirilen RustFS'e geçtik (ADR-006). Kodumuz S3
  standardını kullandığı için ileride gerçek bir bulut deposuna geçmek de kolay olacak.
- **`healthcheck` neden önemli?** "Konteyner açıldı" ≠ "servis hazır". Postgres açıldıktan birkaç saniye sonra bağlantı
  kabul eder. `--wait` bayrağı, hepsi `healthy` olana kadar bekler; böylece testler hazır olmayan veritabanına bağlanmaya çalışmaz.
- **`s3-init` nedir?** Fotoğrafların konacağı `media` bucket'ını oluşturan, işi bitince kapanan küçük bir konteyner.
  Bucket zaten varsa "zaten var" der ve dokunmaz (idempotent).
- **Komutlar:**
  - `pnpm infra:up` → servisleri başlat (Docker Desktop açık olmalı).
  - `pnpm infra:down` → durdur (veriler kalır).
  - `pnpm infra:reset` → **bütün verileri sil** ve sıfırdan başlat.
  - `docker compose ps` → durumlar; `docker compose logs postgres` → bir servisin logları.

### Git
- **Ne:** Her değişikliğin geçmişini tutar; bir şey bozulursa eski hâline dönülebilir.
- **Bizdeki kural:** Her görev bir commit. Mesajlar "Conventional Commits" biçiminde: `feat(catalog): ... [F4.7]`
  - `feat` = yeni özellik, `fix` = hata düzeltme, `chore` = altyapı/bakım işi, `docs` = belge.
- **Sık komutlar:** `git status` (ne değişti?), `git log --oneline` (geçmiş), `git diff` (değişikliğin kendisi).

---

## 5. Sık kullanılan proje komutları

| Komut | Ne yapar? | Ne zaman çalışır hâle geldi |
|---|---|---|
| `pnpm install` | Bağımlılıkları kurar | F0.1 |
| `pnpm verify` | typecheck + lint + test + build — "her şey yolunda mı?" kontrolü | F0.1 (içi görevlerle doluyor) |
| `pnpm typecheck` / `lint` / `test` / `build` | `verify`'ın parçaları tek tek | F0.1 (içi görevlerle doluyor) |
| `pnpm dev` | Üç uygulamayı birlikte başlatır: web :3000, admin :3001, api :4000 (durdurmak: `Ctrl+C`) | F0.4 |
| `pnpm --filter @mobilya/web dev` | Yalnızca bir uygulamayı başlatır | F0.4 |
| `pnpm e2e`, `pnpm e2e:a11y` | Tarayıcı testleri, erişilebilirlik testleri | F0.6'da gelecek |
| `pnpm ui:snap <rota>` | Sayfanın 4 ekran genişliğinde ekran görüntüsünü alır, taşma ve konsol hatası raporlar (uygulama çalışıyor olmalı) | F0.7 |
| `pnpm knip` | Kullanılmayan kod/bağımlılık avcısı | F0.2 |
| `pnpm format` / `pnpm format:check` | Kodu Prettier ile biçimlendir / yalnızca kontrol et | F0.2 |
| `pnpm infra:up` / `infra:down` / `infra:reset` | Lokal servisleri başlat / durdur / verileri silip sıfırla | F0.3 |
| `pnpm test` | Bütün otomatik testleri çalıştırır | F0.5 |
| `cp .env.example .env` | İlk kurulumda lokal ayar dosyasını oluşturur | F0.5 |
| `pnpm e2e:install` | Playwright'ın tarayıcısını (Chromium) indirir — ilk kurulumda bir kez | F0.6 |
| `pnpm lint:ci` | GitHub Actions iş akışı dosyasını denetler (Docker gerekir) | F0.8 |
| `pnpm e2e` / `pnpm e2e:a11y` | Uygulamaları derleyip tarayıcı testlerini / yalnızca erişilebilirlik testlerini çalıştırır | F0.6 |
| `pnpm --filter @mobilya/e2e exec playwright show-report` | Son e2e çalıştırmasının görsel raporunu tarayıcıda açar | F0.6 |

---

## 6. Adım adım günlük

> Her görev: **Ne yaptık → Neden → Öğrenilecek kavram → Kendin dene.** En yeni en altta (hikâye sırası).

### F0.1 · Monorepo iskeleti ve sürüm kilidi (2026-11-12)

**Ne yaptık?**
1. `git init` ile projeyi bir git deposu yaptık (ana dal adı `main`).
2. Kök `package.json`'u yazdık: pnpm sürümünü (`packageManager`), Node sürümünü (`devEngines`) ve proje
   komutlarını (`scripts`) tanımladık.
3. `pnpm-workspace.yaml` ile `apps/*`, `packages/*` ve `e2e` klasörlerini workspace olarak tanıttık.
4. `CLAUDE.md §3.1`'deki klasör yapısını oluşturduk. Paketler şimdilik boş (yalnızca `package.json`);
   uygulamalar F0.4'te kurulacak.
5. Ortak ayar dosyaları: `.nvmrc`, `.editorconfig`, `.gitignore`, `.gitattributes`.
6. Kullanacağımız ~45 paketin **o günkü en güncel kararlı** sürümünü tek tek sorguladık ve `docs/STACK.md`'ye yazdık.

**Neden böyle?**
- **Sürümleri neden tam yazıyoruz?** `"react": "^19.3.1"` yazsaydık, yarın 19.4.0 çıktığında başka bir bilgisayardaki kurulum
  farklı sürüm alabilirdi → "bende çalışıyor, sende çalışmıyor" sorunu. Tam sürüm + lockfile = herkes aynı.
- **Sürümleri neden hafızadan değil, sorgulayarak?** Sorguladığımızda iki sürpriz çıktı:
  - `prisma`'nın "latest" etiketi bir **RC (deneme sürümü)** gösteriyordu. Körü körüne `latest` alsaydık kararsız sürüm kurulacaktı.
    `dist-tags` ile bakınca son kararlı sürümün 7.10.1 olduğu görüldü.
  - TypeScript 7 çıkmış ama lint aracı desteklemiyor. Paketlerin `peerDependencies` alanı ("ben şu sürümlerle çalışırım")
    kontrol edilerek bulundu.
- **`scripts/not-ready.mjs` neden var?** `pnpm e2e` henüz kurulmadı. Boş bırakılsaydı ya "komut bulunamadı" ya da hiçbir şey
  yapmadan "başarılı" dönebilirdi. Kurallarımız sahte başarıyı yasaklıyor, bu yüzden açıkça hata veriyor.

**Öğrenilecek kavramlar:** monorepo, workspace, lockfile, tam sürüm sabitleme, `dist-tags`, `peerDependencies`, tedarik zinciri güvenliği.

**Kendin dene** (VS Code'da `Ctrl+ö` ile terminali aç):
```bash
pnpm exec node -v           # → v26.13.1  (projenin Node'u)
node -v                     # → v22.x     (bilgisayarının Node'u — farklı! devEngines sayesinde)
pnpm view prisma dist-tags  # "latest" ile "prev" etiketlerini karşılaştır
pnpm verify                 # şimdilik "0 görev" — paketler doldukça burada iş görünecek
pnpm e2e                    # (F0.1 anında "henüz kurulmadı" hatası verirdi; F0.6'dan beri gerçek testleri çalıştırır)
git log --oneline           # ilk commit'i gör
```

### F0.2 · TypeScript, ESLint, Prettier, git kancaları (2026-11-12)

**Ne yaptık?**
1. `packages/config` paketini doldurduk: ortak TypeScript ayarı, ortak ESLint kuralları, ortak Prettier ayarı.
   Uygulamalar (F0.4'te gelecek) bunları sıfırdan yazmayacak, **miras alacak**.
2. Projeye özel iki kural yazdık: `.tsx` dosyalarında ham hex renk ve Tailwind keyfi değer yasağı.
3. Git kancalarını kurduk: commit'ten önce lint + biçimlendirme, commit mesajı denetimi.
4. Knip'i kurduk.

**Neden böyle?**
- **Ortak ayar paketi:** Üç uygulama + dört paket var. Her birinde ayrı ayarlar olsaydı zamanla birbirinden ayrışırdı
  ("web'de `any` serbest, api'de yasak" gibi). Tek kaynak = tutarlılık.
- **Kuralları test ettik:** Bilerek hatalı bir dosya yazdık (`any`, `console.log`, `'#ff0000'`, `w-[37px]`, `liste[0]`…) ve
  araçların **her birini yakaladığını gördük**, sonra dosyayı sildik. Bir kuralı yazmak yetmez; çalıştığını görmek gerekir.
  Bu testte bir şey daha öğrendik: `data-[state=open]:` gibi Radix bileşenlerinin kullandığı *varyantlar* yasaklanmamalı,
  yalnızca `w-[37px]` gibi *değerler* yasak — kuralın deseni buna göre yazıldı.
- **Lint kendi kodumuzu da yakaladı:** `scripts/not-ready.mjs` içindeki `console.error`'ı `no-console` kuralı işaretledi.
  Kuralı kapatmak yerine doğru aracı kullandık: komut satırı betiğinde hata mesajı `process.stderr.write` ile yazılır.
- **Kötü commit mesajı denemesi:** `git commit -m "kotu mesaj formati"` → commitlint reddetti ("tip boş olamaz").

**Öğrenilecek kavramlar:** tsconfig ve `extends`, lint ile formatter farkı, tipe duyarlı lint, git kancaları, Conventional Commits, ölü kod.

**Kendin dene:**
```bash
pnpm lint                 # bütün lint görevleri (şimdilik config paketi + kök)
pnpm typecheck            # tip kontrolü
pnpm format:check         # biçim kontrolü
pnpm knip                 # ölü kod taraması
git commit --allow-empty -m "deneme"   # → commitlint reddeder ("type may not be empty"); hiçbir şey kaydedilmez
```
Bir de şunu dene: `packages/config/eslint/base.js` dosyasını VS Code'da aç ve kuralların yanındaki yorumları oku.

> **F0.2'den küçük bir ders (commit mesajı):** F0.2'yi kaydederken benim ilk commit mesajım
> `chore(config): TypeScript, ESLint, ...` idi ve **kendi kurduğumuz kanca reddetti**: konu (subject) büyük harfle
> başlamamalı. Mesajı `chore(config): ortak tsconfig, eslint, ...` diye düzelttim. Kurallar herkese, Claude'a da işliyor. 🙂

### F0.3 · Lokal servisler — Docker Compose (2026-11-12)

**Ne yaptık?**
1. `docker-compose.yml` yazdık: PostgreSQL, Redis, Meilisearch, RustFS (S3) ve Mailpit. Her birinin sağlık kontrolü ve
   kalıcı veri alanı (volume) var.
2. `media` bucket'ını oluşturan tek seferlik `s3-init` servisini ekledik.
3. `pnpm infra:up | infra:down | infra:reset` komutlarını ekledik.

**Neden böyle? — yolda karşılaştığımız 3 sorun ve çözümleri** (gerçek projede de hep böyle olur):
1. **MinIO arşivlenmişti.** Docker Hub'da imajı bulunamayınca GitHub'a baktık: proje Nisan 2026'da arşivlenmiş. Bakımsız
   yazılım güvenlik riski olduğu için alternatifleri karşılaştırdık (RustFS, SeaweedFS, Garage, Versity) ve kararı
   gerekçesiyle `DECISIONS.md`'ye (ADR-006) yazdık.
2. **RustFS'in hazır "bucket oluşturma" özelliği bu sürümde bozuktu.** Konteyner "CLI bu özelliği desteklemiyor" diye kapandı.
   Loglara (`docker compose logs s3`) bakarak bulduk. Çözüm: AWS'nin resmi komut satırı aracıyla ayrı küçük bir iş (`s3-init`).
3. **`--wait` tek seferlik işi beklemiyordu.** Komut "bitti" dediğinde bucket henüz oluşmamış olabilirdi. Çözüm: işi ayrı
   bir profile aldık ve `docker compose run` ile **sırayla** çalıştırdık; hata olursa `pnpm infra:up` da hata verir.

**Kabul kriterini nasıl kanıtladık?** Her servise bilerek veri yazdık (tablo, anahtar, arama indeksi, dosya, e-posta),
`pnpm infra:reset` çalıştırdık ve hepsinin silindiğini tek tek kontrol ettik. "Çalışıyor olmalı" demek yerine **gördük**.

**Öğrenilecek kavramlar:** konteyner, imaj, volume, port eşleme, healthcheck, idempotent işlem, S3/bucket, compose profilleri.

**Kendin dene** (Docker Desktop açık olmalı):
```bash
pnpm infra:up                     # servisleri başlat
docker compose ps                 # hepsi "(healthy)" olmalı
```
Sonra tarayıcıda:
- http://localhost:18025 → Mailpit gelen kutusu (şimdilik boş; F2.8'den sonra kayıt e-postaları buraya düşecek)
- http://localhost:19001 → RustFS konsolu (`mobilya` / `mobilya_dev_secret`) → `media` bucket'ını gör
- http://localhost:17700/health → Meilisearch `{"status":"available"}` demeli

Veritabanına bağlanmak istersen (ör. VS Code'da bir PostgreSQL eklentisiyle): sunucu `localhost`, port `15432`,
kullanıcı `mobilya`, şifre `mobilya_dev`, veritabanı `mobilya`.

### F0.4 · Uygulama iskeletleri (2026-11-12)

**Ne yaptık?**
1. **Vitrin** (`apps/web`) ve **yönetim paneli** (`apps/admin`) için iki Next.js uygulaması kurduk. Şimdilik boş sayfa
   gösteriyorlar ama Türkçe dil etiketi (`lang="tr"`), başlık ve Tailwind hazır.
2. **API** (`apps/api`) için NestJS uygulaması kurduk; ilk adresi `GET /health/live` → `{"status":"ok"}`.
3. Arka plan işleri için boş bir **worker** girişi ekledik (`main.worker.ts`).
4. `packages/config`'e Next.js ve NestJS'e özel tsconfig/ESLint ön ayarları ekledik.

**Neden böyle?**
- **Hazır şablon (`create-next-app`) yerine elle kurduk.** Şablon kendi lint ve TypeScript ayarlarını getirirdi; bizim
  ortak, daha katı ayarlarımızla çakışırdı. Elle kurunca her dosyanın neden orada olduğunu biliyoruz.
- **Başlık bile `messages/tr.json`'dan geliyor.** Kural: kullanıcıya görünen metin koda gömülmez. Şimdi alışkanlık edinirsek
  ileride yüzlerce metni toplamak zorunda kalmayız.
- **Yönetim paneline `noindex`:** Panel Google'da çıkmamalı.
- **`poweredByHeader: false`:** Site cevaplarında "Next.js ile yapıldı" bilgisini gizler. Saldırgana hangi yazılımı
  kullandığımızı söylemenin faydası yok. (API'de aynı başlık hâlâ var; F2.1'de `helmet` ile kaldırılacak.)
- **Sağlık adresi (`/health/live`):** Sunucuyu izleyen sistemler (Docker, barındırma) "uygulama ayakta mı?" diye buraya sorar.

**Nasıl doğruladık?** `pnpm verify` → 12 görevin hepsi yeşil (tip, lint, derleme). Sonra `pnpm dev` ile üçünü başlatıp
gerçek istek attık: API `200 {"status":"ok"}`, web ve admin `200` ve doğru başlıklar. Worker'ı da bir kez çalıştırıp
"Worker started" mesajını gördük.

**Öğrenilecek kavramlar:** framework, App Router (klasör = adres), layout/page, Server Components, NestJS modül/controller/service,
dekoratör, bağımlılık enjeksiyonu, ESM ve `.js` uzantılı importlar, API ile worker ayrımı.

**Kendin dene:**
```bash
pnpm dev
```
Sonra tarayıcıda:
- http://localhost:3000 → vitrin (boş beyaz sayfa; sekme başlığında `[MARKA_ADI]` yazar)
- http://localhost:3001 → panel (sekme başlığı `[MARKA_ADI] Yönetim`)
- http://localhost:4000/health/live → `{"status":"ok"}`

Küçük bir deney: `pnpm dev` açıkken `apps/web/app/page.tsx` dosyasında `<main />` yerine `<main>Merhaba</main>` yaz ve kaydet;
tarayıcı kendiliğinden yenilenir (hot reload). Sonra eski hâline geri al. (Gerçek metinler `messages/tr.json`'a gider —
bu sadece deney.) Bir sayfa dene: `apps/web/app/deneme/page.tsx` oluştur → http://localhost:3000/deneme açılır. Denemeden sonra sil.

### F0.5 · Ortam değişkeni doğrulama (2026-11-12)

**Ne yaptık?**
1. `packages/utils` paketine ilk gerçek kodu yazdık: ortam değişkenlerini Zod şemasıyla kontrol eden `parseEnv` ve
   sorun varsa programı açıklamayla kapatan `parseEnvOrExit`. Bu paket artık **derlenen** bir paket: diğer uygulamalar onun
   `dist/` çıktısını kullanıyor (Turborepo önce utils'i derliyor — `turbo.json`'daki `^build` sayesinde).
2. API, worker, vitrin ve panelin her birine kendi `env.ts` şemasını yazdık.
3. Kökte `.env.example` oluşturduk; her değişkenin ne işe yaradığını yorumla açıkladık.
4. İlk testlerimizi yazdık (toplam 26 test).

**Neden böyle?**
- **Ortak yardımcı, ayrı şemalar:** "Kontrol et ve hatayı güzel yaz" mantığı her yerde aynı → tek yerde (`utils`).
  Ama her uygulamanın ihtiyacı farklı (API veritabanını bilir, vitrin bilmez) → şema uygulamanın kendisinde.
- **Vitrin veritabanı adresini bilmiyor:** Kasıtlı. "Ön yüz veritabanına asla doğrudan bağlanmaz" kuralı (Büyük resim bölümü)
  ayar düzeyinde de geçerli: vitrine yalnızca `API_URL` veriliyor.
- **API `.env`'i nasıl okuyor?** Kodla değil, Node'un kendi bayrağıyla: `node --env-file-if-exists=../../.env dist/main.js`.
  Canlı sunucuda bu dosya yoktur, değerler sunucunun ortamından gelir. Böylece "dosya okuma" diye ayrı bir kod yolumuz olmuyor.
- **Kabul kriteri "testle" diyordu:** Bu yüzden yalnızca şemayı test etmekle yetinmedik. `startup.test.ts`, derlenmiş API'yi
  **gerçek bir program olarak** `DATABASE_URL` olmadan başlatıyor ve (1) çıkış kodunun 1 olduğunu, (2) "DATABASE_URL: eksik"
  yazdığını, (3) "listening" (dinliyorum) demediğini kontrol ediyor. Gerçek davranışı test etmek, parçayı test etmekten daha güçlü bir kanıttır.

**Yolda öğrendiğimiz:** İlk derlemede API çıktısı `dist/src/main.js`'e gitti (beklenen `dist/main.js`). Neden? tsconfig'e test
ayar dosyasını (`vitest.config.ts`) ekleyince TypeScript "kök klasör" olarak `src/` yerine `apps/api/`'yi seçti. Çözüm: derleme
için ayrı `tsconfig.build.json` + `rootDir: "src"`. Testler başarısız olunca hemen fark ettik — testlerin bir faydası da bu.

**Öğrenilecek kavramlar:** ortam değişkeni, `.env` ve `.env.example`, şema doğrulama (Zod), "fail fast", birim testi, süreç testi, çıkış kodu.

**Kendin dene:**
```bash
pnpm test                                  # 26 testin geçtiğini gör
```
Sonra bir deney: kökteki `.env` dosyasında `DATABASE_URL=...` satırının başına `#` koy (yorum yap), kaydet ve
```bash
pnpm --filter @mobilya/api build
pnpm --filter @mobilya/api start           # → "DATABASE_URL: eksik (zorunlu)" yazıp kapanır
```
Deneyden sonra `#` işaretini geri kaldır. Ardından `.env.example` dosyasını baştan sona oku — sitenin hangi dış servislere
bağlandığını tek sayfada görürsün.

### F0.6 · Test altyapısı (2026-11-12)

**Ne yaptık?**
1. API testlerini ikiye ayırdık: **birim** (`src/**/*.test.ts`, hızlı) ve **entegrasyon** (`test/**/*.int.test.ts`, Docker ister).
2. **Testcontainers** ile her test için geçici, gerçek bir Postgres açan yardımcı yazdık; örnek test bağlanıp Türkçe veri yazıp okuyor.
3. API'nin `/health/live` adresi için gerçek HTTP isteği atan ilk entegrasyon testini yazdık (Supertest).
4. **Playwright**'ı kurduk: testlerden önce üç uygulamayı derleyip başlatıyor, ana sayfaları açıp kontrol ediyor.
5. **axe** ile erişilebilirlik denetimi yardımcısını yazdık ve denetimin gerçekten çalıştığını ayrı bir testle kanıtladık.
6. `.only` ve `.skip` kullanımını lint ile yasakladık.

**Neden böyle?**
- **`.only` neden tehlikeli?** Bir test dosyasında `it.only(...)` unutulursa, test aracı **sadece o testi** çalıştırır ve geri
  kalan yüzlerce testi sessizce atlar — sonuç yine "yeşil" görünür. `.skip` da bir testi kalıcı olarak susturur. İkisi de
  "sahte başarı" yaratır; bu yüzden lint hatası.
- **Neden mock değil gerçek Postgres?** İleride "aynı anda 20 kişi son ürünü almaya çalışırsa yalnızca 1 kişi alabilmeli" gibi
  testler yazacağız (F6.3). Bu tür eşzamanlılık davranışlarını ancak gerçek veritabanı doğru gösterir.
- **Testler de koddur:** Bu görevde lint, test kodumuzda iki gerçek sorun buldu: `getHttpServer()` `any` döndürüyordu (tip
  güvenliği delinmişti) ve gereksiz bir bağımlılık vardı. Test kodu da aynı kalite kurallarına tabi.
- **Önemli bir doğrulama:** NestJS, bağımlılık enjeksiyonu için TypeScript'in "dekoratör metadatası" özelliğine ihtiyaç duyar;
  bazı test araçları bunu üretmez ve testler gizemli biçimde kırılır. Bunu sonra şaşırmamak için **şimdi** küçük bir deneme
  testiyle kontrol ettik: çalışıyor. Riskleri erkenden, ucuzken test etmek iyi bir alışkanlıktır.

**Öğrenilecek kavramlar:** test piramidi (birim / entegrasyon / e2e), Testcontainers, mock'un sınırları, Playwright, axe ve WCAG,
`.only`/`.skip` tehlikesi, kapsam (coverage).

**Kendin dene** (Docker Desktop açık olmalı):
```bash
pnpm test                                        # 30 test; Postgres konteynerinin açılıp kapandığını Docker Desktop'ta izleyebilirsin
pnpm e2e                                         # tarayıcı testleri (ilk seferde önce: pnpm e2e:install)
pnpm --filter @mobilya/e2e exec playwright show-report   # renkli raporu tarayıcıda aç
pnpm --filter @mobilya/api test:coverage         # kodun yüzde kaçı testli? (apps/api/coverage/index.html'i de açabilirsin)
```
Bir deney: `e2e/tests/home.spec.ts` içinde `toHaveAttribute('lang', 'tr')` satırındaki `'tr'`yi `'en'` yap, `pnpm e2e` çalıştır →
testin kırmızıya döndüğünü ve raporda nedenini gör. Sonra geri al.

### F0.7 · Görsel öz-kontrol aracı — `ui:snap` (2026-11-12)

**Ne yaptık?**
Bir sayfanın ekran görüntüsünü **4 farklı ekran genişliğinde** (375 telefon, 768 tablet, 1280 dizüstü, 1440 geniş ekran)
otomatik alan bir araç yazdık. Araç ayrıca:
- **Yatay taşma** var mı kontrol eder (telefonda sayfanın yana kayması — çok sık yapılan ve kullanıcıyı rahatsız eden bir hata) ve
  taşmaya **hangi öğenin** neden olduğunu söyler,
- **Konsol hatalarını** listeler (tarayıcının geliştirici konsolunda kırmızı yazan hatalar),
- İstenirse **etkileşim durumlarını** da çeker: üzerine gelme (hover), klavye odağı (focus), açık menü (menu).

**Neden?** Ben (Claude) sayfayı göremem — ancak ekran görüntüsünü açarak görebilirim. CLAUDE.md §4.2'ye göre her arayüz
görevinden sonra bu görüntüleri tek tek açıp tasarım kontrol listesine göre değerlendirmem gerekiyor. Bu araç o kontrolün gözü.

**İlginç teknik detaylar:**
- **Odak görüntüsü için neden önce Tab?** Tarayıcılar odak halkasını yalnızca klavye kullanan kişiye gösterir (`:focus-visible`).
  Fareyle tıklayınca halka çıkmaz. Araç önce Tab'a basarak tarayıcıyı "klavye kipine" alır, sonra öğeye odaklanır.
- **Derleme yok:** Node 26, TypeScript dosyalarını doğrudan çalıştırabiliyor (`node ui-snap/cli.ts`). Bu yüzden araç dosyaları
  birbirini `.ts` uzantısıyla içe aktarıyor.
- **Aracın testi bir hata buldu:** Her durum görüntüsünden önce sayfa yeniden yükleniyor; bu yüzden aynı konsol hatası 3 kez
  sayılıyordu (test 5 uyarı beklerken 13 buldu ve kırmızıya döndü). Hataları tekrarsız tutacak şekilde düzelttik.

**Öğrenilecek kavramlar:** duyarlı tasarım (responsive) ve kırılım noktaları, yatay taşma, `:focus-visible`, `data:` adresleriyle
test sayfası kurmak, aracın kendisini test etmek.

**Kendin dene:**
```bash
pnpm dev                                            # bir terminalde uygulamaları başlat
pnpm ui:snap / --states hover,focus,menu            # ikinci terminalde (PowerShell). Git Bash'te başına MSYS_NO_PATHCONV=1 ekle
```
Sonra VS Code'da `.artifacts/screens/index/` klasörünü aç ve görüntülere bak (şimdilik boş beyaz sayfa — F1 ve F4'te dolacak).
Panel için: `pnpm ui:snap / --base http://localhost:3001`.

### F0.8 · CI — GitHub Actions (2026-11-12)

**CI nedir?** "Continuous Integration" (sürekli entegrasyon): kod GitHub'a her gönderildiğinde, GitHub'ın kendi bilgisayarlarında
bütün kontroller **otomatik** çalışır. Bir şey bozulursa (test kırmızı, lint hatası) daha birleştirilmeden görülür. `main` dalı
böylece her zaman çalışır hâlde kalır.

**Ne yaptık?**
1. `.github/workflows/ci.yml` dosyasını yazdık. Sırayla: kodu al → Node 26 kur → pnpm kur (önbellekli) → bağımlılıkları kilit
   dosyasına birebir kur → `.env` hazırla → biçim kontrolü → `pnpm verify` → knip → Docker servislerini başlat → tarayıcı kur →
   `pnpm e2e` → test raporunu indirilebilir dosya olarak sakla.
2. İş akışı dosyasını denetleyen `actionlint`'i ekledik (`pnpm lint:ci`).

**Neden böyle?**
- **CI'a özel komut yok:** CI, senin bilgisayarında çalıştırdığın `pnpm verify`, `pnpm e2e` komutlarının **aynısını** çalıştırır.
  "Bende geçiyor ama CI'da kırılıyor" tartışmalarının çoğu böylece biter.
- **Action'lar neden uzun bir kodla (SHA) yazıldı?** `actions/checkout@v7` gibi bir etiket, sahibi tarafından sonradan başka bir koda
  taşınabilir; kötü niyetli biri ele geçirirse CI'mızda onun kodu çalışır (tedarik zinciri saldırısı). Commit SHA'sı değiştirilemez.
  Yanına yorum olarak sürümü yazdık (`# v7.0.1`) ki okunabilir kalsın.
- **`permissions: contents: read`:** CI işine en az yetkiyi veriyoruz; kodu okuyabilir, depoya yazamaz.
- **actionlint'i nasıl test ettik?** Bilerek hatalı bir iş akışı dosyası (yanlış yazılmış değişken adı `github.evnt`) ekledik,
  araç yakaladı, dosyayı sildik. Yine aynı ilke: aracın gerçekten çalıştığını gör.
- **Henüz GitHub'da çalışmadı:** Proje şu an yalnızca senin bilgisayarında. Bu yüzden aynı adımları yerelde `CI=1` ayarıyla
  sırayla çalıştırarak "prova" yaptık; hepsi geçti. Kodu GitHub'a gönderdiğinde (istersen birlikte yaparız) Actions sekmesinde
  gerçek çalıştırmayı görürsün.

**Öğrenilecek kavramlar:** CI, iş akışı (workflow), runner, önbellek, artefakt, SHA ile sabitleme, en az yetki ilkesi.

**Kendin dene:**
```bash
pnpm lint:ci        # iş akışı dosyasını denetle (Docker açık olmalı)
```
Sonra `.github/workflows/ci.yml` dosyasını aç ve adımları yukarıdaki listeyle karşılaştırarak oku — her `run:` satırı senin de
terminalde çalıştırabileceğin bir komut.
