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
