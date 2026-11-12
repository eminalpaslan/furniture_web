# Tasarım Sistemi

> Tüm ön yüz işleri bu belgeye uyar. Burada olmayan bir değer gerekiyorsa önce buraya eklenir,
> `packages/ui/tokens` içine işlenir, sonra kullanılır. Sayfa düzenleri için: `docs/REFERENCE.md`.

---

## §1 Tasarım ilkeleri (insan–bilgisayar etkileşimi)

Her ekran kararı aşağıdaki ilkelerle gerekçelendirilebilmelidir:

| İlke | Bu projede somut karşılığı |
|---|---|
| **Sistem durumunun görünürlüğü** (Nielsen 1) | Sepete eklemede buton içi yükleniyor → onay animasyonu + mini sepet çekmecesi; sipariş durum zaman çizelgesi; stok ve tahmini teslimat her zaman görünür |
| **Gerçek dünyayla eşleşme** (2) | Ölçüler "G × D × Y cm" (Genişlik × Derinlik × Yükseklik), Türk e-ticaret alışkanlıkları: taksit tablosu, "Kargo/Teslimat ve Kurulum Bedava" dili |
| **Kullanıcı kontrolü ve özgürlük** (3) | Sepetten silmede "Geri al" toast'u (5 sn), her çekmece/modal Esc ile kapanır, geri tuşu filtreleri korur (filtreler URL'de) |
| **Tutarlılık ve standartlar** (4) / Jakob yasası | Header düzeni Türk mobilya sitelerinin alışılmış kalıbında: logo solda, arama ortada, hesap–favori–sepet sağda |
| **Hata önleme** (5) | Stokta olmayan varyant seçilemez ama görünür (üstü çizili + "Tükendi"); adet sınırları stepper'da; adres formunda il→ilçe→mahalle zincirli seçim |
| **Hatırlamak yerine tanıma** (6) | Son gezilen ürünler, aramada son aramalar, seçili filtreler çip olarak üstte |
| **Esneklik ve verimlilik** (7) | `/` tuşu aramaya odaklanır, ürün galerisinde ← → tuşları, hızlı "Sepete ekle" ürün kartında |
| **Estetik ve sade tasarım** (8) | Ekranda bir birincil eylem; ikincil eylemler görsel olarak geri planda |
| **Hatadan kurtulma** (9) | Hata mesajı: ne oldu + ne yapmalı + buton ("Ödeme alınamadı. Kart bilgilerini kontrol edip tekrar deneyin." [Tekrar dene]) |
| **Yardım** (10) | Ürün sayfasında "Ölçü rehberi", "Teslimat nasıl yapılır?" açılır bilgileri; WhatsApp destek |
| **Fitts yasası** | Birincil CTA büyük (56 px) ve başparmak bölgesinde (mobilde yapışkan alt çubuk) |
| **Hick yasası** | Mega menü en fazla 6 sütun; filtre grupları varsayılan kapalı, en çok kullanılan 3'ü açık |
| **Gestalt (yakınlık/benzerlik)** | Fiyat bloğu, taksit ve CTA görsel olarak tek grup; aynı türdeki kartlar aynı boyutta |

---

## §2 Renk token'ları

Tüm kontrast oranları WCAG 2.2 formülüyle hesaplanıp doğrulanmıştır.
**Kural:** Gövde metni ≥ 4.5:1, büyük metin (≥ 24 px veya ≥ 18.66 px kalın) ve UI kenarlıkları/ikonlar ≥ 3:1.

