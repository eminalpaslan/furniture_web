# Referans Analizi ve Sayfa Şartnameleri

> Referans site: **mondihome.com.tr** — ana sayfa ve takım ürün sayfası (ör. "Lizbon Orta Sehpa Takımı").
> Hedef: Referansın **bilgi mimarisini ve özellik setini** almak, ancak tasarım sistemimizle (`DESIGN_SYSTEM.md`)
> daha temiz, daha tutarlı ve daha erişilebilir uygulamak. Logo, fotoğraf, metin, marka öğesi **kopyalanmaz**.

## §0 Referans ekran görüntüleri
- Kullanıcı, referans sayfaların ekran görüntülerini `docs/reference/` klasörüne koyabilir
  (önerilen adlar: `ana-sayfa-masaustu.png`, `ana-sayfa-mobil.png`, `urun-masaustu.png`, `urun-mobil.png`, `urun-takim-icerigi.png`).
- Görüntüler varsa: ilgili UI görevine başlamadan önce **Read ile açılıp incelenir**, bu belgedeki şartnameyle
  çelişen yapısal bir fark görülürse bu belge güncellenir ve `DECISIONS.md`'ye not düşülür.
- Görüntü yoksa: bu belgedeki şartname tek kaynaktır.
- Referans siteye otomatik erişim (scraping) yapılmaz.

---

## §1 Genel iskelet (tüm vitrin sayfaları)

```
┌ AnnouncementBar ─ "Tüm siparişlerde ücretsiz teslimat ve kurulum" ⟲ döngüsel ─────────── [×] ┐
├ Header: [☰ mobil] [LOGO]   [🔍 Ürün, kategori veya koleksiyon ara…]   [👤 Hesabım] [♡ 3] [🛒 2] ┤
├ MegaMenu (masaüstü): Oturma Grupları · Yatak Odası · Yemek Odası · Genç & Çocuk · Yatak & Baza · …┤
├──────────────────────────────── Sayfa içeriği ──────────────────────────────────────────────┤
├ Avantaj şeridi (4 ikon): Ücretsiz Teslimat & Kurulum · 12 Taksit · 14 Gün Cayma Hakkı · 2 Yıl Garanti ┤
├ Bülten (İYS onaylı izin kutusu)                                                              ┤
├ Footer: Kurumsal · Müşteri Hizmetleri · Kategoriler · Yasal · İletişim | sosyal | ödeme logoları ┤
└ WhatsApp yüzen buton                                                                         ┘
```

### §1.1 Kategori ağacı (seed verisi ve mega menü için varsayılan)
| Ana kategori | Alt kategoriler |
|---|---|
| Oturma Grupları | Koltuk Takımları, Köşe Takımları, Kanepeler, Tekli Koltuk & Berjer, Çekyatlar |
| Yatak Odası | Yatak Odası Takımları, Gardıroplar, Karyolalar, Komodinler, Şifonyerler, Makyaj Masaları |
| Yemek Odası | Yemek Odası Takımları, Yemek Masaları, Sandalyeler, Konsollar, Vitrinler |
| Genç & Çocuk Odası | Genç Odası Takımları, Bebek Odası, Çalışma Masaları, Ranzalar |
| Yatak & Baza | Yataklar, Bazalar, Başlıklar, Yastıklar |
| Salon & Sehpa | TV Üniteleri, Orta Sehpalar, Zigon Sehpalar, Yan Sehpalar, Kitaplıklar |
| Hol & Antre | Portmantolar, Ayakkabılıklar, Dresuarlar |
| Ev Aksesuarları | Halılar, Aydınlatma, Dekoratif Ürünler, Ev Tekstili |
| Çeyiz Setleri | Paket ürünler (ör. Yatak Odası + Oturma Grubu + Yemek Odası) |
| Kampanyalar | Dinamik — yönetim panelinden |

Kategori ağacı yönetim panelinden düzenlenebilir; seed yalnızca başlangıç verisidir.

---

## §2 Ana sayfa

