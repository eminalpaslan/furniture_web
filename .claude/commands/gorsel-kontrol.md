---
description: Bir rotanın ekran görüntülerini alır, tasarım kontrol listesine göre değerlendirir ve sorunları düzeltir
argument-hint: <rota> (ör. /urun/ada-orta-sehpa-takimi)
---

Rota: $ARGUMENTS

`CLAUDE.md §4.2` görsel öz-kontrolünü uygula:

1. Uygulama çalışmıyorsa başlat. `pnpm ui:snap $ARGUMENTS --states hover,focus,menu` çalıştır.
2. `.artifacts/screens/` altında üretilen **her** görüntüyü Read aracıyla aç ve incele (375, 768, 1280, 1440).
3. Araç raporundaki yatay taşma ve konsol hatası uyarılarını kontrol et.
4. `docs/DESIGN_SYSTEM.md §12` listesindeki 10 maddeyi her genişlik için değerlendir. Somut ol:
   "1280'de 3. kartın fiyat satırı diğerlerinden 8 px aşağıda" gibi.
5. `docs/reference/` altında bu sayfaya karşılık gelen görsel varsa yan yana kıyasla; bölüm sırası ve bilgi hiyerarşisi farklarını listele.
6. Sayfa `docs/REFERENCE.md`'de şartnameye sahipse şartnamedeki her maddeyi görüntüde işaretle (var / yok / farklı).
7. Bulunan her sorunu düzelt, 1. adımdan tekrarla. Sorun kalmayınca sonucu `docs/PROGRESS.md`'ye yaz:
   `Görsel kontrol [rota] — 10/10 ✔` (veya kalan bilinçli farklar ve gerekçeleri).