### §2.1 Açık tema (varsayılan)
| Token | Değer | Kullanım | Doğrulanmış kontrast |
|---|---|---|---|
| `--color-bg` | `#FAF8F5` | Sayfa zemini (sıcak kırık beyaz) | — |
| `--color-surface` | `#FFFFFF` | Kart, çekmece, modal | — |
| `--color-surface-muted` | `#F3EFEA` | Ürün görsel zemini, bölüm arka planı | — |
| `--color-border` | `#E6E0D8` | Ayırıcı çizgiler (dekoratif) | dekoratif — kontrast şartı yok |
| `--color-border-strong` | `#8C8378` | Input kenarlığı, seçilebilir öğe kenarı | 3.52:1 (bg) ✔ |
| `--color-text` | `#1F1B16` | Ana metin | 16.15:1 (bg) ✔ |
| `--color-text-muted` | `#6B635A` | İkincil metin, eski fiyat | 5.57:1 (bg), 5.16:1 (surface-muted) ✔ |
| `--color-text-subtle` | `#7A7168` | Placeholder | 4.78:1 (surface) ✔ |
| `--color-primary` | `#1F1B16` | Birincil buton zemini | beyaz metin 17.12:1 ✔ |
| `--color-primary-hover` | `#3A332B` | Birincil buton hover | beyaz metin 12.44:1 ✔ |
| `--color-on-primary` | `#FFFFFF` | Birincil buton metni | — |
| `--color-accent` | `#B5552B` | Terracotta — indirim fiyatı, rozet, odak halkası, vurgu | 4.61:1 (bg), beyaz metin 4.88:1 ✔ |
| `--color-accent-hover` | `#9A4622` | Vurgu butonu hover | beyaz metin 6.42:1 ✔ |
| `--color-success` | `#2F6B3F` | Stokta, başarı | 6.01:1 (bg) ✔ |
| `--color-warning` | `#8A5A00` | Son X adet, gecikme uyarısı | 5.59:1 (bg) ✔ |
| `--color-danger` | `#B42318` | Hata, tükendi | 6.20:1 (bg) ✔ |
| `--color-focus` | `#B5552B` | Odak halkası (2 px, 2 px offset) | 4.61:1 (bg) ✔ |
| `--color-overlay` | `rgb(31 27 22 / 0.5)` | Modal/çekmece arka perdesi | — |

**Durum renkleri tek başına anlam taşımaz:** her zaman ikon + metin ile birlikte kullanılır.

### §2.2 Koyu tema
F1'de token yapısı koyu temaya hazır kurulur (`[data-theme="dark"]`), ancak vitrin varsayılanı açık temadır;
koyu tema yalnızca yönetim panelinde aktiftir. Koyu tema token'ları eklenirken aynı kontrast tablosu
yeniden hesaplanır ve bu belgeye yazılır (`pnpm tokens:contrast` scripti — F1.1).

### §2.3 Marka rengi değişirse
Kullanıcı farklı bir marka rengi verirse yalnızca `--color-accent*` ve gerekirse `--color-primary*` değişir;
yeni değerler `pnpm tokens:contrast` ile doğrulanmadan commit'lenmez.

---

## §3 Tipografi

| Rol | Font | Not |
|---|---|---|
| Gövde, UI | **Inter** (değişken) | `next/font`, `subsets: ['latin', 'latin-ext']` — Türkçe karakterler için `latin-ext` zorunlu |
| Başlık (H1–H2, hero, bölüm başlıkları) | **Fraunces** (değişken, opsz) | Yalnızca ≥ 24 px'te. Küçük başlıklar Inter 600 |

- F1'de bir test sayfası `ğĞüÜşŞıİöÖçÇ` karakterlerini her ağırlıkta render eder; görsel kontrolde kontrol edilir.
- `font-display: swap` + `next/font` fallback metrik ayarı (CLS önlemek için `adjustFontFallback`).
- Sayılar (fiyat, ölçü): `font-variant-numeric: tabular-nums` — fiyat değişince genişlik zıplamasın.

### §3.1 Ölçek (rem tabanı 16 px)
| Token | Boyut / satır yüksekliği | Kullanım |
|---|---|---|
| `text-xs` | 12 / 16 | Yasal dipnot, rozet (yalnızca kısa metin) |
| `text-sm` | 14 / 20 | Yardımcı metin, breadcrumb, kart alt bilgisi |
| `text-base` | 16 / 24 | Gövde (mobil dahil asla 16'nın altında gövde metni yok — iOS zoom'u da engeller) |
| `text-lg` | 18 / 28 | Ürün kartı başlığı (masaüstü), vurgulu paragraf |
| `text-xl` | 20 / 28 | Kart fiyatı, alt başlık |
| `text-2xl` | 24 / 32 | H3, PDP fiyatı (mobil) |
| `text-3xl` | 30 / 38 | H2 bölüm başlığı, PDP fiyatı (masaüstü) |
| `text-4xl` | 36 / 44 | H1 (mobil) |
| `text-5xl` | 48 / 56 | H1 (masaüstü), hero başlığı (mobil) |
| `text-6xl` | 60 / 68 | Hero başlığı (masaüstü) |

Satır uzunluğu: paragraflar en fazla `65ch`. Ağırlıklar: 400 gövde, 500 UI etiketleri, 600 başlık/fiyat, 700 yalnızca rozet.

---

## §4 Boşluk, ızgara, kırılım noktaları