Bölümler (sıra yönetim panelinden değiştirilebilir — CMS "bölüm blokları"; varsayılan sıra):

| # | Bölüm | Şartname |
|---|---|---|
| 1 | **Hero slider** | Tam genişlik, masaüstü 16:7, mobil 4:5 (ayrı görsel yüklenir). Başlık (Fraunces), alt metin, `accent` CTA. Otomatik 6 sn, üzerine gelince/odakta durur, duraklat butonu, kaydırma, noktalar + oklar. İlk slayt görseli LCP → `priority`, diğerleri lazy. Slayt geçişi çapraz solma (`duration-slower`), metin 80 ms gecikmeyle yukarı kayarak gelir |
| 2 | **Kategori vitrini** | 6–8 kategori; masaüstü tek satır yuvarlak/kare görsel + ad, mobilde yatay kaydırma (snap). Hover'da görsel `scale(1.05)` |
| 3 | **Kampanya bannerları** | 2'li (masaüstü yan yana, mobilde alt alta), 3:2 oran, tüm alan tıklanabilir, hover'da hafif yakınlaşma |
| 4 | **Ürün vitrini — sekmeli** | "Yeni Gelenler / Çok Satanlar / İndirimdekiler" sekmeleri; Carousel içinde ProductCard; sekme değişiminde içerik çapraz solma, yükseklik sabit (CLS yok) |
| 5 | **Koleksiyon / oda ilhamı** | Büyük ortam fotoğrafı üzerinde **tıklanabilir noktalar (hotspot)**: tıklanınca ürün mini kartı açılır (ad, fiyat, "İncele"). Klavye ile noktalar arası Tab ile gezilir |
| 6 | **Takım/Set öne çıkanlar** | "Lizbon Koleksiyonu" gibi: koleksiyon görseli + koleksiyondaki takımların listesi |
| 7 | **Avantaj şeridi** | 4 ikonlu kutu; metinler yönetim panelinden |
| 8 | **Mağazalarımız** (opsiyonel, F9) | Harita yerine il seçimi + liste; harita dinamik yüklenir |
| 9 | **İlham / Blog** | 3 yazı kartı |
| 10 | **Bülten** | E-posta + açık rıza checkbox'ı (İYS + KVKK metni linkli) |

Ana sayfa bölümleri sunucuda render edilir; ürün vitrinleri etiket bazlı önbellekle (`revalidateTag('home')`).

---

## §3 Ürün detay sayfası (PDP) — takım ürünleri dahil

### §3.1 Düzen
```
Breadcrumb: Ana Sayfa › Salon & Sehpa › Orta Sehpalar › Lizbon Orta Sehpa Takımı

┌──────────────── Galeri (7/12) ────────────────┐ ┌──────── Bilgi sütunu (5/12, yapışkan) ────────┐
│ [thumb]  ┌───────────────────────────────┐    │ │ Rozetler: [Takım] [%15]                         │
│ [thumb]  │                               │    │ │ H1 Lizbon Orta Sehpa Takımı                     │
│ [thumb]  │        Ana görsel 4:3         │    │ │ ★★★★☆ 4,6 (128 değerlendirme) · Ürün kodu        │
│ [thumb]  │   (hover-zoom / tıkla-büyüt)  │    │ │ Fiyat bloğu (§3.3)                              │
│ [▶ video]└───────────────────────────────┘    │ │ Taksit satırı → modal                           │
│                                               │ │ Renk: Ceviz  (swatch'lar)                       │
│                                               │ │ Adet [– 1 +]                                    │
│                                               │ │ [ Sepete Ekle (xl) ] [♡]                         │
│                                               │ │ [ Hemen Al ]                                    │
│                                               │ │ 🚚 Tahmini teslimat · 🔧 Kurulum dahil · ↺ 14 gün │
│                                               │ │ Paylaş · Ölçü rehberi                           │
└───────────────────────────────────────────────┘ └────────────────────────────────────────────────┘

══ Takım İçeriği (§3.4) — tam genişlik ══════════════════════════════════════════════════════════
══ Sekmeler / Akordeon (§3.5): Açıklama · Ölçüler & Teknik · Teslimat & Kurulum · İade & Garanti · Yorumlar · Soru-Cevap
══ Koleksiyonu Tamamla (aynı koleksiyonun diğer takımları) — Carousel
══ Benzer Ürünler — Carousel
══ Son Gezdikleriniz — Carousel
```
Mobilde: galeri (tam genişlik, kaydırmalı) → bilgi sütunu → takım içeriği → akordeonlar → öneriler.

