# CLAUDE.md — Mobilya E-Ticaret Projesi

> Bu dosya Claude Code'un **anayasasıdır**. Her oturumun başında baştan sona okunur.
> Buradaki kurallar; kullanıcı açıkça aksini söylemedikçe hiçbir gerekçeyle esnetilmez.
> Kullanıcı süreçte az müdahale etmek istiyor: kararları bu dosya, `ROADMAP.md` ve `docs/` altındaki
> belgelere göre **sen** verirsin, kanıtla doğrularsın, kayda geçirirsin.

---

## 0. Proje kimliği

| Alan | Değer |
|---|---|
| Ürün | Türkiye pazarına mobilya satan, takım (set) ürün ağırlıklı B2C e-ticaret sitesi |
| Referans | mondihome.com.tr — ana sayfa ve ürün (takım) sayfası yapısı. Ayrıntı: `docs/REFERENCE.md` |
| Marka adı | `[MARKA_ADI]` — kullanıcıdan alınana kadar bu yer tutucu kullanılır |
| Dil / para birimi | Türkçe (i18n'e hazır yapı) / TRY |
| Kalite hedefi | Akıcı, tutarlı, erişilebilir (WCAG 2.2 AA), hızlı (Core Web Vitals "İyi"), güvenli ve sağlam backend |

**Belge haritası** (hepsini bilmen gerekir, ama yalnızca ilgili görevde ayrıntısına girersin):

| Dosya | Ne zaman okunur |
|---|---|
| `CLAUDE.md` | Her oturumun başında — tamamı |
| `docs/PROGRESS.md` | Her oturumun başında — nerede kaldığını buradan öğrenirsin |
| `ROADMAP.md` | Her oturumun başında — sıradaki görevi buradan seçersin |
| `docs/DESIGN_SYSTEM.md` | Herhangi bir UI/ön yüz görevinden önce |
| `docs/ARCHITECTURE.md` | Herhangi bir backend, veri modeli, API görevinden önce |
| `docs/REFERENCE.md` | Ana sayfa, ürün listesi, ürün detay görevlerinden önce |
| `docs/DECISIONS.md` | Mimari/teknoloji kararı vermeden önce ve verdikten sonra |
| `docs/reference/*` | Kullanıcının koyduğu ekran görüntüleri — varsa UI görevlerinde mutlaka bakılır |
| `docs/STACK.md` | Paket eklemeden / sürüm yükseltmeden önce |
| `docs/OGRENME.md` | Kullanıcının öğrenme rehberi — her görevin sonunda güncellenir (§2.2-6) |

---

## 1. Altın kurallar (ihlal edilemez)

1. **Kanıtsız "bitti" yok.** Bir görev, §4'teki doğrulama kapılarının tamamı çalıştırılıp geçtiği
   görülmeden tamamlandı sayılmaz. "Çalışması lazım", "muhtemelen geçer" ifadeleri yasaktır.
   Komutu çalıştır, çıktıyı oku, özetini `docs/PROGRESS.md`'ye yaz.
2. **Bir seferde tek görev.** `ROADMAP.md`'deki sıradaki görevi al, bitir, doğrula, işaretle, commit'le.
   Sonra diğerine geç. Yol haritasında olmayan iş yapma (kapsam kayması yasak).
3. **Yol haritası sırası bağlayıcıdır.** Bir görevin `Bağımlılık` alanındaki görevler bitmeden başlanmaz.
4. **Stack değişmez.** §3'teki teknolojiler dışında bir şey eklemek veya birini değiştirmek için önce
   `docs/DECISIONS.md`'ye gerekçeli bir ADR yazılır. Küçük yardımcı kütüphaneler için de tek satırlık kayıt şarttır.
5. **Test ve kural susturmak yasak.** `@ts-ignore`, `@ts-expect-error` (gerekçesiz), `eslint-disable`,
   `any`, `.skip`, `.only`, testi geçsin diye beklentiyi gevşetmek, coverage eşiğini düşürmek yasaktır.
   Gerçekten kaçınılmazsa satırına gerekçe yorumu + `docs/DECISIONS.md` kaydı gerekir.
6. **Sahte başarı yok.** Üretim kod yolunda mock/sabit veri, `TODO` ile bırakılmış boş fonksiyon,
   "şimdilik" yazılmış güvenlik açığı bırakılmaz. Ertelenen her iş `ROADMAP.md`'de bir göreve bağlanır.
7. **Para asla float değildir.** Tüm tutarlar kuruş cinsinden tamsayıdır (`Int`/`BigInt`). Detay: `docs/ARCHITECTURE.md §6`.
8. **Kart verisi sunucumuza dokunmaz.** Ödeme, sağlayıcının barındırılan formu / 3D Secure akışıyla yapılır.
9. **Gizli bilgi koda girmez.** `.env*` (örnek dosya `.env.example` hariç) commit'lenmez, loglanmaz, ekrana basılmaz.
10. **Uygulanmış migration düzenlenmez.** Şema değişikliği her zaman yeni migration ile yapılır.
11. **Tasarım token'ları dışında renk/ölçü yok.** Bileşenlerde ham hex, keyfi `px` değeri, `[...]` Tailwind keyfi değerleri
    kullanılmaz. Gerekirse önce token eklenir (`docs/DESIGN_SYSTEM.md`).
12. **3 deneme kuralı.** Aynı hatayı 3 farklı yaklaşımla çözemezsen dur: durumu `docs/PROGRESS.md`
    "Engeller" bölümüne yaz (denediklerin, hata çıktısı, hipotezin) ve bağımsız bir sonraki göreve geç.
    Döngüye girip aynı şeyi tekrar deneme.

---

## 2. Çalışma protokolü (her oturum, her görev)

### 2.1 Oturum başlangıcı
1. `CLAUDE.md` (bu dosya) → `docs/PROGRESS.md` → `ROADMAP.md` oku.
2. `git status` ve `git log --oneline -10` çalıştır; yarım kalmış iş var mı bak.
3. Proje kurulmuşsa `pnpm verify` çalıştır ve **başlangıç durumunu** not et. Kırmızıysa önce onu düzelt
   (önceki oturumdan kalan kırık iş, yeni işten önceliklidir).
4. `docs/PROGRESS.md` → "Aktif görev" doluysa ondan devam et; boşsa `ROADMAP.md`'de bağımlılıkları
   tamamlanmış ilk işaretsiz görevi seç.

### 2.2 Görev döngüsü
```
ANLA → PLANLA → UYGULA (küçük adımlarla) → DOĞRULA → KAYDET → COMMIT
```
1. **ANLA:** Görevin `Kabul kriterleri`ni ve ilgili belge bölümünü oku. Belirsizlik varsa §8'e bak;
   çoğu belirsizliği varsayılanlarla kendin çözersin.
2. **PLANLA:** `docs/PROGRESS.md` → "Aktif görev" bölümüne 3–10 maddelik plan yaz: dokunulacak dosyalar,
   eklenecek testler, risk. Plan, kabul kriterlerinin her birini karşılamalı.
3. **UYGULA:** Önce test/kontrat (mümkün olduğunda), sonra kod. Her mantıksal adımdan sonra ilgili
   hızlı kontrolü (`pnpm typecheck` veya ilgili test) çalıştır; hataları biriktirme.
4. **DOĞRULA:** §4'teki kapıların tamamı. UI görevi ise §4.2 görsel kontrol de zorunlu.
5. **ÖZ-DENETİM:** §5'teki kontrol listesini satır satır cevapla. Bir maddeye "hayır" diyorsan 3. adıma dön.
6. **KAYDET:** `ROADMAP.md`'de görevi `[x]` yap. `docs/PROGRESS.md` → "Günlük"e tarih, görev ID, ne yapıldı,
   doğrulama kanıtı (komut + sonuç özeti), varsa açık notlar. "Aktif görev"i temizle.
   `docs/OGRENME.md`'yi güncelle (kullanıcı kodlamayı öğreniyor): yeni dosyaları "Dosya rehberi"ne, yeni araçları
   "Araçlar"a (ne / neden / nasıl), yeni terimleri "Sözlük"e ekle; "Adım adım günlük"e görevin
   *ne yaptık → neden → kavramlar → kendin dene* bölümünü yaz. Sade Türkçe, yeni başlayan biri için.
7. **COMMIT:** Conventional Commits, görev ID'si ile: `feat(catalog): takım içeriği kartları [F4.7]`.
   Bir commit = bir görev (veya görevin mantıksal bir parçası). `pnpm verify` kırmızıyken commit yok.

### 2.3 Faz sonu
Bir fazın tüm görevleri bitince `/faz-denetimi` komutunu çalıştır (`.claude/commands/faz-denetimi.md`).
Faz denetimi raporu `docs/PROGRESS.md`'ye yazılır. Denetimde bulunan her sorun ya hemen düzeltilir
ya da sonraki faza görev olarak eklenir.

### 2.4 Bağlam yönetimi
- Uzun oturumlarda her faz sonunda ve büyük görevlerden sonra `docs/PROGRESS.md`'yi güncel tut;
  bağlam sıkıştırılsa bile oradan kaldığın yere dönebilmelisin.
- Büyük dosyaları baştan sona okumak yerine ilgili bölümü oku. Belgelerdeki bölüm numaralarına (`§`) atıf yap.

---

## 3. Teknoloji yığını (kilitli)

> **Sürüm politikası:** Kurulum görevinde (F0) her paketin **o günkü en güncel kararlı (stable)** sürümü
> `pnpm view <paket> version` ile doğrulanır, `package.json`'a **tam sürüm** (`^` olmadan) yazılır ve
> `docs/STACK.md`'ye tablo olarak kaydedilir. Beta / RC / canary kullanılmaz. Hafızandaki sürüm
> numaralarına güvenme; her zaman doğrula. Ana sürüm yükseltmesi ancak ADR ile yapılır.

| Katman | Teknoloji | Not |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | Node LTS sürümü `.nvmrc`'de |
| Dil | TypeScript, `strict: true`, `noUncheckedIndexedAccess: true` | Tüm paketlerde |
| Vitrin (storefront) | Next.js (App Router, Server Components) | `apps/web` |
| Yönetim paneli | Next.js (App Router) | `apps/admin` |
| API | NestJS (modüler monolit) | `apps/api` |
| Veritabanı | PostgreSQL + Prisma ORM | Migration'lar `apps/api/prisma` |
| Önbellek / kuyruk | Redis + BullMQ | Oran sınırlama, oturum, işler |
| Arama | Meilisearch | Türkçe tipo toleransı, facet filtre |
| Dosya depolama | S3 uyumlu (lokalde RustFS — ADR-006) | Görsel dönüşümü: Next/Image + kaynak boyut sınırları |
| Stil | Tailwind CSS + CSS değişkenli token'lar | Token kaynağı: `packages/ui/tokens` |
| UI temelleri | Radix UI primitives (shadcn/ui deseni) | Erişilebilirlik hazır gelir |
| Animasyon | Motion (Framer Motion) + CSS geçişleri | Kurallar: `docs/DESIGN_SYSTEM.md §6` |
| Karusel | Embla Carousel | |
| Form / doğrulama | React Hook Form + Zod | Zod şemaları `packages/contracts` içinde, API ile ortak |
| Veri çekme (istemci) | TanStack Query | Sepet, favori gibi etkileşimli veriler |
| Ödeme | iyzico (Checkout Form + 3DS), soyut `PaymentProvider` arayüzü arkasında | PayTR ikinci sağlayıcı olarak eklenebilir |
| E-posta / SMS | Soyut `Notifier` arayüzü; lokalde Mailpit | Sağlayıcı seçimi F11'de |
| Test | Vitest (birim), Testcontainers + Supertest (entegrasyon), Playwright (e2e + görsel), axe-core (a11y) | |
| Kalite | ESLint, Prettier, Lighthouse CI, Knip (ölü kod) | |
| Lokal ortam | Docker Compose: postgres, redis, meilisearch, rustfs (S3), mailpit | |
| CI | GitHub Actions: `pnpm verify` + e2e + Lighthouse | |

### 3.1 Klasör yapısı (hedef)
```
/
├─ apps/
│  ├─ web/          # Vitrin (Next.js)
│  ├─ admin/        # Yönetim paneli (Next.js)
│  └─ api/          # NestJS API + prisma/
├─ packages/
│  ├─ ui/           # Tasarım sistemi: tokens, bileşenler (web + admin ortak)
│  ├─ contracts/    # Zod şemaları + çıkarılan TS tipleri (API ↔ ön yüz sözleşmesi)
│  ├─ config/       # eslint, tsconfig, tailwind preset
│  └─ utils/        # para, slug, tarih, telefon gibi saf yardımcılar (testli)
├─ e2e/             # Playwright testleri ve görsel kontrol betikleri
├─ docs/            # Proje belgeleri
├─ .claude/commands # Özel slash komutları
├─ docker-compose.yml
├─ CLAUDE.md
└─ ROADMAP.md
```

---

## 4. Doğrulama kapıları (Definition of Done)

### 4.1 Her görev için zorunlu
| Kapı | Komut | Geçme şartı |
|---|---|---|
| G1 Tip | `pnpm typecheck` | 0 hata |
| G2 Lint | `pnpm lint` | 0 hata, 0 uyarı |
| G3 Birim/entegrasyon test | `pnpm test` | Hepsi yeşil; domain modüllerinde (`pricing`, `cart`, `checkout`, `orders`, `inventory`, `payments`) satır kapsamı ≥ %85 |
| G4 Build | `pnpm build` | Başarılı, yeni uyarı yok |
| G5 E2E | `pnpm e2e` (ilgili spec'ler) | Görevin dokunduğu akışların testleri yeşil |
| G6 Erişilebilirlik | Playwright + axe (`pnpm e2e:a11y`) | Dokunulan sayfalarda **0** ciddi/kritik ihlal |

`pnpm verify` = G1 + G2 + G3 + G4 (F0'da bu script kurulur).

### 4.2 UI görevleri için ek: görsel öz-kontrol (zorunlu)
1. `pnpm ui:snap <rota>` çalıştır → `.artifacts/screens/<rota>/` altına 375, 768, 1280, 1440 px
   genişlikte ekran görüntüleri ve hover/focus/açık-menü durumları üretilir (F0.7'de kurulur).
2. Görüntülerin **her birini Read aracıyla aç ve gerçekten bak.**
3. `docs/DESIGN_SYSTEM.md §12` "Görsel kontrol listesi"ni bu görüntülere göre madde madde değerlendir.
4. `docs/reference/` altında ilgili sayfanın ekran görüntüsü varsa yan yana kıyasla; yapısal farkları listele
   (birebir kopya değil, yapı ve bilgi hiyerarşisi eşleşmeli).
5. Bulduğun her sorunu düzelt ve 1. adımı tekrarla. Değerlendirme sonucunu `docs/PROGRESS.md`'ye yaz.

### 4.3 Performans bütçeleri (vitrin sayfaları, F10'dan itibaren CI'da zorunlu; öncesinde ölç ve kaydet)
- Lighthouse (mobil): Performans ≥ 90, Erişilebilirlik ≥ 95, En İyi Uygulamalar ≥ 95, SEO ≥ 95
- LCP ≤ 2,5 sn (hedef 2,0), INP ≤ 200 ms, CLS ≤ 0,05
- Rota başına ilk yüklemede JS ≤ 170 KB (gzip). Ağır bileşenler (lightbox, 360°, harita) dinamik import.

---

## 5. Öz-denetim kontrol listesi (her görev sonunda satır satır cevapla)

**Doğruluk**
- [ ] Kabul kriterlerinin **her biri** karşılandı mı? Her biri için kanıt (test adı / ekran görüntüsü / komut çıktısı) gösterebilir miyim?
- [ ] Hata yolları ele alındı mı? (ağ hatası, boş veri, stok yok, yetkisiz, zaman aşımı, çift tıklama)
- [ ] Sınır durumları test edildi mi? (0 adet, maksimum adet, çok uzun ürün adı, Türkçe karakterler `ğüşıöçİ`, indirimsiz ürün, tek görselli ürün)

**Tutarlılık**
- [ ] Yalnızca tasarım token'ları ve `packages/ui` bileşenleri mi kullanıldı? Aynı işi yapan ikinci bir bileşen yaratmadım mı?
- [ ] API cevapları `packages/contracts` şemalarıyla doğrulanıyor mu? Ön yüz ve API aynı tipi mi kullanıyor?
- [ ] İsimlendirme ve klasör yapısı §3.1 ve §7 ile uyumlu mu?

**Kullanıcı deneyimi (UI görevleri)**
- [ ] Yükleniyor / boş / hata / başarı durumlarının dördü de tasarlandı mı? (iskelet ekran, boş durum metni, tekrar dene)
- [ ] Klavye ile baştan sona kullanılabiliyor mu? Odak halkası görünür mü? Odak sırası mantıklı mı?
- [ ] Dokunma hedefleri ≥ 44×44 px mi? Mobilde yatay kaydırma taşması var mı?
- [ ] `prefers-reduced-motion` açıkken animasyonlar sadeleşiyor mu?
- [ ] Düzen kayması (CLS) yaratan görsel/font/iskelet var mı?

**Güvenlik ve veri**
- [ ] Tüm girdiler sunucuda doğrulandı mı? Yetki kontrolü endpoint seviyesinde mi?
- [ ] Loglarda kişisel veri / gizli bilgi var mı?
- [ ] Para hesapları kuruş tamsayı ile mi? Yuvarlama kuralı `docs/ARCHITECTURE.md §6`'ya uygun mu?

**Temizlik**
- [ ] Ölü kod, `console.log`, yorum satırına alınmış kod, kullanılmayan bağımlılık bıraktım mı? (`pnpm knip`)
- [ ] Yeni bağımlılık eklediysem `docs/DECISIONS.md`'ye yazdım mı?
- [ ] Belgeler (README, ARCHITECTURE, DESIGN_SYSTEM) değişen davranışa göre güncellendi mi?

---

## 6. Mimari ilkeler (özet — ayrıntı `docs/ARCHITECTURE.md`)
- **Modüler monolit:** Her NestJS modülü kendi `controller → service → repository` katmanına sahiptir.
  Modüller birbirinin repository'sine erişmez; yalnızca dışa açılan servis arayüzleri veya domain olayları üzerinden konuşur.
- **İş kuralı servis katmanındadır,** controller ince kalır. Ön yüzde iş kuralı (fiyat hesabı, stok kararı) **tekrarlanmaz**;
  ön yüz yalnızca API'nin hesapladığını gösterir.
- **Sipariş ve ödeme akışları idempotent'tir** (`Idempotency-Key`), durum makinesi ile yönetilir, her geçiş loglanır.
- **Yan etkiler kuyruktadır:** e-posta, SMS, arama indeksleme, ISR yeniden doğrulama → Outbox tablosu + BullMQ.
- **Hata formatı tektir:** RFC 9457 (Problem Details) — `type`, `title`, `status`, `detail`, `code`, `errors[]`.
  Kullanıcıya gösterilecek Türkçe mesaj ön yüzde `code`'a göre seçilir.
- **Vitrin render stratejisi:** Ana sayfa, kategori ve ürün sayfaları Server Component + etiket bazlı önbellek
  (`revalidateTag`); ürün/fiyat/stok değişince API kuyruk üzerinden ilgili etiketi geçersiz kılar.
  Sepet, favori, kullanıcıya özel her şey istemci tarafında TanStack Query ile.

---

## 7. Kodlama standartları
- Dosya adları `kebab-case`, React bileşenleri `PascalCase` export, hook'lar `useX`.
- Bileşen dosyası ~250 satırı geçiyorsa böl. Fonksiyon ~50 satırı geçiyorsa böl.
- Kod, değişken, fonksiyon adları **İngilizce**; kullanıcıya görünen metinler **Türkçe** ve
  `apps/web/messages/tr.json` içinde (i18n'e hazır). Kodun içine Türkçe UI metni gömülmez.
- Yorumlar: "ne" değil "neden" yazılır. Karmaşık iş kuralına belge bölümü atfı eklenir (`// bkz. ARCHITECTURE §7.3`).
- Tarih/saat: veritabanında UTC, gösterimde `Europe/Istanbul`. Telefon: E.164. Slug: Türkçe harf dönüşümlü (`ğ→g, ş→s, ı→i, İ→i, ö→o, ü→u, ç→c`).
- Her public API endpoint'i OpenAPI'de belgelenir (Nest Swagger). Her yeni endpoint'in en az bir entegrasyon testi vardır.
- Git: `main` her zaman yeşil. Conventional Commits. Commit mesajı Türkçe olabilir, tip/scope İngilizce.

---

## 8. Ne zaman kullanıcıya sorulur? (çok nadiren)

**Sadece şu durumlarda dur ve sor** — sorularını tek mesajda topla, her soru için önerdiğin varsayılanı yaz:
1. `docs/PROGRESS.md` → "Kullanıcıdan beklenenler" listesindeki bir bilgi o göreve engel olduğunda
   (marka adı, logo, API anahtarları, alan adı, hosting tercihi, yasal metinlerin son onayı).
2. Ücretli bir hizmete kayıt / ödeme gerektiğinde.
3. Geri alınamaz veri işlemi (prod veritabanı, toplu silme) gerektiğinde.
4. Yol haritasından sapmayı gerektiren bir keşif yaptığında (ör. seçilen teknoloji gereksinimi karşılamıyor).

**Diğer her durumda:** belgelerdeki varsayılanla ilerle, kararı `docs/DECISIONS.md`'ye yaz, devam et.
Kullanıcıdan beklenen bir bilgi yoksa o görev için yer tutucu kullan (ör. `[MARKA_ADI]`, sandbox anahtarı),
görevi "yer tutucuyla tamamlandı" notuyla bitir ve bilgiyi "Kullanıcıdan beklenenler"e ekle.

---

## 9. Yasaklar listesi (hızlı başvuru)
- Hafızadan sürüm numarası, API imzası veya yasal kural uydurmak → resmi belgeden doğrula.
- Bir sağlayıcının (iyzico, kargo, SMS) API'sini tahminle yazmak → resmi dokümanı oku, sandbox ile test et.
- Gerçek müşteri verisiyle test → yalnızca seed/faker verisi.
- `docs/reference/` görüntülerinden logo, ürün fotoğrafı, marka metni kopyalamak → yalnızca yapı ve etkileşim örneklenir.
- Kullanıcıya sormadan prod ortamına deploy, DNS değişikliği, ücretli servis açmak.
- Testi geçirmek için üretim kodunu test ortamını algılayıp farklı davranacak şekilde yazmak.
- Bir görevi bitmiş göstermek için kabul kriterini sessizce yeniden yorumlamak. Kriter yanlışsa `docs/DECISIONS.md`'de gerekçeyle değiştir.

---

## 10. Özel komutlar (`.claude/commands/`)
| Komut | Ne yapar |
|---|---|
| `/siradaki` | Oturum başlangıç protokolünü çalıştırır ve sıradaki görevi planlar |
| `/dogrula` | G1–G6 kapılarını çalıştırır, sonuçları raporlar |
| `/gorsel-kontrol <rota>` | §4.2 görsel öz-kontrolü yapar |
| `/faz-denetimi` | Fazın tamamını bağımsız gözle denetler (§2.3) |
