# Mimari

> Backend, veri modeli ve entegrasyon kararlarının tek kaynağı. Burada yazmayan bir yapı kurulmadan önce
> bu belge güncellenir ve `DECISIONS.md`'ye ADR eklenir.

---

## §1 Genel bakış

```
                 ┌──────────────┐        ┌──────────────┐
  Ziyaretçi ───▶ │  apps/web    │        │  apps/admin  │ ◀─── Yönetici (2FA)
                 │  Next.js     │        │  Next.js     │
                 └──────┬───────┘        └──────┬───────┘
                        │  HTTPS / JSON (packages/contracts şemaları)
                        ▼                       ▼
                 ┌─────────────────────────────────────┐
                 │            apps/api (NestJS)        │
                 │  modüler monolit — §2               │
                 └──┬──────────┬──────────┬────────┬───┘
                    │          │          │        │
              PostgreSQL     Redis     Meilisearch  S3 (MinIO)
              (Prisma)    (cache, rate   (arama)    (görseller)
                          limit, BullMQ)
                    │
                    └──▶ Outbox → BullMQ işçileri → e-posta/SMS, arama indeksi,
                                                    ISR yeniden doğrulama, fatura, ödeme mutabakatı
  Dış servisler: iyzico (ödeme), e-Arşiv entegratörü (fatura), SMS/e-posta sağlayıcı, İYS
```

- Tek API süreci + aynı kod tabanından ayrı başlatılan **worker** süreci (`apps/api` içinde `main.worker.ts`).
- Ön yüzler veritabanına asla doğrudan bağlanmaz; yalnızca API.

---

## §2 Modüller (`apps/api/src/modules/*`)

| Modül | Sorumluluk |
|---|---|
| `auth` | Kayıt, giriş, oturum, şifre sıfırlama, e-posta doğrulama, admin 2FA (TOTP) |
| `users` | Profil, adresler, iletişim izinleri, KVKK talepleri |
| `geo` | İl / ilçe / mahalle verisi, teslimat bölgeleri |
| `catalog` | Kategori, koleksiyon, ürün, varyant, seçenek, öznitelik, medya, **takım (set) bileşenleri** |
| `pricing` | Fiyat, fiyat geçmişi (30 gün en düşük), kampanya, kupon, takım indirimi, taksit bilgisi |
| `inventory` | Depo, stok, rezervasyon, siparişe üretim süreleri |
| `cart` | Sepet (misafir + üye), birleştirme, sepet fiyatlama |
| `checkout` | Ödeme öncesi doğrulama, sipariş taslağı, yasal belgelerin üretimi |
| `orders` | Sipariş, durum makinesi, iptal, iade |
| `payments` | `PaymentProvider` arayüzü, iyzico uygulaması, callback/webhook, iade, mutabakat |
| `fulfillment` | Teslimat planlama, kurulum randevusu, sevkiyat takibi |
| `invoices` | `InvoiceProvider` arayüzü (e-Arşiv), fatura kaydı |
| `reviews` | Değerlendirme, soru-cevap, moderasyon |
| `wishlist` | Favoriler |
| `search` | Meilisearch indeksleme ve sorgu |
| `cms` | Ana sayfa bölümleri, slider, banner, duyuru, sayfalar, blog, mağazalar |
| `notifications` | `Notifier` arayüzü, şablonlar, gönderim kuyruğu |
| `media` | Yükleme, doğrulama, normalizasyon, blur üretimi |
| `admin` | RBAC, denetim kaydı (audit log), ayarlar, panel uç noktaları |
| `platform` | Outbox, idempotency, sağlık kontrolü, yapılandırma, loglama |

**Kural:** Modül A, modül B'nin `repository`'sini import edemez. Gerekirse B'nin `XxxPublicService` arayüzünü kullanır
veya B'nin yayınladığı domain olayını dinler. ESLint `no-restricted-imports` kuralıyla zorlanır (F2.1).

---

## §3 Veri modeli (Prisma — özet)

