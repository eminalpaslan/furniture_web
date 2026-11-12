# Başlarken (senin için kısa kılavuz)

Bu klasör, Claude Code'un mobilya e-ticaret sitesini **kendi kendini kontrol ederek** adım adım inşa etmesi için hazırlandı.
Kodun tamamını Claude yazar; senin işin birkaç bilgi vermek ve arada ilerlemeye göz atmak.

## Kurulum
1. Bu klasörü VS Code'da aç (klasörün adını istediğin gibi değiştirebilirsin).
2. Bilgisayarında **Node.js (LTS)**, **pnpm**, **Docker Desktop** ve **Git** kurulu olsun.
3. VS Code'da Claude Code'u aç.

## İlk komut
Claude Code'a şunu yaz:

```
CLAUDE.md dosyasını baştan sona oku, sonra /siradaki komutunu çalıştır.
```

Her yeni oturumda yalnızca `/siradaki` yazman yeterli. Claude kaldığı yeri `docs/PROGRESS.md`'den bulur,
sıradaki görevi yapar, test eder, ekran görüntülerini kendisi inceler ve kaydeder.
Birden fazla görevi arka arkaya yapmasını istersen: `/siradaki F0 fazının tamamını bitir`.

## Ne zaman karışman gerekir?
- Claude sana **tek bir mesajda** soru listesi getirdiğinde (marka adı, ödeme anahtarları, şirket bilgileri gibi).
  Neler isteneceğini önceden görmek için: `docs/PROGRESS.md` → "Kullanıcıdan beklenenler".
- Canlıya çıkmadan önce son onay (F12).

## İsteğe bağlı ama çok faydalı
- Referans sitenin ekran görüntülerini `docs/reference/` klasörüne koy (adlandırma orada yazıyor).
  Claude tasarımı bu görüntülerle kıyaslayarak yapar.

## İlerlemeyi nasıl takip ederim?
| Dosya | Ne gösterir |
|---|---|
| `ROADMAP.md` | Tüm görevler; `[x]` olanlar bitti |
| `docs/PROGRESS.md` | Günlük: ne yapıldı, hangi testler geçti, ölçümler, engeller |
| `docs/DECISIONS.md` | Claude'un aldığı teknik kararlar ve gerekçeleri |
| `docs/OGRENME.md` | **Öğrenme rehberin:** hangi dosya ne işe yarar, hangi araç neden/nasıl kullanıldı — her görevde güncellenir |

## Dosya haritası
| Dosya | Görevi |
|---|---|
| `CLAUDE.md` | Claude'un kuralları: çalışma protokolü, doğrulama kapıları, yasaklar |
| `ROADMAP.md` | 13 fazlık yol haritası, her görevin kabul kriterleri |
| `docs/DESIGN_SYSTEM.md` | Renkler, yazı tipleri, butonlar, animasyonlar, erişilebilirlik kuralları |
| `docs/REFERENCE.md` | Ana sayfa, ürün sayfası (takım içeriği kutucukları dahil) ve diğer sayfaların şartnamesi |
| `docs/ARCHITECTURE.md` | Backend mimarisi, veri modeli, ödeme/sipariş/stok akışları, güvenlik |
| `.claude/commands/` | `/siradaki`, `/dogrula`, `/gorsel-kontrol`, `/faz-denetimi` komutları |