- **Boşluk ölçeği (4 px tabanı):** 0, 1 (4), 2 (8), 3 (12), 4 (16), 5 (20), 6 (24), 8 (32), 10 (40), 12 (48), 16 (64), 20 (80), 24 (96).
  Bunların dışında değer kullanılmaz.
- **Bölümler arası dikey boşluk:** mobil 48, tablet 64, masaüstü 96.
- **Kırılım noktaları:** `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1440. Tasarım **mobil önce** yazılır; temel hedef 375 px.
- **Konteyner:** en fazla 1440 px; yan boşluk mobil 16, tablet 24, masaüstü 32.
- **Izgara:** 12 sütun, boşluk (gutter) mobil 16 / masaüstü 24.
- **Ürün ızgarası (PLP):** 375 → 2 sütun, 768 → 3, 1280 → 4. Kartlar **eşit yükseklikte** (CSS grid + `subgrid` ile başlık/fiyat satırları hizalı).

---

## §5 Köşe, gölge, katman

| Token | Değer | Kullanım |
|---|---|---|
| `radius-sm` | 4 px | Rozet, checkbox |
| `radius-md` | 8 px | Buton, input, swatch |
| `radius-lg` | 12 px | Kart, görsel kutuları |
| `radius-xl` | 16 px | Modal, çekmece köşeleri, hero görselleri |
| `radius-full` | 9999 px | Hap (pill) butonlar, yuvarlak ikon butonları, sayaç rozeti |

| Gölge | Değer | Kullanım |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgb(31 27 22 / .06)` | Input, küçük kartlar |
| `shadow-md` | `0 4px 12px rgb(31 27 22 / .08)` | Kart hover, açılır menü |
| `shadow-lg` | `0 12px 32px rgb(31 27 22 / .12)` | Modal, çekmece, yapışkan çubuk |

**z-index ölçeği:** `base 0` · `sticky 100` · `header 200` · `dropdown 300` · `overlay 400` · `drawer 410` · `modal 500` · `toast 600` · `tooltip 700`.
Bu dışında z-index yazılmaz.

---

## §6 Hareket (motion) — "kusursuz akış" kuralları

### §6.1 Token'lar
| Token | Süre | Kullanım |
|---|---|---|
| `duration-instant` | 80 ms | Renk değişimi, basılma (active) |
| `duration-fast` | 150 ms | Hover, odak, tooltip |
| `duration-base` | 220 ms | Dropdown, akordeon, sekme geçişi, mega menü |
| `duration-slow` | 320 ms | Çekmece, modal, mini sepet |
| `duration-slower` | 480 ms | Bölüm görünüm (reveal), hero geçişi |

| Eğri | Değer | Ne zaman |
|---|---|---|
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Ekranda kalan öğenin hareketi |
| `ease-enter` | `cubic-bezier(0, 0, 0, 1)` | Ekrana giren öğe (hızlı başlar, yumuşak durur) |
| `ease-exit` | `cubic-bezier(0.3, 0, 1, 1)` | Ekrandan çıkan öğe (çıkış, girişten ~%30 kısa) |

### §6.2 Kurallar
1. **Yalnızca `transform` ve `opacity` anime edilir.** `width`, `height`, `top`, `left`, `margin`, `box-shadow` anime edilmez
   (gölge geçişi gerekiyorsa sahte öğe üzerinde opacity ile yapılır). Akordeon yüksekliği için `grid-template-rows: 0fr → 1fr` deseni.
2. Hover efektleri yalnızca `@media (hover: hover)` içinde. Dokunmatik cihazda yapışkan hover durumu oluşmamalı.
3. **Sayfa yüklemede kademeli görünüm** (stagger) en fazla 6 öğe, öğe başı 40 ms gecikme; toplam ≤ 480 ms.
   Ekranın üst kısmındaki (above the fold) içerik **asla** animasyonla gecikmez — LCP'yi bozar.
4. Scroll ile görünüm: `IntersectionObserver`, bir kez çalışır, `translateY(16px) + opacity 0 → 0/1`, `duration-slower`.
5. **`prefers-reduced-motion: reduce`:** tüm transform animasyonları kapatılır, yalnızca ≤ 150 ms opacity geçişleri kalır;
   otomatik oynayan slider durur.