> Kimlikler: `uuid` (v7, zaman sıralı). Her tabloda `createdAt`, `updatedAt`. Silme gereken ana varlıklarda `deletedAt` (soft delete).
> Ölçüler **milimetre tamsayı** (`widthMm`, `depthMm`, `heightMm`), ağırlık **gram tamsayı**, para **kuruş tamsayı** (§6).

### §3.1 Kimlik ve kullanıcı
- `User` (email *benzersiz, küçük harfe normalize*, phone E.164, passwordHash argon2id, firstName, lastName, emailVerifiedAt, status)
- `AdminUser` ayrı tablo değil; `User` + `UserRole` (`Role` ↔ `Permission` çoka-çok). Roller: `customer`, `support`, `catalog_manager`, `order_manager`, `admin`.
- `RefreshToken` (userId, tokenHash, familyId, expiresAt, revokedAt, replacedById, ip, userAgent) — rotasyon + yeniden kullanım tespiti.
- `Address` (userId, title, fullName, phone, cityId, districtId, neighborhoodId, line, postalCode, isDefaultShipping, isDefaultBilling, invoiceType `individual|corporate`, tckn?, taxNumber?, taxOffice?, companyName?) — TCKN şifreli saklanır (§5.4).
- `Consent` (userId?, email?, phone?, type, version, granted, at, ip, source) — yalnızca ekleme (append-only).
- `City`, `District`, `Neighborhood` — resmi açık veri kaynağından seed.

### §3.2 Katalog
- `Category` (parentId, slug *benzersiz*, name, description, imageId, sortOrder, isActive, seoTitle, seoDescription, `path` materyalize yol)
- `Collection` (slug, name, description, heroMediaId) — ör. "Lizbon"
- `Product` (slug, name, description (sanitize HTML), type `simple|set`, status `draft|active|archived`, collectionId?, taxRateBp (KDV, baz puan: 2000 = %20), requiresAssembly, leadTimeMinDays, leadTimeMaxDays, madeToOrder, seo alanları)
- `ProductCategory` (çoka-çok, isPrimary)
- `Option` (ör. Renk, Kumaş) / `OptionValue` (ad, swatchHex?, swatchMediaId?)
- `ProductVariant` (productId, sku *benzersiz*, barcode?, optionValueIds, priceMinor, widthMm, depthMm, heightMm, weightG, packageCount, desi, isDefault, isActive)
- `Attribute` / `AttributeValue` / `VariantAttribute` — filtrelenebilir özellikler (malzeme, stil, ayak tipi)
- `Media` (ownerType, ownerId, kind `packshot|lifestyle|drawing|video|model3d`, storageKey, width, height, alt, focalX, focalY, blurDataUrl, sortOrder)
- `SetComponent` (setProductId, componentVariantId, defaultQty, minQty, maxQty, isRequired, sortOrder)
  - Takım ürününün kendi `ProductVariant`'ı fiyat taşımaz; takım fiyatı = seçili bileşenlerin toplamı − takım indirimi (§6.4).
  - Takımın renk seçeneği varsa her renk için bileşen varyantları `OptionValue` üzerinden eşlenir.

### §3.3 Fiyat ve kampanya
- `PriceHistory` (variantId, priceMinor, effectiveFrom) — her fiyat değişikliğinde satır eklenir (tetikleyici değil, servis katmanı).
- `Campaign` (name, type `percent|fixed`, valueBp|valueMinor, scope `all|category|collection|product|variant`, scopeIds, startsAt, endsAt, priority, stackable)
- `SetDiscountRule` (setProductId, minComponents, discountBp) — ör. 4+ parça alınırsa %5
- `Coupon` (code *benzersiz, büyük harf*, type, value, minCartMinor, maxDiscountMinor?, usageLimit, perUserLimit, startsAt, endsAt, scope)
- `CouponRedemption` (couponId, orderId, userId?, email)

### §3.4 Stok
- `Warehouse` (code, name, cityId)
- `StockLevel` (variantId, warehouseId, onHand, reserved, version) — `onHand - reserved >= 0` CHECK kısıtı
- `StockReservation` (variantId, warehouseId, orderId, qty, status `active|committed|released`, expiresAt)

