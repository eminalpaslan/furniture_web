# Yol Haritası

> **Kullanım:** Görevler yukarıdan aşağıya, bağımlılıkları bitmiş olan ilk işaretsiz görevden devam edilir.
> Her görev `CLAUDE.md §2.2` döngüsüyle yapılır ve `CLAUDE.md §4` kapılarından geçmeden `[x]` yapılmaz.
> Kabul kriterleri **sözleşmedir**: değiştirilmesi gerekiyorsa gerekçe `docs/DECISIONS.md`'ye yazılır.
>
> Kısaltmalar: **KK** = kabul kriterleri, **Doğrula** = görevi kapatmadan önce mutlaka çalıştırılacak kontrol.
> Her UI görevinin "Doğrula" adımı ayrıca `CLAUDE.md §4.2` görsel öz-kontrolünü içerir (tekrar yazılmadı).
> `Doğrula` alanı yazılmamış görevlerde varsayılan: `CLAUDE.md §4.1` kapılarının tamamı + görevin KK'larını kanıtlayan yeni testler
> (+ UI görevi ise §4.2). `KK` alanı kısa olan görevlerde `CLAUDE.md §5` öz-denetim listesi kabul kriteri olarak da geçerlidir.

## Faz özeti

| Faz | Hedef | Faz çıkış kapısı |
|---|---|---|
| F0 | Altyapı, araçlar, otomatik doğrulama | `pnpm verify`, `pnpm e2e`, `pnpm ui:snap` çalışıyor; CI yeşil |
| F1 | Tasarım sistemi ve bileşen kütüphanesi | `/dev/ui` tüm bileşen/durumları gösteriyor; axe 0 ihlal; kontrast scripti yeşil |
| F2 | Backend çekirdeği, kimlik doğrulama, güvenlik temeli | Auth akışları entegrasyon testli; RBAC varsayılan-reddet; outbox çalışıyor |
| F3 | Katalog, fiyat, stok, arama, seed verisi | Katalog API'leri sözleşmeli ve testli; takım fiyatlama doğru; arama Türkçe testleri yeşil |
| F4 | Vitrin: layout, ana sayfa, listeleme, ürün detay | Tüm şablonlar görsel kontrolden geçti; Lighthouse ölçümü kaydedildi |
| F5 | Sepet ve favoriler | Misafir/üye sepeti, birleştirme, kupon, mini sepet e2e testli |
| F6 | Ödeme ve sipariş | Uçtan uca satın alma e2e yeşil; eşzamanlı stok testi yeşil; iyzico sandbox doğrulandı |
| F7 | Hesabım | Sipariş takibi, iade, yorum, KVKK talepleri çalışıyor |
| F8 | Yönetim paneli | Ürün→sipariş→içerik yönetimi panelden yapılabiliyor; denetim kaydı tam |
| F9 | İçerik, yasal, iletişim | Çerez onayı, yasal sayfalar (onay bekleyen işaretli), bildirimler tamam |
| F10 | SEO, performans, erişilebilirlik cilası | CI'da Lighthouse bütçeleri zorunlu ve yeşil |
| F11 | Güvenlik ve dayanıklılık | ASVS kontrol listesi, yük testi, izleme, yedekleme tamam |
| F12 | Yayına alma | Staging'de tam e2e; canlı kontrol listesi kullanıcı onaylı |

---

## F0 — Altyapı ve araçlar

### [x] F0.1 Monorepo iskeleti ve sürüm kilidi
- **Bağımlılık:** —
- **Yap:** `git init`; pnpm workspaces + Turborepo; `CLAUDE.md §3.1` klasör yapısı; `.nvmrc` (güncel Node LTS — doğrula), `.editorconfig`, `.gitignore` (`.env*` hariç `.env.example`, `.artifacts/`), kök `package.json` scriptleri (`dev`, `build`, `lint`, `typecheck`, `test`, `verify`, `e2e`, `e2e:a11y`, `ui:snap`, `knip`).
- **KK:**
  1. Kullanılacak her ana paketin güncel kararlı sürümü `pnpm view` ile doğrulandı ve `docs/STACK.md` tablosuna (paket, sürüm, doğrulama tarihi) yazıldı.
  2. Tüm bağımlılıklar tam sürümle (`^`/`~` yok) sabitlendi; `pnpm-lock.yaml` commit'lendi.
  3. `pnpm install` temiz makinede hatasız.
- **Doğrula:** `pnpm install --frozen-lockfile && pnpm verify` (henüz boş paketlerle yeşil).