### §3.2 Galeri
- Masaüstü: solda dikey thumbnail şeridi (64 px, en fazla 6 görünür + kaydırma), ana görsel 4:3.
- Hover-zoom (masaüstü, yalnızca `hover: hover`): imleç konumuna göre 2× büyütülmüş görsel aynı çerçevede (lens değil, çerçeve içi pan).
- Tıklayınca tam ekran lightbox: kaydırma, sıkıştırarak yakınlaştırma (pinch), ← → klavye, Esc, sayaç "3 / 9". Dinamik import.
- Mobil: yatay kaydırma + nokta göstergesi + sayaç; çift dokunma yakınlaştırır.
- Varyant (renk) değişince galeri o rengin görsellerine çapraz solmayla geçer; URL `?renk=ceviz` güncellenir (paylaşılabilir).
- Video ve (opsiyonel) 360° görünüm thumbnail'de ikonla belirtilir.

### §3.3 Fiyat bloğu ve yasal gösterim
- İndirim yoksa: tek fiyat, `text-3xl` / 600.
- İndirim varsa: `Önceki fiyat` (üstü çizili, muted) + `İndirimli fiyat` (accent) + `%X` rozeti.
- **Yasal:** İndirimli satış gösteriminde indirim öncesi fiyat olarak mevzuatın öngördüğü değer kullanılır
  (Fiyat Etiketi Yönetmeliği — indirimden önceki son 30 gün içindeki en düşük fiyat). Bu yüzden API, `PriceHistory`
  tablosundan "son 30 günün en düşük fiyatı"nı hesaplar ve ön yüze `compareAtPrice` olarak verir; ön yüz bu değeri hesaplamaz.
  Uygulamadan önce mevzuatın güncel hâli resmi kaynaktan doğrulanır ve `DECISIONS.md`'ye yazılır.
- Fiyatların KDV dahil olduğu belirtilir. Takım ürünlerinde fiyat **seçili parçaların toplamı**dır ve canlı güncellenir (§3.4).
- Taksit satırı: "Peşin fiyatına 6 taksit · 12 aya varan taksit seçenekleri" → modal: banka/kart ailesi bazında taksit tablosu
  (ödeme sağlayıcısından alınır, önbelleklenir).

### §3.4 Takım İçeriği kutucukları — **referanstaki zayıf noktanın iyileştirilmiş hâli**

Referansta takımı oluşturan parçalar alttaki kutucuklarda listeleniyor, ancak kutucuk boyutları ve parçaların
ölçü bilgisi tutarsız/zayıf. Bizim uygulamamız:

**Yerleşim**
- Başlık: `Takım İçeriği` + alt metin "Takımı dilediğiniz gibi oluşturun — parçaları ekleyip çıkarabilirsiniz."
- Izgara: 1280+ → **4 sütun**, 1024 → 3, 768 → 2; 375 → **yatay kaydırmalı satır**, kart genişliği ekranın %78'i
  (bir sonraki kartın kenarı görünür → kaydırılabilir olduğu anlaşılır), `scroll-snap-align: start`.
- **Tüm kartlar aynı genişlik ve aynı yükseklikte.** CSS grid + `grid-template-rows: subgrid` ile görsel, ad, ölçü, fiyat,
  kontrol satırları kartlar arasında **yatay olarak hizalanır** (bir kartın adı 2 satır, diğerininki 1 satır olsa bile fiyatlar aynı hizada).