### §3.5 Sepet ve sipariş
- `Cart` (userId?, anonymousId?, couponCode?, expiresAt) / `CartItem` (cartId, variantId, qty, setGroupId?, setProductId?)
- `Order` (number *benzersiz, insan-okunur*: `SP-2026-000123`, userId?, email, phone, status, paymentStatus, currency, subtotalMinor, discountMinor, shippingMinor, assemblyMinor, totalMinor, taxMinor, shippingAddress (JSON anlık görüntü), billingAddress (JSON), legalDocs (ön bilgilendirme ve mesafeli satış metinlerinin şablon sürümü + render edilmiş metnin SHA-256'sı + saklama anahtarı), placedAt, estimatedDeliveryFrom/To)
- `OrderItem` (orderId, variantId, sku, name, optionSummary, qty, unitPriceMinor, discountMinor, taxRateBp, taxMinor, lineTotalMinor, setGroupId?, setProductName?) — **anlık görüntü**: ürün sonradan değişse de sipariş değişmez
- `OrderEvent` (orderId, fromStatus, toStatus, actorType `system|customer|admin`, actorId?, reason?, at)
- `Delivery` (orderId, scheduledDate?, timeWindow?, carrier?, trackingNo?, assemblyRequired, assemblyDoneAt?, status)
- `ReturnRequest` (orderId, items JSON, reason, status, refundMinor)
- `Payment` (orderId, provider, providerRef, conversationId, amountMinor, installments, status `initiated|authorized|captured|failed|refunded|partially_refunded`, failureCode?, rawMasked JSON)
- `PaymentEvent` (paymentId, type, payloadMasked, receivedAt, signatureValid)
- `Invoice` (orderId, provider, number, status, pdfStorageKey, issuedAt)

### §3.6 İçerik, etkileşim, platform
- `Review` (productId, userId, orderItemId, rating 1–5, title, body, mediaIds, status `pending|approved|rejected`), `Question` / `Answer`
- `WishlistItem` (userId, variantId)
- `HomeSection` (type, payload JSON — tipine göre Zod ile doğrulanır, sortOrder, isActive, startsAt?, endsAt?), `Slide`, `Banner`, `Announcement`, `Page`, `BlogPost`, `Store`
- `Setting` (key, value JSON, Zod şemalı) — ücretsiz teslimat eşiği, avantaj şeridi metinleri, iletişim bilgileri
- `DeliveryZone` (cityId, districtIds?, feeMinor, assemblyFeeMinor, leadDays, assemblyAvailable, isActive)
- `Holiday` (date, name) — iş günü hesabı için resmi tatiller, yıllık seed
- `LegalTemplate` (type `preliminary_info|distance_sales|kvkk|cookie|return_policy`, version, body, publishedAt)
- `OutboxEvent` (type, payload, status, attempts, availableAt, lastError)
- `IdempotencyKey` (key, scope, requestHash, statusCode, responseBody, expiresAt)
- `AuditLog` (actorId, action, entityType, entityId, before JSON, after JSON, ip, at) — admin yazma işlemlerinin tamamı

**İndeksler:** her yabancı anahtar, `slug`, `sku`, `Order.number`, `Order(userId, placedAt desc)`, `OutboxEvent(status, availableAt)`,
`StockReservation(status, expiresAt)`, ürün listeleme için `ProductCategory(categoryId)` + `Product(status)`.

---

## §4 API sözleşmesi
- Taban: `/v1`. JSON. Alan adları `camelCase`. Tarihler ISO-8601 UTC.
- İstek/cevap şemaları `packages/contracts` içinde Zod; API girişte doğrular (Nest pipe), ön yüz cevabı doğrular (geliştirme ortamında zorunlu, prod'da örneklemeli log).
- Sayfalama: imleç tabanlı (`?cursor=&limit=`, en fazla 100) — listeleme sayfalarında SEO için sayfa numarası ön yüzde imlece eşlenir.
- Hatalar: RFC 9457 Problem Details + `code` (ör. `CART_ITEM_OUT_OF_STOCK`, `COUPON_EXPIRED`, `PAYMENT_DECLINED`). Hata kodları `packages/contracts/errors.ts`'te tek listede.
- Yazma işlemlerinde `Idempotency-Key` başlığı: **zorunlu** → `POST /checkout/orders`, `POST /payments/*`, `POST /orders/*/cancel`, `POST /returns`.
  Aynı anahtar + aynı gövde → kaydedilmiş cevap döner; aynı anahtar + farklı gövde → `409`.
- OpenAPI: `/v1/docs` (yalnızca geliştirme/staging).
- Her istekte `X-Request-Id` (yoksa üretilir), cevapta geri döner, tüm loglarda bulunur.

---

## §5 Kimlik doğrulama ve güvenlik

### §5.1 Oturum
- Access token (JWT, 15 dk) + refresh token (opak, 30 gün, hash'li saklanır, her kullanımda döner).
  Yeniden kullanılmış refresh token tespit edilirse **tüm aile iptal** edilir.
- Token'lar `httpOnly`, `Secure`, `SameSite=Lax` çerezlerde. Vitrin ve panel ayrı çerez adları/kapsamları.
- CSRF: değiştirici isteklerde çift gönderimli token (`X-CSRF-Token` başlığı = çerezdeki değer).
- Misafir sepeti: imzalı `cart_id` çerezi; girişte sepetler birleştirilir (adetler toplanır, stok sınırına kırpılır, kullanıcıya bildirilir).
- Admin: zorunlu TOTP 2FA, 30 dk hareketsizlikte oturum düşer, IP + cihaz loglanır.

### §5.2 Parola ve hesap
- argon2id (OWASP önerilen parametreler — F2'de güncel öneri kontrol edilip `DECISIONS.md`'ye yazılır).
- En az 10 karakter; sızdırılmış parola kontrolü (k-anonimlik ile HIBP aralık API'si, opsiyonel).
- Giriş denemesi: IP+e-posta başına 5/dk, 20/saat → kademeli gecikme; hesap kilidi yerine geçici kısıtlama (hesap kilitleme saldırısını önler).
- "Bu e-posta kayıtlı değil" gibi kullanıcı varlığını sızdıran mesaj yok.

### §5.3 Uygulama güvenliği (OWASP ASVS L2 hedefi)
- Helmet; katı CSP (nonce tabanlı; iyzico ve analitik alan adları izin listesinde); HSTS; `Referrer-Policy: strict-origin-when-cross-origin`.
- CORS: yalnızca vitrin ve panel alan adları.
- Oran sınırlama (Redis): genel 300/dk/IP; giriş/kayıt/şifre sıfırlama/kupon/soru gönderme için özel sınırlar.
- Tüm zengin metin (ürün açıklaması, CMS) sunucuda sanitize edilir (izin listesi).
- Dosya yükleme: içerikten MIME tespiti, boyut sınırı, yeniden kodlama (EXIF temizlenir), dosya adı rastgele.
- SSRF: kullanıcıdan URL alınıp sunucudan çekilmez.
- Bağımlılık taraması CI'da (`pnpm audit` + Dependabot). Kritik açık → build kırmızı.
- Yetkilendirme: her controller'da açık `@Permissions()`; varsayılan **reddet** (global guard). IDOR testleri: kullanıcı A, B'nin siparişini/adresini göremez (entegrasyon testi zorunlu).

### §5.4 Kişisel veri (KVKK)
- TCKN, vergi no: uygulama seviyesinde şifreleme (AES-256-GCM, anahtar ortam değişkeninde, anahtar rotasyonuna hazır `keyId`).
- Loglarda maskeleme: e-posta `a***@g***.com`, telefon `+90 5** *** ** 12`; pino `redact` listesi testle doğrulanır.
- Hesap silme: kişisel alanlar anonimleştirilir; yasal saklama süresi olan sipariş/fatura kayıtları korunur.
- "Verimi indir": kullanıcının tüm verisi JSON olarak.

---

## §6 Para, vergi ve yuvarlama

1. **Tüm tutarlar kuruş cinsinden tamsayı** (`Int`). Toplu raporlarda `BigInt`. JS tarafında `number` güvenli aralıkta kalır; hesaplama yardımcıları `packages/utils/money.ts` içindedir ve **yalnızca** bunlar kullanılır.
2. Para birimi şimdilik yalnızca TRY; yine de her tutar alanının yanında `currency` taşınır.
3. Vitrin fiyatları **KDV dahildir**. KDV satır bazında hesaplanır: `tax = round(lineTotal × rate / (1 + rate))`, yuvarlama **half-up**, satırlar toplanır.
4. Yüzde indirimler satırlara **orantılı dağıtılır**; kuruş farkı "en büyük kalan" yöntemiyle dağıtılır → satır indirimlerinin toplamı her zaman toplam indirime **tam** eşittir. Bu, özellik tabanlı testle (fast-check) doğrulanır.
5. İndirim uygulama sırası: kampanya fiyatı → takım indirimi → kupon. Kupon kampanyalı ürüne uygulanır mı: kupon ayarında `stackable`.
6. Gösterim: `formatTRY(minor)` → `8.490,00 TL` (her zaman iki ondalık, binlik ayırıcı nokta). `Intl.NumberFormat('tr-TR')` kullanılır, sonuç birim testlidir.
7. Fiyat **her zaman sunucuda** hesaplanır. İstemcinin gönderdiği hiçbir fiyat/indirim değeri dikkate alınmaz.

---

## §7 Sepet → ödeme → sipariş akışı

### §7.1 Sepet fiyatlama
`POST /cart/quote` (ve her sepet okuması) → güncel fiyat, kampanya, takım indirimi, kupon, teslimat ücreti, kurulum ücreti, ücretsiz teslimata kalan tutar, satır uyarıları (`PRICE_CHANGED`, `LOW_STOCK`, `OUT_OF_STOCK`, `LEAD_TIME_CHANGED`).

### §7.2 Teslimat süresi hesabı
- Stokta ürün: depo → teslimat bölgesi süresi (`DeliveryZone.leadDays`).
- Siparişe üretim: `leadTimeMin/MaxDays` + bölge süresi.
- Sepet/sipariş tahmini = satırların **en geç** olanı. İş günü hesabı: hafta sonu ve resmi tatiller (`Holiday` tablosu, yıllık seed) hariç.

### §7.3 Stok rezervasyonu
- Ödeme başlatılırken (`POST /checkout/orders`) tek transaction içinde:
  `UPDATE stock_level SET reserved = reserved + :qty WHERE variant_id = :v AND on_hand - reserved >= :qty RETURNING ...`
  Etkilenen satır 0 ise → `OUT_OF_STOCK`, transaction geri alınır.
- Rezervasyon süresi 20 dk (`StockReservation.expiresAt`). Ödeme başarılı → `committed` (`onHand -= qty`, `reserved -= qty`). Başarısız/süre doldu → `released`.
- Süresi dolan rezervasyonları her dakika çalışan tekrarlayan iş serbest bırakır (kilitli, tek örnek).
- `madeToOrder` ürünlerde stok kontrolü yapılmaz, üretim kuyruğu notu düşülür.
- **Eşzamanlılık testi zorunlu:** son 1 adet ürüne 20 paralel sipariş → yalnızca 1'i başarılı (F6 kabul kriteri).

### §7.4 Sipariş durum makinesi
```
                ┌──────────── payment_failed / expired ──▶ CANCELLED
                │
PENDING_PAYMENT ─┴─ paid ─▶ CONFIRMED ─▶ IN_PRODUCTION* ─▶ READY_FOR_DELIVERY ─▶ OUT_FOR_DELIVERY ─▶ DELIVERED ─▶ COMPLETED**
                              │               │                    │
                              └───────────────┴──── cancel ────────┴──▶ CANCELLED (iade tetiklenir)
DELIVERED ─▶ RETURN_REQUESTED ─▶ RETURN_APPROVED ─▶ RETURNED (iade tetiklenir) | RETURN_REJECTED ─▶ DELIVERED
 * yalnızca siparişe üretim ürünleri   ** cayma süresi dolunca otomatik
```
- Geçişler `orders/domain/order-state-machine.ts` içinde **tek tabloda** tanımlanır; izin verilmeyen geçiş exception fırlatır.
- **Tüm izinli/izinsiz geçiş çiftleri** için tablo tabanlı birim testi zorunludur.
- Her geçiş: `OrderEvent` kaydı + outbox olayı (`order.status_changed`) → müşteri bildirimi.

### §7.5 Ödeme (iyzico — `PaymentProvider` arayüzü arkasında)
```ts
interface PaymentProvider {
  initCheckout(input: InitCheckoutInput): Promise<{ token: string; paymentPageUrl?: string; formContent?: string }>;
  retrieveCheckout(token: string): Promise<CheckoutResult>;     // callback'te DOĞRULAMA için
  refund(input: RefundInput): Promise<RefundResult>;
  getInstallments(input: { amountMinor: number; binNumber?: string }): Promise<InstallmentTable>;
}
```
1. `POST /checkout/orders` → sipariş `PENDING_PAYMENT`, stok rezerve, `Payment(initiated)`, sağlayıcıdan checkout form token'ı.
2. Kullanıcı sağlayıcının formunda (3D Secure dahil) öder. **Kart verisi sunucumuza hiç gelmez.**
3. Sağlayıcı callback URL'imize döner → callback gövdesine **güvenilmez**; token ile `retrieveCheckout` çağrılır,
   tutar + `conversationId` (= sipariş id) + durum karşılaştırılır.
4. Eşleşirse tek transaction: `Payment(captured)`, sipariş `CONFIRMED`, rezervasyon `committed`, kupon kullanımı kaydı, outbox olayları.
   İşlem idempotent: aynı callback iki kez gelirse ikinci etkisizdir.
5. Mutabakat işi (her 15 dk): `initiated` durumda 30 dk'dan eski ödemeleri sağlayıcıdan sorgular, durumları düzeltir.
- **Uygulama öncesi:** iyzico'nun güncel resmi API dokümanı okunur; uç nokta, imza ve alan adları dokümandan alınır; sandbox ile uçtan uca test edilir. Tahminle entegrasyon yazılmaz.
- CI ve e2e testlerde `FakePaymentProvider` DI ile enjekte edilir (yalnızca test modülünde); üretim kodu ortam algılayıp davranış değiştirmez.

### §7.6 Yasal belgeler
- Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi şablonları sürümlüdür (`LegalTemplate`); sipariş anında sipariş verisiyle render edilir,
  PDF olarak saklanır, hash'i siparişe yazılır, onay e-postasına eklenir. Şablon metinlerinin son hâli kullanıcı/hukukçu onayı gerektirir.

---

## §8 Arama (Meilisearch)
- İndeks: `products` (ürün seviyesinde belge; varyant renkleri ve fiyat aralığı içinde).
- Aranabilir: ad, kategori adları, koleksiyon, renk adları, malzeme, SKU. Filtrelenebilir: `categoryPaths`, `colors`, `materials`, `minPriceMinor`, `widthMm`, `inStock`, `collection`, `hasDiscount`.
- Eş anlamlılar (yönetim panelinden): koltuk ↔ kanepe, gardırop ↔ dolap, sehpa ↔ orta sehpa, karyola ↔ yatak çerçevesi.
- Türkçe normalizasyon testleri: "gardirop" → "gardırop", "SANDALYE" → "sandalye", "İzmir" büyük/küçük harf.
- Senkronizasyon: ürün/fiyat/stok değişimi → outbox → indeks güncelleme işi; gece tam yeniden indeksleme + tutarlılık karşılaştırması.

## §9 Önbellek ve yeniden doğrulama
- Vitrin `fetch` çağrıları etiketli: `product:{id}`, `category:{id}`, `collection:{id}`, `home`, `nav`, `settings`.
- API'de değişiklik → outbox `cache.invalidate` olayı → işçi vitrinin `/api/revalidate` ucunu gizli anahtarla çağırır.
- API tarafında Redis önbelleği: kategori ağacı, ayarlar, taksit tabloları (kısa TTL + olayla geçersiz kılma).

## §10 Kuyruk ve outbox
- Domain değişikliği ile `OutboxEvent` aynı transaction'da yazılır (çift yazma sorunu yok).
- Outbox aktarıcısı (relay) olayları BullMQ'ya taşır; işler **idempotent** yazılır (aynı olay iki kez işlense de sonuç aynı).
- Yeniden deneme: üstel geri çekilme, en fazla 8 deneme, sonra `dead-letter` + admin uyarısı.
- Kuyruklar: `notifications`, `search-index`, `cache-invalidate`, `invoices`, `payments-reconcile`, `reservations-expire`, `media-process`.

## §11 Gözlemlenebilirlik
- pino JSON log, `requestId`, `userId?`, modül adı; kişisel veri `redact`.
- `/health/live`, `/health/ready` (DB, Redis, Meili, S3 kontrolü).
- Hata takibi: Sentry (DSN ortam değişkeni; yoksa devre dışı).
- Metrikler: `prom-client` → `/metrics` (yalnızca iç ağdan / token ile). İş metrikleri: sipariş sayısı, ödeme başarı oranı, sepete ekleme → ödeme dönüşümü.

## §12 Test stratejisi
| Seviye | Araç | Kapsam |
|---|---|---|
| Birim | Vitest | `packages/utils` (para, slug, telefon), domain servisleri, durum makinesi, fiyatlama; para dağıtımı için fast-check |
| Entegrasyon | Vitest + Testcontainers (Postgres, Redis) + Supertest | Her endpoint en az 1 mutlu yol + yetki + doğrulama hatası; IDOR testleri; eşzamanlı stok testi |
| Sözleşme | Zod | API cevapları `contracts` şemasına uyar (entegrasyon testlerinde otomatik) |
| E2E | Playwright | Kritik yolculuklar: ana sayfa → kategori → filtre → PDP → takım oluştur → sepet → ödeme (fake provider) → sipariş onayı; üyelik; hesabım; admin ürün oluşturma |
| Erişilebilirlik | @axe-core/playwright | Tüm vitrin şablon sayfaları |
| Görsel | Playwright ekran görüntüsü | `ui:snap` (öz-kontrol) + kritik bileşenlerde görsel regresyon |
| Performans | Lighthouse CI, k6 | Vitrin bütçeleri; API: 200 eşzamanlı kullanıcıda p95 < 300 ms (katalog), < 800 ms (checkout) |

## §13 Ortamlar ve yapılandırma
- `local` (Docker Compose), `test` (CI), `staging`, `production`.
- Ortam değişkenleri açılışta Zod ile doğrulanır; eksik/yanlışsa süreç **başlamaz** (açıklayıcı hata ile).
- `.env.example` her değişkeni açıklamasıyla listeler; gerçek değerler yalnızca sunucu gizli yöneticisinde.

## §14 Yayın ve operasyon (F12'de kesinleşir)
- Varsayılan öneri: Docker imajları (api, worker, web, admin) + Caddy (otomatik TLS) + yönetilen PostgreSQL (zaman noktasına geri dönüş yedekli).
- **KVKK:** Kişisel verilerin yurt dışında barındırılması aktarım kurallarına tabidir; barındırma konumu kullanıcı ile netleştirilir (`PROGRESS.md` → Kullanıcıdan beklenenler).
- Yedekleme: günlük tam + sürekli WAL; aylık geri yükleme tatbikatı (runbook `docs/RUNBOOK.md`, F12).
- Sıfır kesintili migration: genişlet → taşı → daralt deseni.