6. Ürün kartı hover: görsel `scale(1.03)` (taşmayı `overflow: hidden` keser) + ikinci görsele çapraz geçiş, `duration-slow`.
7. Buton basılma: `scale(0.98)`, `duration-instant`. Sepete ekleme başarısında ikon tik'e dönüşür (≤ 600 ms), sonra mini sepet açılır.
8. Sayfa geçişleri: Next.js View Transitions destekleniyorsa ürün kartı görseli → PDP ana görseli paylaşımlı geçiş; desteklenmiyorsa animasyonsuz.
9. Animasyonlar 60 fps hedefler: Chrome DevTools Performance'da uzun görev (> 50 ms) yaratan animasyon kabul edilmez.

---

## §7 Butonlar ("tuş") — hiyerarşi, boyut, renk

### §7.1 Hiyerarşi (ekranda tek birincil kuralı)
| Varyant | Görünüm | Kullanım |
|---|---|---|
| `primary` | `--color-primary` zemin, beyaz metin | Ekrandaki **tek** ana eylem: Sepete Ekle, Ödemeye Geç, Siparişi Onayla |
| `accent` | `--color-accent` zemin, beyaz metin | Kampanya CTA'ları (hero, banner). Aynı görünümde primary ile yan yana kullanılmaz |
| `secondary` | Şeffaf zemin, 1 px `--color-text` kenarlık | İkincil eylem: Hemen Al, Alışverişe Devam Et |
| `ghost` | Zemin/kenarlık yok, hover'da `surface-muted` | Üçüncül: Filtreleri temizle, Tümünü gör |
| `link` | Altı çizili metin | Metin içi eylemler |
| `danger` | `--color-danger` metin + kenarlık | Silme, iptal (onay modalı ile) |
| `icon` | Yuvarlak, ikon + zorunlu `aria-label` | Favori, paylaş, kapat, karusel okları |

### §7.2 Boyutlar
| Boyut | Yükseklik | Yatay iç boşluk | Font | Kullanım |
|---|---|---|---|---|
| `sm` | 36 px | 12 px | 14 / 500 | Yalnızca masaüstü yoğun alanlar (admin tabloları). Dokunma alanı görünmez dolgu ile 44'e tamamlanır |
| `md` | 44 px | 20 px | 16 / 500 | Varsayılan |
| `lg` | 52 px | 24 px | 16 / 600 | Form gönderimi, sepet, ödeme |
| `xl` | 56 px | 32 px | 18 / 600 | PDP "Sepete Ekle", mobil yapışkan CTA |
| `icon-md` / `icon-lg` | 44 / 52 px kare | — | İkon 20 / 24 px | |

### §7.3 Durumlar (her buton için zorunlu, `/dev/ui` sayfasında hepsi görünür)
`default` · `hover` (renk koyulaşır, `duration-fast`) · `active` (`scale(.98)`) · `focus-visible` (2 px `--color-focus` halka, 2 px offset — **asla** `outline: none` tek başına) ·
`disabled` (`opacity .45`, `cursor: not-allowed`, `aria-disabled`; tıklanınca neden pasif olduğunu açıklayan tooltip) ·
`loading` (metin yerinde spinner, **buton genişliği sabit kalır**, `aria-busy="true"`, tekrar tıklama engellenir).

### §7.4 Buton kombinasyonları
- Yan yana iki buton: sağda/ilk sırada birincil (mobilde üstte, tam genişlik). Aralarında 12 px.
- PDP: `[Sepete Ekle — xl primary, esnek genişlik] [♡ — icon-lg secondary]`; altında `Hemen Al` secondary lg tam genişlik.
- Onay modalı: `[Vazgeç — secondary] [Sil — danger]`; tehlikeli eylem asla varsayılan odakta değildir.
- Etiketler fiil ile başlar ve sonucu söyler ("Sepete Ekle", "Adresi Kaydet"); "Tamam", "Gönder" gibi genel etiket kullanılmaz.

---

## §8 Form elemanları
- Input/select yüksekliği 48 px, 16 px font (mobil zoom önler), etiket her zaman görünür (placeholder etiket yerine geçmez).
- Hata: input altında ikon + metin, `aria-describedby` ile bağlı, kenarlık `--color-danger`. Hata, alan terk edilince (blur) veya gönderimde gösterilir; yazarken değil.
- Zorunlu alanlar `*` + "zorunlu" ekran okuyucu metni. Opsiyonel alanlar "(isteğe bağlı)" ile işaretlenir.
- Doğru `autocomplete` ve `inputmode` değerleri (ör. telefon `tel`, posta kodu `numeric`).
- Telefon maskesi: `0 (5XX) XXX XX XX`; kayıt E.164.
- Checkbox/radio dokunma alanı ≥ 44 px (etiket dahil tıklanabilir).
- Adet stepper: `[–] 1 [+]`, butonlar 44 px, ortadaki input elle yazılabilir, sınır dışı değer otomatik düzeltilir ve kısa bir uyarı gösterilir.