**Kart anatomisi (`SetItemCard`)**
```
┌──────────────────────────────┐
│ [✓ Takıma dahil]        [ⓘ] │  ← seçim checkbox'ı (tüm kart üst şeridi), ⓘ = ürün detayını modalda aç
│ ┌──────────────────────────┐ │
│ │   4:3 packshot görsel    │ │  ← normalize edilmiş, aynı ölçekte (DESIGN_SYSTEM §11)
│ │   zemin surface-muted    │ │
│ └──────────────────────────┘ │
│ Lizbon Orta Sehpa            │  ← text-base/600, en fazla 2 satır
│ ↔ 110  ⤢ 60  ↕ 42 cm         │  ← G × D × Y, ikonlu, tabular-nums; "Ölçü çizimi" bağlantısı
│ Adet: 1 (takımda)            │
│ 8.490,00 TL  ~~9.990,00 TL~~  │  ← birim fiyat
│ [– 1 +]                      │  ← adet stepper (0 = takımdan çıkarıldı)
└──────────────────────────────┘
```
- Ölçü satırı varsayılan görünür (referanstaki eksik). "Ölçü çizimi" tıklanınca küçük bir popover'da teknik çizim (ölçü oklarıyla) gösterilir.
- Dahil olmayan (adet 0) kart: görsel %50 opaklık, checkbox boş, "Eklemek için seçin" metni. Kart düzeni **değişmez** (zıplama yok).
- Takımın zorunlu parçası varsa (ör. masa olmadan sandalye satılmıyorsa) checkbox kilitli + açıklama tooltip'i.
- Stokta olmayan parça: "Tükendi" rozeti + "Gelince haber ver" linki; checkbox pasif.