### [x] F0.2 TypeScript, ESLint, Prettier, git kancaları
- **Bağımlılık:** F0.1
- **Yap:** `packages/config` içinde paylaşılan `tsconfig` (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), ESLint (typescript-eslint strict, import sırası, `no-console`, `no-restricted-syntax` ile ham hex renk yasağı JSX/TSX'te), Prettier; husky + lint-staged (staged dosyalarda lint + format), commitlint (Conventional Commits, scope zorunlu değil, `[F*.*]` önerilir).
- **KK:** Kasıtlı hatalı örnek dosya lint/typecheck'te yakalanıyor (sonra silinir); commit kancası hatalı mesajı reddediyor.
- **Doğrula:** `pnpm lint && pnpm typecheck`; hatalı bir commit mesajı denemesinin reddedildiğini gör.

### [x] F0.3 Lokal servisler (Docker Compose)
- **Bağımlılık:** F0.1
- **Yap:** `docker-compose.yml`: postgres, redis, meilisearch, S3 — RustFS, MinIO yerine ADR-006 (+ bucket oluşturma), mailpit — hepsinde healthcheck, adlandırılmış volume. `pnpm infra:up|down|reset`.
- **KK:** `pnpm infra:up` sonrası tüm servisler `healthy`; `infra:reset` verileri sıfırlar.
- **Doğrula:** `docker compose ps` çıktısında hepsi healthy.

### [x] F0.4 Uygulama iskeletleri
- **Bağımlılık:** F0.2, F0.3
- **Yap:** `apps/web` ve `apps/admin` (Next.js App Router, TS, Tailwind), `apps/api` (NestJS) + `main.worker.ts` boş worker. `pnpm dev` hepsini paralel başlatır (portlar: web 3000, admin 3001, api 4000).
- **KK:** Üç uygulama ayağa kalkıyor; api `/health/live` 200 dönüyor; web ve admin boş sayfa render ediyor; `pnpm build` yeşil.
- **Doğrula:** `pnpm verify`; `curl localhost:4000/health/live`.

### [x] F0.5 Ortam değişkeni doğrulama
- **Bağımlılık:** F0.4
- **Yap:** Her uygulamada Zod tabanlı `env.ts`; eksik değişkende açıklayıcı hata ile başlamama. Kök `.env.example` her değişkeni yorumla açıklar.
- **KK:** Zorunlu bir değişken silinince uygulama hangi değişkenin eksik olduğunu söyleyerek kapanıyor (testle).
- **Doğrula:** `pnpm test` (env testleri).

### [x] F0.6 Test altyapısı
- **Bağımlılık:** F0.4
- **Yap:** Vitest workspace (birim + entegrasyon projeleri), Testcontainers yardımcıları, Playwright (`e2e/`, webServer ile uygulamaları başlatır), `@axe-core/playwright` yardımcı fonksiyonu (`expectNoA11yViolations(page)`), örnek birer test.
- **KK:** `pnpm test`, `pnpm e2e`, `pnpm e2e:a11y` çalışıyor; örnek entegrasyon testi gerçek Postgres container'ına bağlanıyor.
- **Doğrula:** üç komutun çıktısı yeşil.

### [x] F0.7 Görsel öz-kontrol aracı (`ui:snap`)
- **Bağımlılık:** F0.6
- **Yap:** `pnpm ui:snap <rota> [--states hover,focus,menu] [--selector <css>]` → Playwright ile 375/768/1280/1440 genişlikte tam sayfa + belirtilen durumların ekran görüntüleri `.artifacts/screens/<rota-slug>/<genişlik>-<durum>.png`. Ayrıca her genişlikte yatay taşma kontrolü (`scrollWidth > clientWidth` → uyarı) ve konsol hatası listesi rapor edilir.
- **KK:** Ana sayfa için 4+ görüntü üretiliyor; kasıtlı yatay taşma eklenince araç uyarı veriyor; konsol hatası raporlanıyor.
- **Doğrula:** Aracı çalıştır, üretilen bir görüntüyü Read ile aç.

### [x] F0.8 CI (GitHub Actions)
- **Bağımlılık:** F0.6
- **Yap:** PR ve `main` için iş akışı: install (önbellekli) → `verify` → servislerle `e2e` → artefakt olarak Playwright raporu.
- **KK:** İş akışı YAML'ı `actionlint` ile geçerli; yerelde `act` yoksa en azından adımlar `pnpm` scriptleriyle birebir aynı.
- **Doğrula:** `actionlint` (yüklü değilse kur) çıktısı temiz.

### [ ] F0.9 Faz denetimi
- **Bağımlılık:** F0.1–F0.8
- **Yap:** `/faz-denetimi`. README.md'ye kurulum talimatı (sıfırdan çalıştırma adımları).
- **KK:** README'deki adımlar temiz klonda birebir uygulanınca proje ayağa kalkıyor.

---

## F1 — Tasarım sistemi

### [ ] F1.1 Token'lar ve kontrast doğrulayıcı
- **Bağımlılık:** F0.9
- **Yap:** `packages/ui/tokens` → CSS değişkenleri (renk, boşluk, radius, gölge, z-index, hareket) + Tailwind preset (yalnızca token'lar; varsayılan Tailwind paleti **kapatılır**). `pnpm tokens:contrast`: `DESIGN_SYSTEM §2.1` tablosundaki çiftleri hesaplar, eşik altındaysa hata verir.
- **KK:** Tailwind'de `bg-red-500` gibi token dışı sınıf derlenmiyor; kontrast scripti tablodaki tüm değerleri ±0,01 doğrulukla üretiyor.
- **Doğrula:** `pnpm tokens:contrast`; token dışı sınıf içeren örnek bileşenle build'in uyarı/hata verdiğini gör.

### [ ] F1.1a CSS tarafında token denetimi (F0 denetiminden)
- **Bağımlılık:** F1.1
- **Yap:** `.css` dosyalarında ham hex/`rgb()` ve token dışı `@apply` keyfi değerlerini yakalayan denetim (stylelint veya küçük betik — seçim
  `DECISIONS.md`'ye); token kaynak dosyalarının (`packages/ui/tokens`) ESLint hex kuralından muaf tutulması.
- **KK:** Kasıtlı hatalı CSS dosyası `pnpm lint`'te hata veriyor; token kaynağı lint'ten geçiyor.

### [ ] F1.2 Fontlar ve tipografi
- **Bağımlılık:** F1.1
- **Yap:** `next/font` ile Inter + Fraunces (`latin-ext`), tipografi ölçeği bileşenleri (`Heading`, `Text`), `tabular-nums` yardımcı sınıfı.
- **KK:** `/dev/ui/typography` sayfası her ağırlıkta `ğĞüÜşŞıİöÖçÇ` gösteriyor; font yüklenirken CLS 0.
- **Doğrula:** `ui:snap /dev/ui/typography`; Türkçe karakterleri görüntüde kontrol et.

### [ ] F1.3 Hareket altyapısı
- **Bağımlılık:** F1.1
- **Yap:** Motion token'ları JS'e de aktarılır; `useReducedMotion` sarmalayıcısı; `Reveal` (scroll görünümü, bir kez), `Stagger` yardımcıları; global `prefers-reduced-motion` CSS kuralları.
- **KK:** Reduced-motion emülasyonunda transform animasyonu yok (Playwright testi `emulateMedia({ reducedMotion: 'reduce' })`).
- **Doğrula:** ilgili e2e testi.

### [ ] F1.4 Button ve IconButton
- **Bağımlılık:** F1.2, F1.3
- **Yap:** `DESIGN_SYSTEM §7`'deki tüm varyant × boyut × durum. `loading` durumunda genişlik sabit. `asChild` ile link olarak kullanılabilir.
- **KK:** Birim testleri: `aria-busy`, `aria-disabled`, loading'de çift tıklama engeli; IconButton `aria-label` olmadan TS hatası verir.
- **Doğrula:** `pnpm test`; `/dev/ui/buttons` görsel kontrol (hover/focus durumlarıyla).

### [ ] F1.5 Form elemanları
- **Bağımlılık:** F1.4
- **Yap:** `Field` (label, açıklama, hata, `aria-describedby`), Input, Textarea, Select (Radix), Checkbox, Radio, Switch, `QuantityStepper`, `PhoneInput` (maske + E.164 çıktı), React Hook Form + Zod entegrasyon örneği.
- **KK:** `DESIGN_SYSTEM §8` kuralları; stepper sınır dışı girişi düzeltiyor; telefon `0 (532) 123 45 67` → `+905321234567`.
- **Doğrula:** birim testleri + `/dev/ui/forms` görsel kontrol + axe.

### [ ] F1.6 Katmanlı bileşenler
- **Bağımlılık:** F1.4
- **Yap:** Dialog, Drawer (sol/sağ/alt), Popover, Tooltip, DropdownMenu, Toast (eylem butonlu, üzerine gelince duran).
- **KK:** Odak tuzağı, Esc, odak geri dönüşü, kaydırma kilidinde **sayfa kayması yok** (scrollbar telafisi) — e2e testli.
- **Doğrula:** e2e + görsel kontrol (açık durumlar).

### [ ] F1.7 Gösterim bileşenleri
- **Bağımlılık:** F1.4
- **Yap:** Badge, `Price` (+ ekran okuyucu metni), Rating, Swatch, Skeleton, EmptyState, Breadcrumb, Tabs, Accordion (`grid-rows` animasyonu), Carousel (Embla; oklar, noktalar, duraklat).
- **KK:** `Price` indirimli/indirimsiz/takım toplamı varyantları; Carousel klavye ile kullanılabilir; Accordion içerik yüksekliğini anime ederken layout kayması yok.
- **Doğrula:** birim + e2e + görsel kontrol.

### [ ] F1.8 `/dev/ui` vitrini
- **Bağımlılık:** F1.4–F1.7
- **Yap:** Tüm bileşenlerin tüm durumlarını gösteren, yalnızca geliştirmede açık sayfa (prod build'de 404).
- **KK:** axe 0 ihlal; prod build'de rota erişilemez (testli).
- **Doğrula:** `pnpm e2e:a11y`; `ui:snap /dev/ui`.

### [ ] F1.9 Faz denetimi
- **Bağımlılık:** F1.1–F1.8
- **KK:** Bileşen kataloğu `DESIGN_SYSTEM §9` listesiyle karşılaştırıldı; F1 kapsamındakiler eksiksiz; kalanlar ilgili F4 görevlerine bağlı.

---

## F2 — Backend çekirdeği

### [ ] F2.1 NestJS platform katmanı
- **Bağımlılık:** F0.9
- **Yap:** Config modülü, pino (requestId, redact), Problem Details hata filtresi, Zod doğrulama pipe'ı, helmet, CORS izin listesi, `/health/live|ready`, OpenAPI (`/v1/docs`, prod'da kapalı), modül sınırı ESLint kuralı (`ARCHITECTURE §2`).
- **KK:** Geçersiz istek → 400 Problem Details + alan hataları; bilinmeyen hata → 500, iç detay sızdırmıyor; loglarda `password`, `token`, `tckn` alanları maskeli (testli); modül sınırı ihlali lint hatası veriyor.
- **Doğrula:** `pnpm test` (entegrasyon), `pnpm lint`.

### [ ] F2.1a API öneki ve üretim ortamı sertleştirmesi (F0 denetiminden)
- **Bağımlılık:** F2.1
- **Yap:** `ARCHITECTURE §4` gereği global `/v1` öneki (`/health/*` hariç, karar `DECISIONS.md`'ye); env şemasında `NODE_ENV=production`
  iken `.env.example`'daki örnek şifrelerin ve TLS'siz Redis'in reddedilmesi.
- **KK:** `GET /v1/...` çalışıyor, `/health/live` öneksiz; production modunda örnek şifreyle süreç açılmıyor (testli).

### [ ] F2.2 Prisma ve temel şema
- **Bağımlılık:** F2.1
- **Yap:** `ARCHITECTURE §3.1` + `§3.6` platform tabloları (User, Role, Permission, UserRole, RefreshToken, Consent, AuditLog, OutboxEvent, IdempotencyKey, Setting). İlk migration. Seed çatısı (`pnpm db:seed`, idempotent).
- **KK:** `prisma migrate reset` + seed iki kez üst üste hatasız; seed tekrar çalışınca kopya kayıt oluşmuyor.
- **Doğrula:** komutlar + entegrasyon testi.

### [ ] F2.3 `packages/contracts` ve `packages/utils`
- **Bağımlılık:** F2.1
- **Yap:** Ortak Zod şemaları ve hata kodu listesi; `money.ts` (formatTRY, allocate, applyPercent, tax), `slug.ts` (Türkçe), `phone.ts`, `dates.ts` (iş günü hesabı, Europe/Istanbul).
- **KK:** `allocate` için fast-check özelliği: toplam her zaman korunur, negatif yok; `formatTRY(849000)` → `8.490,00 TL`; `slugify('Işıklı Gardırop Çekmeceli')` → `isikli-gardirop-cekmeceli`; para modülü kapsamı %100.
- **Doğrula:** `pnpm test --coverage`.

### [ ] F2.3a Kapsam eşikleri (F0 denetiminden)
- **Bağımlılık:** F2.3
- **Yap:** Vitest `coverage.thresholds`: `packages/utils` para modülü %100; domain modülleri (`pricing`, `cart`, `checkout`, `orders`,
  `inventory`, `payments`) oluşturuldukları görevde ≥ %85 eşiğiyle config'e eklenir (CLAUDE.md §4.1 G3). CI'da kapsamlı test adımı.
- **KK:** Eşiğin altına düşen kapsam `pnpm test`'i (ve CI'ı) kırmızı yapıyor (kasıtlı deneme ile görüldü).

### [ ] F2.4 Kimlik doğrulama
- **Bağımlılık:** F2.2, F2.3
- **Yap:** `ARCHITECTURE §5.1–5.2`: kayıt, giriş, çıkış, refresh rotasyonu + yeniden kullanım tespiti, e-posta doğrulama, şifre sıfırlama, CSRF, oran sınırlama.
- **KK (entegrasyon testleriyle):** refresh token ikinci kez kullanılınca aile iptal; 6. hatalı giriş denemesi sınırlanıyor; şifre sıfırlama tek kullanımlık ve 30 dk geçerli; e-posta varlığı sızmıyor; CSRF token'sız değiştirici istek 403.
- **Doğrula:** `pnpm test`.

### [ ] F2.5 Yetkilendirme, 2FA, denetim kaydı
- **Bağımlılık:** F2.4
- **Yap:** Global varsayılan-reddet guard, `@Public()` ve `@Permissions()` dekoratörleri, rol/izin seed'i, admin TOTP 2FA (kurulum + doğrulama + kurtarma kodları), admin yazma işlemlerinde `AuditLog` interceptor'ı.
- **KK:** Dekoratörsüz yeni endpoint otomatik 401/403 (testli); 2FA'sız admin panel endpoint'lerine erişemiyor; her admin yazma işlemi before/after ile loglanıyor.
- **Doğrula:** `pnpm test`.

### [ ] F2.6 Outbox ve worker
- **Bağımlılık:** F2.2
- **Yap:** `ARCHITECTURE §10`: outbox yazıcı yardımcı (transaction içinde), relay, BullMQ kuyrukları, idempotent iş taban sınıfı, dead-letter, tekrarlayan iş altyapısı (tek örnek kilidi).
- **KK:** Transaction geri alınınca outbox olayı da yok; aynı olay iki kez işlenince yan etki bir kez; 8 başarısızlık sonrası dead-letter.
- **Doğrula:** entegrasyon testleri (Redis container).

### [ ] F2.7 Idempotency-Key
- **Bağımlılık:** F2.2
- **Yap:** Interceptor + `@Idempotent()` dekoratörü (`ARCHITECTURE §4`).
- **KK:** Aynı anahtar+gövde → aynı cevap, işlem bir kez; aynı anahtar+farklı gövde → 409; eşzamanlı aynı anahtarlı iki istek → biri bekler/409, işlem bir kez.
- **Doğrula:** entegrasyon testleri.

### [ ] F2.8 Bildirim altyapısı
- **Bağımlılık:** F2.6
- **Yap:** `Notifier` arayüzü, SMTP uygulaması (lokal Mailpit), e-posta şablon sistemi (react-email veya MJML — seçimi ADR'ye yaz), Türkçe şablonlar: e-posta doğrulama, şifre sıfırlama.
- **KK:** Kayıtta doğrulama e-postası kuyruk üzerinden Mailpit'e düşüyor (e2e Mailpit API'siyle kontrol); şablonlar mobilde okunur.
- **Doğrula:** e2e + Mailpit'te e-postanın ekran görüntüsü kontrolü.

### [ ] F2.9 Faz denetimi (güvenlik odaklı)
- **Bağımlılık:** F2.1–F2.8
- **KK:** `ARCHITECTURE §5` maddeleri tek tek kontrol edildi; eksikler görev olarak eklendi.

---

## F3 — Katalog, fiyat, stok, arama

### [ ] F3.1 Coğrafi veri
- **Bağımlılık:** F2.9
- **Yap:** İl/ilçe/mahalle verisi resmi/açık kaynaktan (kaynak ve lisans `DECISIONS.md`'ye), seed, `GET /geo/cities`, `/geo/cities/:id/districts`, `/geo/districts/:id/neighborhoods` (önbellekli).
- **KK:** 81 il; her ilin ilçeleri; Türkçe sıralama (`localeCompare('tr')`).
- **Doğrula:** entegrasyon testi (81 il sayısı, örnek ilçe kontrolü).

### [ ] F3.2 Katalog şeması
- **Bağımlılık:** F3.1
- **Yap:** `ARCHITECTURE §3.2–3.4` tabloları, indeksler, CHECK kısıtları, migration.
- **KK:** Şema `ARCHITECTURE §3`'teki tüm alanları içeriyor; `onHand - reserved >= 0` kısıtı veritabanında.
- **Doğrula:** migration + kısıt ihlali entegrasyon testi.

### [ ] F3.3 Medya yükleme ve normalizasyon
- **Bağımlılık:** F3.2
- **Yap:** Ön imzalı yükleme veya API üzerinden yükleme; içerikten MIME doğrulama; EXIF temizliği; `packshot` → 4:3 tuval, %8 kenar boşluğu, `surface-muted` zemin; blur yer tutucu; `media-process` kuyruğu.
- **KK:** Farklı oranlarda 3 packshot normalize edilince çıktıların hepsi 4:3 ve ürün alanı aynı oranda (testli); sahte uzantılı dosya reddediliyor.
- **Doğrula:** entegrasyon testi + çıktı görsellerini Read ile aç.

### [ ] F3.4 Katalog okuma API'leri
- **Bağımlılık:** F3.2
- **Yap:** Kategori ağacı, kategori listeleme (filtre, sıralama, imleç), ürün detay (slug ile; varyantlar, medya, öznitelikler, takım bileşenleri, koleksiyon), koleksiyon detay, benzer ürünler.
- **KK:** Cevaplar `contracts` şemalarına uyuyor; taslak/arşiv ürün vitrinde görünmüyor; N+1 sorgu yok (sorgu sayısı testte sınırlandırılmış).
- **Doğrula:** entegrasyon testleri.

### [ ] F3.5 Fiyatlama
- **Bağımlılık:** F3.4
- **Yap:** `PriceHistory`, kampanyalar, `SetDiscountRule`, "son 30 gün en düşük fiyat" ile `compareAtPrice`, `POST /catalog/sets/:id/quote` (seçili bileşen + adetler → satırlar, indirim, toplam), taksit tablosu için sağlayıcı arayüzü (şimdilik fake).
- **KK:** `ARCHITECTURE §6` kuralları testli; zorunlu bileşen çıkarılırsa 422 + kod; kampanya tarih aralığı dışında uygulanmıyor; 30 gün kuralı tarih sınırlarında doğru (gün 29/30/31 testleri).
- **Doğrula:** `pnpm test --coverage` (pricing ≥ %85).

### [ ] F3.6 Stok, teslim süresi, teslimat bölgesi
- **Bağımlılık:** F3.4
- **Yap:** Stok okuma, `madeToOrder` + lead time, `DeliveryZone`, `Holiday` seed (içinde bulunulan ve sonraki yıl), `GET /delivery/estimate?variantIds=&districtId=`.
- **KK:** Hafta sonu/tatil atlayan iş günü hesabı testli; bölge yoksa "teslimat yapılmıyor" kodu.
- **Doğrula:** testler.

### [ ] F3.7 Yönetim katalog yazma API'leri
- **Bağımlılık:** F3.5, F3.6, F2.5
- **Yap:** Kategori/koleksiyon/ürün/varyant/seçenek/öznitelik/medya/takım bileşeni CRUD; fiyat değişikliğinde `PriceHistory`; slug değişiminde yönlendirme kaydı; her değişiklikte outbox (`product.updated` vb.).
- **KK:** İzinsiz rol yazamıyor; denetim kaydı oluşuyor; slug çakışması 409.
- **Doğrula:** entegrasyon testleri.

### [ ] F3.8 Arama
- **Bağımlılık:** F3.7, F2.6
- **Yap:** `ARCHITECTURE §8`: indeks ayarları, senkronizasyon işleri, `GET /search?q=&filters=`, öneri ucu (`/search/suggest`), eş anlamlılar.
- **KK:** "gardirop", "GARDIROP", "gardırop" aynı sonuçları veriyor; 1 harf hatası tolere ediliyor; ürün arşivlenince indeksten düşüyor.
- **Doğrula:** entegrasyon testleri (Meili container).

### [ ] F3.9 Gerçekçi seed verisi
- **Bağımlılık:** F3.7
- **Yap:** `REFERENCE §1.1` kategori ağacı; 4 koleksiyon; ~60 ürün, bunların en az 12'si takım (orta sehpa takımı, yemek odası takımı, yatak odası takımı vb.); her takımda 3–7 bileşen, gerçekçi ölçüler; varyant renkleri; kampanyalar; stok + siparişe üretim karışımı; script ile üretilmiş yer tutucu görseller (ürün adı ve ölçü yazılı, packshot/lifestyle ayrımlı).
  **Ürün ve koleksiyon adları özgün olmalı** (referans sitenin ürün/koleksiyon adları kullanılmaz).
- **KK:** Seed idempotent; her kategori sayfasında ≥ 6 ürün; her takım fiyatı quote ucu ile tutarlı.
- **Doğrula:** `pnpm db:seed` iki kez + kontrol sorgusu.

### [ ] F3.10 Faz denetimi
- **Bağımlılık:** F3.1–F3.9

---

## F4 — Vitrin (storefront)

### [ ] F4.1 Vitrin veri katmanı
- **Bağımlılık:** F3.10, F1.9
- **Yap:** Tipli API istemcisi (cevap `contracts` ile doğrulanır), etiketli `fetch` (`ARCHITECTURE §9`), hata kodu → Türkçe mesaj eşlemesi (`messages/tr.json`), TanStack Query sağlayıcısı, `error.tsx`/`not-found.tsx` şablonları.
- **KK:** Bilinmeyen hata kodu genel mesaja düşüyor; şema uyumsuzluğu geliştirmede görünür hata veriyor.
- **Doğrula:** birim testleri.

### [ ] F4.1a Sunucuya özel doğrulanmış ortam modülü (F0 denetiminden)
- **Bağımlılık:** F4.1
- **Yap:** web/admin'de `server-env.ts` (`import 'server-only'`): doğrulanmış, tipli `serverEnv` nesnesi; kodda `process.env` doğrudan
  okunmaz (lint kuralıyla). Tarayıcıya gidecek değişkenler ayrı `NEXT_PUBLIC_` şemasıyla.
- **KK:** İstemci bileşeninden `server-env` içe aktarılınca build hata veriyor; `process.env` kullanımı lint hatası.

### [ ] F4.2 Ana iskelet: duyuru, header, mega menü, mobil menü, footer
- **Bağımlılık:** F4.1
- **Yap:** `REFERENCE §1`, `DESIGN_SYSTEM §9` (AnnouncementBar, Header, MegaMenu, MobileNav, avantaj şeridi, footer, WhatsApp butonu, "İçeriğe atla").
- **KK:** Mega menü hover-niyet gecikmeleri ve klavye kontrolü; mobil menü iç içe paneller; header kaydırma davranışı CLS üretmiyor; 375 px'te taşma yok.
- **Doğrula:** e2e (klavye ile menü gezinme) + axe + `ui:snap / --states menu,focus`.

### [ ] F4.3 Arama kutusu ve arama sonuç sayfası
- **Bağımlılık:** F4.5, F3.8 (bu yüzden F4.4 ve F4.5'ten sonra yapılır)
- **Yap:** `SearchBox` (debounce, öneriler, son aramalar, `/` kısayolu, klavye), `/arama?q=` sonuç sayfası (F4.5'in listeleme ve filtre bileşenleri yeniden kullanılır, kopyalanmaz).
- **KK:** Klavye ile öneri seçme; sonuç yokken öneri ve popüler kategoriler.
- **Doğrula:** e2e + görsel kontrol.

### [ ] F4.4 Ana sayfa
- **Bağımlılık:** F4.2
- **Yap:** `REFERENCE §2` bölümlerinin tamamı; CMS `HomeSection` verisinden render (CMS yazma ucu F8'de; şimdilik seed bölümleri); hotspot bileşeni.
- **KK:** Hero ilk görseli LCP ve `priority`; slider duraklatılabiliyor; sekmeli vitrinde sekme değişiminde yükseklik sabit; hotspot'lar klavyeyle erişilebilir; Lighthouse mobil ölçümü `PROGRESS.md`'ye yazıldı.
- **Doğrula:** e2e + axe + `ui:snap /` + Lighthouse.

### [ ] F4.5 Kategori listeleme (PLP)
- **Bağımlılık:** F4.2
- **Yap:** `REFERENCE §4`: filtre paneli/çekmecesi, URL durumu, çipler, sıralama, "daha fazla göster" + numaralı sayfa URL'leri, boş durum, ProductCard (eşit yükseklik, subgrid).
- **KK:** Filtre → URL → geri tuşu önceki filtreye dönüyor; mobil çekmecede "X ürünü göster" sayısı canlı; kartlar aynı satırda hizalı (görsel kontrol maddesi 1–2).
- **Doğrula:** e2e + axe + `ui:snap /kategori/<seed-slug>`.

### [ ] F4.6 Ürün detay — galeri ve bilgi sütunu
- **Bağımlılık:** F4.2
- **Yap:** `REFERENCE §3.1–3.3, §3.6`: galeri (thumbnail, hover-zoom, lightbox dinamik import, mobil kaydırma), varyant seçimi URL'de, fiyat bloğu (30 gün kuralı API'den), taksit modalı, teslimat tahmini, rozetler, favori butonu (yerleşim ve durumlar burada; işlevi F5.2'de bağlanır), yapışkan satın alma çubuğu.
- **KK:** Varyant değişince galeri/fiyat/stok/URL birlikte güncelleniyor; lightbox klavye ile tam kullanılabilir; yapışkan çubuk doğru zamanda beliriyor ve içerik örtmüyor.
- **Doğrula:** e2e + axe + `ui:snap /urun/<seed-takim-slug> --states hover,focus`.

### [ ] F4.7 Ürün detay — Takım İçeriği kutucukları
- **Bağımlılık:** F4.6, F3.5
- **Yap:** `REFERENCE §3.4` eksiksiz: `SetItemCard`, subgrid hizalama, ölçü satırı + ölçü çizimi popover'ı, ekle/çıkar, zorunlu parça kilidi, tükendi durumu, canlı toplam (quote ucu, iyimser gösterim + düzeltme), `aria-live`, mobil yatay kaydırma + yapışkan özet.
- **KK:**
  1. 1280 px'te 4 sütun; tüm kartlar aynı genişlik ve yükseklikte; ad 1 veya 2 satır olsa da ölçü/fiyat/stepper satırları hizalı (görüntüde doğrulandı).
  2. Packshot'lar aynı ölçekte görünüyor.
  3. Parça çıkarılınca kart düzeni değişmiyor, toplam ≤ 300 ms içinde güncelleniyor ve ekran okuyucuya duyuruluyor.
  4. Zorunlu parça çıkarılamıyor ve nedeni açıklanıyor.
  5. 375 px'te bir sonraki kartın kenarı görünüyor, kaydırma snap ile duruyor.
- **Doğrula:** e2e (ekle/çıkar/toplam) + axe + `ui:snap` (1280 ve 375 özellikle) + `REFERENCE §3.4` maddeleriyle birebir karşılaştırma.

### [ ] F4.8 Ürün detay — sekmeler, öneriler, SEO
- **Bağımlılık:** F4.7
- **Yap:** `REFERENCE §3.5, §3.7`: sekme/akordeon (hash derin link), ölçü tablosu, teslimat bölgesi kontrolü, iade/garanti, yorumlar ve soru-cevap (okuma), "Koleksiyonu Tamamla", benzer ürünler, son gezilenler (localStorage, try/catch), JSON-LD.
- **KK:** `#olculer` linkiyle sayfa açılınca ilgili sekme açık ve görünür; JSON-LD Google Zengin Sonuç şemasına uygun (şema doğrulama testi).
- **Doğrula:** e2e + axe + görsel kontrol.

### [ ] F4.9 Yeniden doğrulama bağlantısı
- **Bağımlılık:** F4.8, F2.6
- **Yap:** Vitrinde `/api/revalidate` (gizli anahtarlı), API'de `cache-invalidate` işi.
- **KK:** Panelden (API ile) fiyat değişince ürün sayfası yeni fiyatı ≤ 10 sn içinde gösteriyor (e2e).
- **Doğrula:** e2e.

### [ ] F4.10 Faz denetimi
- **Bağımlılık:** F4.1–F4.9
- **KK:** Tüm şablonlar için `ui:snap` + `DESIGN_SYSTEM §12` 10/10; Lighthouse mobil değerleri kaydedildi; bütçe dışı kalanlar F10 görevlerine not edildi.

---

## F5 — Sepet ve favoriler

### [ ] F5.1 Sepet API'si
- **Bağımlılık:** F4.10
- **Yap:** `ARCHITECTURE §7.1`, misafir/üye sepeti, girişte birleştirme, takım grupları, kupon uygula/kaldır, satır uyarıları, teslimat/kurulum ücreti, ücretsiz teslimat eşiği (`Setting`).
- **KK:** Birleştirmede stok sınırına kırpma ve bildirim; süresi dolmuş kupon kodu doğru hata; istemcinin gönderdiği fiyat yok sayılıyor (testli).
- **Doğrula:** entegrasyon testleri (cart ≥ %85 kapsam).

### [ ] F5.2 Favoriler
- **Bağımlılık:** F5.1
- **Yap:** API + kalp butonu (iyimser), header sayacı, `/favorilerim` sayfası; misafir favorileri girişte aktarılır.
- **KK:** Hızlı art arda tıklamada son durum doğru (yarış koşulu testi).
- **Doğrula:** e2e.

### [ ] F5.3 Sepete ekleme deneyimi ve mini sepet
- **Bağımlılık:** F5.1
- **Yap:** Buton durumları (`DESIGN_SYSTEM §6.2-7`), `MiniCartDrawer`, silmede "Geri al" toast'u, header sepet sayacı animasyonu.
- **KK:** Ağ hatasında buton eski hâline dönüyor ve hata toast'u; mini sepette adet değişimi toplamı güncelliyor.
- **Doğrula:** e2e (ağ hatası simülasyonu dahil) + görsel kontrol.

### [ ] F5.4 Sepet sayfası
- **Bağımlılık:** F5.3
- **Yap:** `REFERENCE §5`.
- **KK:** Takım grupları başlık altında; fiyat değişimi uyarısı görünür; boş sepet durumu.
- **Doğrula:** e2e + axe + `ui:snap /sepet`.

### [ ] F5.5 Faz denetimi
- **Bağımlılık:** F5.1–F5.4

---

## F6 — Ödeme ve sipariş

### [ ] F6.1 Adres defteri
- **Bağımlılık:** F5.5
- **Yap:** Adres API'si + form (il → ilçe → mahalle zinciri, bireysel/kurumsal fatura alanları, TCKN doğrulama algoritması, şifreli saklama).
- **KK:** Geçersiz TCKN reddediliyor; kullanıcı başkasının adresine erişemiyor (IDOR testi).
- **Doğrula:** entegrasyon + e2e.

### [ ] F6.2 Sipariş durum makinesi
- **Bağımlılık:** F5.5
- **Yap:** `ARCHITECTURE §7.4`.
- **KK:** Tüm geçiş çiftleri için tablo testi; her geçişte `OrderEvent` + outbox.
- **Doğrula:** `pnpm test` (orders ≥ %85).

### [ ] F6.3 Checkout API ve stok rezervasyonu
- **Bağımlılık:** F6.1, F6.2, F2.7
- **Yap:** `ARCHITECTURE §7.2–7.3`, `POST /checkout/orders` (idempotent), sipariş numarası üretimi, rezervasyon süresi işi.
- **KK:** **Son 1 adet ürüne 20 paralel istek → tam 1 başarılı** (entegrasyon testi); rezervasyon süresi dolunca stok geri dönüyor; aynı idempotency anahtarıyla tek sipariş.
- **Doğrula:** entegrasyon testleri.

### [ ] F6.4 Ödeme sağlayıcısı
- **Bağımlılık:** F6.3
- **Yap:** `ARCHITECTURE §7.5`. **Önce iyzico'nun güncel resmi dokümanını oku**, kullanılan uç noktaları ve alanları `DECISIONS.md`'ye kaydet. `FakePaymentProvider` (test), `IyzicoPaymentProvider` (sandbox anahtarları — yoksa `PROGRESS.md`'deki beklenenlere ekle ve fake ile ilerle), callback doğrulama, mutabakat işi, iade, taksit tablosu.
- **KK:** Sahte/değiştirilmiş callback gövdesi siparişi onaylatamıyor; aynı callback iki kez gelince etki bir kez; tutar uyuşmazlığında sipariş onaylanmıyor ve alarm logu.
- **Doğrula:** entegrasyon testleri + (anahtar varsa) sandbox'ta manuel uçtan uca deneme kaydı.

### [ ] F6.5 Yasal belgeler
- **Bağımlılık:** F6.3
- **Yap:** `ARCHITECTURE §7.6`; şablonlara **"HUKUKİ ONAY BEKLİYOR"** filigranı/başlığı (onaylanana kadar); PDF üretimi; siparişe hash.
- **KK:** Render edilen belge sipariş satırlarını, toplamı, teslimat adresini, cayma hakkı bilgisini içeriyor; şablon sürümü siparişte kayıtlı.
- **Doğrula:** birim testi + üretilen PDF'i Read ile açıp kontrol.

### [ ] F6.6 Ödeme arayüzü
- **Bağımlılık:** F6.4, F6.5
- **Yap:** `REFERENCE §6`: adımlı akordeon, misafir ödeme, teslimat seçeneği ve tarih, fatura türü, yasal onay kutuları (modalda okuma), ödeme formu, hata kurtarma (ödeme başarısızsa sepet korunur, tekrar dene).
- **KK:** Klavye ile baştan sona ödeme yapılabiliyor; her adım hatası ilgili alana odaklanıyor; ödeme sayfasında birden fazla birincil buton yok.
- **Doğrula:** e2e + axe + `ui:snap /odeme`.

### [ ] F6.7 Sipariş onayı ve bildirimleri
- **Bağımlılık:** F6.6
- **Yap:** Onay sayfası (sipariş no, özet, zaman çizelgesi), sipariş onay e-postası (PDF ekli), durum değişikliği e-postaları.
- **KK:** Onay sayfası yenilense de tekrar sipariş oluşmuyor; e-posta Mailpit'te.
- **Doğrula:** e2e.

### [ ] F6.8 Uçtan uca satın alma ve faz denetimi
- **Bağımlılık:** F6.1–F6.7
- **Yap:** Playwright: ana sayfa → kategori → filtre → takım PDP → 1 parça çıkar → sepete ekle → kupon → misafir ödeme (fake provider) → onay → e-posta. Ayrıca üye akışı ve başarısız ödeme akışı.
- **KK:** Üç senaryo yeşil; CI'da da çalışıyor.
- **Doğrula:** `pnpm e2e`.

---

## F7 — Hesabım

### [ ] F7.1 Hesap iskeleti, profil, şifre
- **Bağımlılık:** F6.8
- **KK:** Şifre değişince diğer oturumlar düşüyor.

### [ ] F7.2 Siparişlerim
- **Bağımlılık:** F7.1
- **Yap:** Liste + detay, durum zaman çizelgesi (`REFERENCE §8`), fatura indirme, izinli durumda iptal.
- **KK:** İptal yalnızca izinli durumlarda görünür ve API de reddeder; başka kullanıcının siparişi 404.

### [ ] F7.3 İade talebi
- **Bağımlılık:** F7.2
- **KK:** Cayma süresi dışında talep açılamıyor (sunucu kontrolü); kısmi iade tutarı doğru.

### [ ] F7.4 Değerlendirme ve soru-cevap yazma
- **Bağımlılık:** F7.2
- **Yap:** Yalnızca teslim almış alıcı yorum yazar (fotoğraflı), moderasyon bekler; soru sorma.
- **KK:** Satın almamış kullanıcı yorum yazamıyor (API testi); fotoğraf yükleme `F3.3` kurallarıyla.

### [ ] F7.5 İzinler ve KVKK talepleri
- **Bağımlılık:** F7.1
- **Yap:** İletişim izinleri yönetimi (`Consent` ekleme-yalnız), "verimi indir", hesap silme (anonimleştirme, `ARCHITECTURE §5.4`).
- **KK:** Silinen hesabın siparişleri anonim olarak kalıyor, kişisel alanlar temizleniyor (testli).

### [ ] F7.6 Faz denetimi
- **Bağımlılık:** F7.1–F7.5

---

## F8 — Yönetim paneli

### [ ] F8.1 Panel iskeleti ve veri tablosu
- **Bağımlılık:** F7.6
- **Yap:** Giriş + 2FA, rol tabanlı menü, koyu/açık tema, ortak `DataTable` (sıralama, filtre, sayfalama, toplu işlem, URL durumu), form kalıpları, onay modalı.
- **KK:** Yetkisiz menü öğesi görünmüyor ve API'de de reddediliyor.

### [ ] F8.2 Gösterge paneli
- **Bağımlılık:** F8.1
- **Yap:** Bugünkü siparişler, ciro, bekleyen ödemeler, düşük stok, bekleyen yorumlar, geciken teslimatlar.

### [ ] F8.3 Ürün yönetimi
- **Bağımlılık:** F8.1
- **Yap:** Basit ve takım ürün oluşturma/düzenleme, varyant matrisi, medya yükleme (packshot normalize önizlemesi, odak noktası seçimi, sürükle-sırala), **takım bileşen editörü** (bileşen ekle, varsayılan/min/max adet, zorunluluk, sıra), SEO alanları, vitrinde önizleme.
- **KK:** Panelden oluşturulan takım vitrinde F4.7 kriterlerini karşılıyor (e2e).

### [ ] F8.4 Kategori, koleksiyon, seçenek, öznitelik yönetimi
- **Bağımlılık:** F8.1
- **KK:** Kategori sürükle-bırak sıralama; slug değişince eski URL 301.

### [ ] F8.5 Stok, depo, teslimat bölgeleri, tatiller
- **Bağımlılık:** F8.1

### [ ] F8.6 Sipariş yönetimi
- **Bağımlılık:** F8.1
- **Yap:** Liste/filtre, detay, durum geçişi (gerekçeli), teslimat planlama, iade/geri ödeme, iç notlar, yazdırılabilir sipariş fişi.
- **KK:** Durum makinesi dışı geçiş arayüzde sunulmuyor; her işlem denetim kaydında.

### [ ] F8.7 Kampanya, kupon, takım indirimi, fiyat yönetimi
- **Bağımlılık:** F8.1
- **KK:** Toplu fiyat güncellemesi `PriceHistory`'ye yazıyor; kampanya önizlemesi örnek sepet üzerinde sonucu gösteriyor.

### [ ] F8.8 İçerik yönetimi (CMS)
- **Bağımlılık:** F8.1
- **Yap:** Ana sayfa bölümleri (sürükle-sırala, zamanlama), slider (masaüstü + mobil görsel), banner, duyuru, sayfalar, blog, mağazalar, ayarlar, yasal şablon sürümleri.
- **KK:** Bölüm sırası değişince ana sayfa ≤ 10 sn içinde güncelleniyor; zengin metin sanitize.

### [ ] F8.9 Moderasyon, müşteriler, denetim kaydı görüntüleyici
- **Bağımlılık:** F8.1
- **KK:** Müşteri listesinde kişisel veriler maskeli; açmak için ek izin + denetim kaydı.

### [ ] F8.10 Toplu içe/dışa aktarma
- **Bağımlılık:** F8.3
- **Yap:** Ürün/varyant/fiyat/stok için CSV/XLSX içe aktarma (doğrulama raporu, kuru çalıştırma), dışa aktarma.
- **KK:** Hatalı satırlar satır numarası ve nedeniyle raporlanıyor, hiçbir şey yarım yazılmıyor (transaction).

### [ ] F8.11 Faz denetimi
- **Bağımlılık:** F8.1–F8.10

---

## F9 — İçerik, yasal, iletişim

### [ ] F9.1 Çerez onayı
- **Bağımlılık:** F8.11
- **Yap:** Zorunlu / analitik / pazarlama kategorileri; onay verilmeden zorunlu olmayan hiçbir script yüklenmiyor; tercih değiştirme linki footer'da; onay kaydı.
- **KK:** Onay öncesi ağ isteklerinde analitik alan adı yok (e2e ağ kontrolü).

### [ ] F9.2 Kurumsal ve yasal sayfalar
- **Bağımlılık:** F8.11
- **Yap:** KVKK aydınlatma metni, çerez politikası, iade/değişim, teslimat, mesafeli satış örneği, hakkımızda, iletişim formu (oran sınırlı, bot korumalı). Metinler yer tutucu + "HUKUKİ ONAY BEKLİYOR".
- **KK:** Tüm yasal sayfalar footer'dan erişilebilir; onay bekleyen metinler `PROGRESS.md`'de listeli.

### [ ] F9.3 Bülten ve İYS
- **Bağımlılık:** F9.1
- **Yap:** Bülten kaydı (açık rıza + `Consent`), çift onay e-postası, `IysProvider` arayüzü (uygulama anahtar gelince).

### [ ] F9.4 Blog / ilham ve mağazalar sayfaları
- **Bağımlılık:** F8.11

### [ ] F9.5 Bildirim şablonlarının tamamlanması
- **Bağımlılık:** F8.11
- **Yap:** Sipariş durumları, **teslim tarihi değişikliği** (`REFERENCE §8`), kurulum randevusu, iade süreçleri; `SmsProvider` arayüzü.

### [ ] F9.6 Stoğa gelince haber ver
- **Bağımlılık:** F9.5

### [ ] F9.7 Faz denetimi
- **Bağımlılık:** F9.1–F9.6

---

## F10 — SEO, performans, erişilebilirlik cilası

### [ ] F10.1 SEO
- **Bağımlılık:** F9.7
- **Yap:** Sayfa başına metadata, canonical, bölünmüş sitemap, robots, OG görselleri, 404/500 sayfaları, yönlendirme tablosu, yapılandırılmış veri denetimi.
- **KK:** Lighthouse SEO ≥ 95 tüm şablonlarda.

### [ ] F10.2 Performans
- **Bağımlılık:** F10.1
- **Yap:** Paket analizi, dinamik importlar, `sizes` denetimi, önbellek başlıkları, font alt kümeleme; Lighthouse CI bütçelerini (`CLAUDE.md §4.3`) CI'da zorunlu yap.
- **KK:** `CLAUDE.md §4.3` bütçeleri tüm vitrin şablonlarında sağlanıyor.

### [ ] F10.3 Erişilebilirlik denetimi
- **Bağımlılık:** F10.1
- **Yap:** Tüm şablonlarda axe; elle klavye turu (kontrol listesi `docs/A11Y_CHECKLIST.md` oluştur); ekran okuyucu açısından başlık/landmark/aria-live gözden geçirme.
- **KK:** 0 ihlal; kontrol listesi tamamlandı.

### [ ] F10.4 Hareket ve cila turu
- **Bağımlılık:** F10.2
- **Yap:** Her etkileşimi `DESIGN_SYSTEM §6` ile karşılaştır; View Transitions (destek varsa); mikro-etkileşim tutarlılığı; Performance panelinde uzun görev kontrolü.
- **KK:** Animasyon kaynaklı uzun görev yok; reduced-motion testleri yeşil.

### [ ] F10.5 Analitik olayları
- **Bağımlılık:** F9.1
- **Yap:** Onaya bağlı `dataLayer` olayları: `view_item_list`, `view_item`, `add_to_cart`, `remove_from_cart`, `begin_checkout`, `add_payment_info`, `purchase`.
- **KK:** Onay yokken olay gönderilmiyor; `purchase` sayfa yenilenince tekrar gönderilmiyor.

### [ ] F10.6 Faz denetimi
- **Bağımlılık:** F10.1–F10.5

---

## F11 — Güvenlik ve dayanıklılık

### [ ] F11.1 Güvenlik incelemesi
- **Bağımlılık:** F10.6
- **Yap:** OWASP ASVS L2 kontrol listesi (`docs/SECURITY_CHECKLIST.md`), CSP/başlık testleri, bağımlılık taraması, gizli bilgi taraması (gitleaks), IDOR test taraması (tüm kaynak endpoint'leri), oran sınırı testleri.
- **KK:** Kritik/yüksek bulgu yok; orta bulgular görev olarak kayıtlı.

### [ ] F11.2 Yük testi
- **Bağımlılık:** F11.1
- **Yap:** k6 senaryoları (gezinme, arama, sepete ekleme, checkout); `EXPLAIN ANALYZE` ile yavaş sorgular; indeks iyileştirmeleri.
- **KK:** `ARCHITECTURE §12` performans hedefleri sağlanıyor.

### [ ] F11.3 Gözlemlenebilirlik
- **Bağımlılık:** F11.1
- **Yap:** Sentry, metrikler, alarm tanımları (ödeme başarı oranı düşüşü, dead-letter artışı, 5xx oranı, rezervasyon işi gecikmesi).

### [ ] F11.4 Dış sağlayıcıların bağlanması
- **Bağımlılık:** F11.1
- **Yap:** E-posta, SMS, e-Arşiv, İYS sağlayıcıları — kullanıcının seçtiği/verdiği hesaplarla; her biri resmi dokümandan, sandbox ile.
- **KK:** Her sağlayıcı için sandbox testi kaydı; anahtar yoksa görev "beklemede" olarak işaretlenir (fake ile çalışmaya devam).

### [ ] F11.5 Yedekleme ve runbook
- **Bağımlılık:** F11.3
- **Yap:** Yedek/geri yükleme scriptleri, `docs/RUNBOOK.md` (olay müdahalesi, ödeme sorunları, geri yükleme, anahtar rotasyonu).
- **KK:** Yedekten temiz veritabanına geri yükleme tatbikatı başarılı ve süresi kayıtlı.

### [ ] F11.6 Faz denetimi
- **Bağımlılık:** F11.1–F11.5

---

## F12 — Yayına alma

### [ ] F12.1 Barındırma kararı ve altyapı
- **Bağımlılık:** F11.6
- **Yap:** Kullanıcıyla barındırma kararı (KVKK — `ARCHITECTURE §14`); üretim compose/altyapı tanımı; gizli bilgi yönetimi.
- **KK:** Karar `DECISIONS.md`'de; altyapı tanımı kodda.

### [ ] F12.2 Staging
- **Bağımlılık:** F12.1
- **Yap:** Staging'e dağıtım, duman testleri, tam e2e (iyzico sandbox), Lighthouse.
- **KK:** Tüm e2e staging'de yeşil.

### [ ] F12.3 Gerçek içerik
- **Bağımlılık:** F12.2
- **Yap:** Kullanıcının ürün verisi ve görsellerinin toplu içe aktarılması (F8.10), görsel standart kontrolü, yer tutucu metinlerin taranması (`[MARKA_ADI]`, "HUKUKİ ONAY BEKLİYOR" kalmadı).

### [ ] F12.4 Canlıya çıkış kontrol listesi (kullanıcı onaylı)
- **Bağımlılık:** F12.3
- **Kontrol listesi:** yasal metinler onaylı · ETBİS kaydı · iyzico canlı anahtarları · alan adı/DNS/SSL · e-posta SPF/DKIM/DMARC · Search Console + sitemap · analitik + çerez onayı · yedekler doğrulandı · alarmlar çalışıyor · admin kullanıcıları 2FA'lı · test verileri temizlendi.

### [ ] F12.5 Canlıya çıkış ve ilk 48 saat
- **Bağımlılık:** F12.4 + **kullanıcının açık onayı**
- **Yap:** Üretim dağıtımı, duman testleri, 48 saat izleme kontrol listesi, gerçek bir düşük tutarlı test siparişi + iadesi.