---

## §9 Bileşen kataloğu (`packages/ui`) ve davranışları

Her bileşen `/dev/ui` showcase sayfasında tüm varyant ve durumlarıyla gösterilir (yalnızca geliştirme ortamında erişilebilir).

| Bileşen | Kritik davranış |
|---|---|
| `AnnouncementBar` | Döngüsel mesajlar (6 sn), duraklat butonu, kapatılabilir (tercih 7 gün saklanır), yükseklik sabit (CLS yok) |
| `Header` | Masaüstü: yapışkan; aşağı kaydırınca 72 → 60 px küçülür (transform ile). Mobil: aşağı kaydırınca gizlenir, yukarıda görünür |
| `MegaMenu` | Hover niyeti gecikmesi 120 ms açılış / 200 ms kapanış (yanlışlıkla açılmayı önler), klavye: ↓ ile açılır, Esc ile kapanır, odak tetikleyiciye döner. Kategori görseli + alt kategoriler + "Tümünü gör" |
| `MobileNav` | Soldan çekmece, iç içe kategoriler için kayan paneller (geri butonu), odak tuzağı |
| `SearchBox` | 250 ms debounce, en az 2 karakter, öneriler: ürünler (görselli) + kategoriler + son aramalar; klavye ↑↓ Enter; sonuç yoksa öneri; `/` kısayolu |
| `MiniCartDrawer` | Sağdan, `duration-slow`; ürün listesi, adet değiştirme, ücretsiz teslimata kalan tutar çubuğu, ara toplam, "Sepete Git" + "Ödemeye Geç" |
| `ProductCard` | Görsel 4:3, hover'da ikinci görsel, rozetler (Yeni, %İndirim, Takım), favori butonu (sağ üst), ad (2 satır kırpma), fiyat bloğu, renk swatch'ları (en fazla 5 + "+N"). Tüm kart tek link, iç butonlar ayrı odaklanabilir |
| `Price` | Eski fiyat (üstü çizili, muted), indirimli fiyat (accent), indirim yüzdesi rozeti; ekran okuyucu için "İndirimli fiyat: X TL, önceki fiyat: Y TL". Yasal not desteği (§ REFERENCE) |
| `InstallmentInfo` | "Peşin fiyatına X taksit" satırı + tıklanınca bankalara göre taksit tablosu modalı |
| `Gallery` | Bkz. REFERENCE §3.2 |
| `SetItemCard` | Bkz. REFERENCE §3.4 — takım içeriği kutucukları |
| `Swatch` | Renk dairesi 32 px görsel / 44 px dokunma alanı, seçili halkası, adı tooltip + seçimden sonra metin olarak görünür; tükenmiş varyant çapraz çizgili |
| `QuantityStepper` | §8 |
| `Tabs` / `Accordion` | Masaüstü sekme, mobil akordeon (aynı içerik); URL hash ile derin link (`#olculer`) |
| `Dialog` / `Drawer` | Radix; odak tuzağı, Esc, dış tıklama, arka plan kaydırma kilidi (scrollbar genişliği telafili — kayma olmaz) |
| `Toast` | Sağ alt (mobil alt orta), 5 sn, üzerine gelince durur, eylem butonu desteği ("Geri al"), `aria-live="polite"` |
| `Skeleton` | Gerçek içerikle aynı boyutlarda; yumuşak nabız animasyonu (reduced-motion'da statik) |
| `Carousel` | Embla; sürükle/kaydır, oklar (masaüstü hover'da görünür, klavye ile her zaman erişilebilir), noktalar, `scroll-snap`; otomatik oynatmada duraklat butonu zorunlu |
| `Breadcrumb` | Mobilde yalnızca son iki seviye + "…"; JSON-LD BreadcrumbList |
| `Rating` | Yıldız + ortalama + yorum sayısı; yarım yıldız desteği; tıklanınca yorumlar sekmesine kaydırır |
| `Badge` | `new`, `sale`, `set`, `lowStock`, `madeToOrder` varyantları |
| `DeliveryEstimate` | "Tahmini teslimat: 12–19 Kasım" (iş günü hesabı API'den), "Kurulum dahil" ikonu |
| `EmptyState` | İllüstrasyon/ikon + başlık + açıklama + eylem butonu |
| `WhatsAppButton` | Sağ alt yüzen buton, toast ve yapışkan CTA ile çakışmaz (konumu dinamik) |

---

## §10 Erişilebilirlik kuralları (WCAG 2.2 AA)
- Tüm etkileşimler klavyeyle yapılabilir; mantıklı odak sırası; "İçeriğe atla" linki her sayfada ilk odak.
- Odak halkası her zaman görünür, odaklanan öğe yapışkan header/çubuk altında kalmaz (`scroll-padding-top`).
- Görsellerde anlamlı `alt` (ürün adı + renk + açı); dekoratif görsellerde `alt=""`.
- Dinamik değişiklikler (sepete eklendi, fiyat güncellendi, filtre sonucu sayısı) `aria-live` ile duyurulur.
- Hareket eden içerik (slider, duyuru) duraklatılabilir.
- Renk tek başına bilgi taşımaz. Dokunma hedefi ≥ 44 px (WCAG asgarisi 24, biz 44 kullanırız).
- Form hataları metinle açıklanır ve ilk hatalı alana odak taşınır.
- Sayfa başlıkları benzersiz: `Ürün Adı | Kategori | [MARKA_ADI]`. Başlık hiyerarşisi atlanmaz (h1 → h2 → h3).
- `lang="tr"` — büyük/küçük harf dönüşümünde `toLocaleUpperCase('tr-TR')` (İ/ı sorunu).

---

## §11 Görseller ve ikonlar
- **İkon seti:** Lucide (tek set, 1.5 px çizgi). Boyutlar 16 / 20 / 24. Başka set karıştırılmaz.
- **Ürün görseli standardı:** Yönetim panelinde yüklenen her ürün görseli için iki tür vardır:
  - `packshot` (dekupe / düz zemin): 4:3 tuvale **ortalanmış, kenarlarda %8 boşluk** ile normalize edilir; zemin `--color-surface-muted`.
    Böylece takım içeriği kutucuklarında ve ürün kartlarında tüm ürünler **aynı görsel ölçekte** görünür.
  - `lifestyle` (ortam fotoğrafı): kırpma `object-cover`, odak noktası (focal point) panelde seçilir.
- Formatlar AVIF/WebP (Next/Image), `sizes` özniteliği her zaman doğru yazılır; LCP görseli `priority`.
- Yükleme sınırları: en fazla 10 MB, en az 1600 px uzun kenar; MIME doğrulaması sunucuda içerikten yapılır.
- Görsel yüklenirken `blurDataURL` (API tarafında üretilen küçük yer tutucu) gösterilir.

---

## §12 Görsel kontrol listesi (CLAUDE.md §4.2'de kullanılır)

Her ekran görüntüsü için (375 / 768 / 1280 / 1440):
1. **Hizalama:** Kenarlar ızgaraya oturuyor mu? Aynı satırdaki kartların görsel, başlık, fiyat, buton satırları hizalı mı?
2. **Eşit boyut:** Aynı türden kartlar (ürün kartı, takım içeriği kutucuğu, kategori kartı) aynı genişlik ve yükseklikte mi?
3. **Boşluk ritmi:** Yalnızca §4 ölçeğindeki boşluklar mı var? Bölüm aralıkları tutarlı mı?
4. **Tipografi:** Ölçek dışı boyut var mı? Satır taşması, beklenmedik kırpılma, dul kelime var mı? Türkçe karakterler doğru mu?
5. **Hiyerarşi:** Göz önce birincil eyleme mi gidiyor? Ekranda birden fazla birincil buton var mı?
6. **Taşma:** Yatay kaydırma çubuğu, kesilmiş metin, üst üste binen öğe var mı? (özellikle 375 px)
7. **Durumlar:** Hover, odak, açık menü, boş durum, yükleniyor iskeleti, hata durumu görüntüleri kontrol edildi mi?
8. **Görseller:** Bozuk görsel, yanlış en-boy oranı, bulanık/pikselli görsel, farklı ölçekte packshot var mı?
9. **Yapışkan öğeler:** Header, yapışkan CTA, WhatsApp butonu, toast birbirini veya içeriği örtüyor mu?
10. **Referansla kıyas:** (varsa `docs/reference/`) Bilgi hiyerarşisi ve bölüm sırası eşleşiyor mu? Bilinçli iyileştirmeler `REFERENCE.md`'deki ile tutarlı mı?

Sonuç `docs/PROGRESS.md`'ye şu formatta yazılır: `Görsel kontrol [rota] — 10/10 ✔` veya bulunan sorunların listesi ve düzeltme notları.