**Toplam özet**
- Kutucukların altında (mobilde yapışkan alt çubukta) canlı özet: `4 parça · Toplam 24.960,00 TL · [Seçilenleri Sepete Ekle]`.
- Toplam değişince sayı yumuşak geçişle güncellenir (sayaç animasyonu ≤ 300 ms; reduced-motion'da anında) ve `aria-live` ile duyurulur.
- Fiyat hesabı **API'de** yapılır (`POST /catalog/sets/:id/quote`) — takım indirimi kuralları sunucudadır; ön yüz iyimser gösterim yapıp API sonucuyla düzeltir.
- Sepete ekleme tek istekle yapılır; sepette takım parçaları **gruplanmış** görünür, gruptan parça çıkarılabilir.

### §3.5 Sekmeler (masaüstü) / akordeon (mobil)
1. **Ürün Açıklaması** — zengin metin (CMS'ten, sanitize edilmiş HTML).
2. **Ölçüler & Teknik Özellikler** — her parça için tablo: G×D×Y, ağırlık, malzeme (gövde, kapak, ayak), renk, paket sayısı, desi, montaj gerekliliği. Teknik çizim görseli.
3. **Teslimat & Kurulum** — teslimat bölgesi kontrolü (il/ilçe seç → tahmini süre ve ücret), kurulum bilgisi.
4. **İade & Garanti** — cayma hakkı, garanti süresi, iade süreci adımları.
5. **Değerlendirmeler** — puan dağılımı çubukları, fotoğraflı yorumlar, "yalnızca satın alanlar yorum yapabilir" rozeti, sıralama/filtre, sayfalama.
6. **Soru-Cevap** — onaylı sorular ve satıcı cevapları; giriş yapan kullanıcı soru sorabilir.

### §3.6 Yapışkan satın alma çubuğu
- Bilgi sütunundaki "Sepete Ekle" ekrandan çıkınca belirir (IntersectionObserver).
- Masaüstü: üstte ince çubuk (küçük görsel, ad, fiyat, CTA). Mobil: altta (fiyat + CTA), güvenli alan (`env(safe-area-inset-bottom)`) dikkate alınır.
- WhatsApp butonu çubuk görünürken yukarı kayar.

### §3.7 SEO
- JSON-LD: `Product` (+ `ProductGroup` varyantlar için), `Offer` (fiyat, stok, `priceValidUntil`), `AggregateRating`, `BreadcrumbList`.
- Canonical: varyant parametresiz URL. `og:image` ürünün ilk görseli.

---

## §4 Kategori / ürün listeleme sayfası (PLP)
- Üstte kategori başlığı + kısa açıklama (katlanabilir) + alt kategori çipleri.
- Sol filtre paneli (masaüstü) / alttan açılan filtre çekmecesi (mobil, "X ürünü göster" butonlu):
  fiyat aralığı (çift kaydırıcı + input), renk, malzeme, ölçü aralığı (genişlik), stil, koleksiyon, kampanya, stok durumu.
- Seçili filtreler üstte çip, tek tıkla kaldırma, "Tümünü temizle".
- Sıralama: Önerilen, En yeni, Fiyat artan/azalan, En çok satan, En yüksek puan.
- **Tüm filtre ve sıralama URL'de** (paylaşılabilir, geri tuşu çalışır). Filtre değişiminde sayfa kaydırması korunur, sonuç sayısı `aria-live`.
- Sayfalama: "Daha fazla ürün göster" butonu + sayfa numaralı URL (SEO için `?sayfa=2` gerçek sayfa). Sonsuz kaydırma kullanılmaz (footer'a erişim engellenmesin).
- Arama sonuç sayfası aynı bileşeni kullanır (Meilisearch).

## §5 Sepet
- Sepet satırları; takım parçaları grup başlığı altında. Adet değişimi iyimser günceller, API hatasında geri alır ve toast gösterir.
- Kupon alanı (katlanabilir), ücretsiz teslimata kalan tutar çubuğu, sipariş özeti (ara toplam, indirim, teslimat, KDV dahil toplam).
- Stok/fiyat değişmişse satır üstünde uyarı ("Fiyat güncellendi: …").
- Boş sepet: EmptyState + çok satanlar.

## §6 Ödeme (checkout) — tek sayfa, adımlı akordeon
1. **İletişim** (misafir veya giriş) → 2. **Teslimat adresi** (il → ilçe → mahalle; kayıtlı adresler) → 3. **Teslimat seçeneği**
(standart teslimat + kurulum, uygunsa randevu tarihi seçimi) → 4. **Fatura** (bireysel/kurumsal: TCKN veya vergi no/daire) → 5. **Ödeme** (iyzico form).
- Sağda (mobilde katlanabilir üstte) sipariş özeti.
- Ödeme öncesi zorunlu onaylar: Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi (sipariş bilgileriyle doldurulmuş, modalda okunabilir).
- Sipariş onay sayfası: sipariş no, özet, sonraki adımlar zaman çizelgesi, e-posta/SMS bilgilendirmesi.

## §7 Hesabım
Siparişlerim (durum zaman çizelgesi, fatura indirme, iade talebi), Adreslerim, Favorilerim, Değerlendirmelerim,
Hesap bilgileri, Şifre, İletişim izinleri, KVKK talepleri (verimi indir / hesabımı sil).

## §8 Bizi rakipten ayıracak bilinçli iyileştirmeler
Mobilya sektöründe kamuya açık müşteri şikâyetlerinin önemli bir bölümü **teslimat gecikmesi ve belirsizliği** üzerine.
Bu yüzden şunlar ilk sürümden itibaren vardır:
1. **Dürüst teslimat süresi:** Her ürün için `stokta` / `siparişe üretim (X–Y iş günü)` bilgisi PDP, sepet ve ödemede tutarlı görünür.
2. **Sipariş zaman çizelgesi:** `Sipariş alındı → Üretimde → Depoda → Teslimata çıktı → Kurulum yapıldı`, her adımda tarih ve bildirim.
3. **Tahmini tarih değişirse proaktif bildirim** (e-posta/SMS) ve hesabımda görünür gerekçe.
4. **Takım içeriği kutucuklarında net ölçüler** (§3.4) — yanlış ölçü kaynaklı iadeleri azaltır.
