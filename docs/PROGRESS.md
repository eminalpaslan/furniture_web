# İlerleme Kaydı

> Claude'un hafızası bu dosyadır. Her oturumun başında okunur, her görevin sonunda güncellenir.
> Bağlam sıkıştırılsa bile buradan kalınan yere dönülebilmelidir.

## Mevcut durum
- **Faz:** F0 — devam ediyor
- **Son tamamlanan görev:** F0.2
- **`pnpm verify` son durumu:** ✔ 2026-11-12 (typecheck + lint: config paketi ve kök; test/build henüz yok)
- **Ortam notu:** Sistem Node'u 22.18.0; proje Node 26.13.1'i pnpm `devEngines` ile kullanıyor (ADR-005).
  Sandbox `.git/` klasörüne yazmayı engelliyor → git yazma komutları sandbox dışında çalıştırılır.

## Aktif görev
> Görev başlarken doldurulur, bitince temizlenir.

- **ID / başlık:** —
- **Plan:**
  1. —
- **Notlar / riskler:** —

## Engeller
> 3 deneme kuralına takılan işler (CLAUDE.md §1-12). Format: tarih · görev · denenenler · hata özeti · hipotez · durum.

_(yok)_

## Kullanıcıdan beklenenler
> Bu bilgiler gelene kadar yer tutucuyla ilerlenir. Soru sorulacaksa hepsi **tek mesajda** sorulur (CLAUDE.md §8).

| # | Bilgi | Gerektiği görev | Varsayılan / yer tutucu | Durum |
|---|---|---|---|---|
| 1 | Marka adı ve logo (SVG) | F4.2 | `[MARKA_ADI]`, metin logo | bekleniyor |
| 2 | Marka renkleri (varsa) | F1.1 | `DESIGN_SYSTEM §2` paleti | opsiyonel |
| 3 | Referans ekran görüntüleri (`docs/reference/`) | F4.2–F4.8 | `REFERENCE.md` şartnamesi | opsiyonel |
| 4 | iyzico sandbox API anahtarları | F6.4 | `FakePaymentProvider` | bekleniyor |
| 5 | iyzico canlı anahtarları | F12.4 | — | sonra |
| 6 | Şirket bilgileri (unvan, adres, vergi no, MERSİS, KEP, telefon) | F6.5, F9.2 | yer tutucu | bekleniyor |
| 7 | Yasal metinlerin hukukçu onayı | F12.4 | "HUKUKİ ONAY BEKLİYOR" | sonra |
| 8 | Teslimat politikası (bölgeler, ücretler, kurulum, süreler) | F3.6 | tüm Türkiye, ücretsiz teslimat + kurulum, 7 iş günü | bekleniyor |
| 9 | E-posta / SMS / e-Arşiv sağlayıcı tercihleri ve hesapları | F11.4 | Mailpit + fake sağlayıcılar | sonra |
| 10 | Alan adı ve barındırma tercihi (KVKK) | F12.1 | — | sonra |
| 11 | WhatsApp destek numarası, sosyal medya hesapları | F4.2 | yer tutucu | bekleniyor |
| 12 | Gerçek ürün verisi ve fotoğrafları | F12.3 | seed verisi | sonra |

## Ölçümler
> Lighthouse, paket boyutu, yük testi sonuçları. Format: tarih · sayfa/senaryo · değerler.

_(yok)_

## Günlük
> En yeni en üstte. Format:
> `### YYYY-MM-DD · F0.1 Monorepo iskeleti — ✔`
> - Yapılanlar: …
> - Kanıt: `pnpm verify` → yeşil (typecheck 0, lint 0, test 12/12, build OK)
> - Görsel kontrol: (UI ise) `[rota] 10/10 ✔` veya bulgular
> - Not: …

### 2026-11-12 · F0.2 TypeScript, ESLint, Prettier, git kancaları — ✔
- Yapılanlar: `packages/config` → `tsconfig/base.json` (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes,
  noImplicitOverride…), `eslint/base.js` (`baseConfig(tsconfigRootDir)`: strictTypeChecked + stylisticTypeChecked,
  simple-import-sort, no-console, gerekçesiz eslint-disable yasağı, TSX/JSX'te ham hex + Tailwind keyfi değer yasağı,
  eslint-config-prettier), `prettier/index.js`. Kök: `eslint.config.js`, `commitlint.config.js`, `lint-staged.config.js`,
  `.prettierignore` (md hariç), `knip.json`, `.husky/pre-commit` + `.husky/commit-msg` (`pnpm exec`), turbo `//#lint:root`,
  scriptler `format`, `format:check`, `knip`, `prepare`.
- Kanıt:
  - KK (lint): geçici `kk-probe/bad.tsx` → 10 hata: no-restricted-syntax ×3 (hex ×2, `w-[37px]`), no-explicit-any,
    ban-ts-comment, no-console, prefer-const, no-unsafe-*; `data-[state=open]:bg-surface` doğru şekilde serbest.
    Gerekçesiz `eslint-disable` → require-description hatası.
  - KK (typecheck): aynı dosyada TS2322 (noUncheckedIndexedAccess), TS2375 (exactOptionalPropertyTypes). Sonra silindi.
  - KK (commit kancası): `git commit -m "kotu mesaj formati"` → commitlint `subject-empty`, `type-empty` ile reddetti; git log değişmedi.
  - `pnpm verify` → 3/3 görev ✔; `pnpm knip` → temiz; `pnpm format:check` → temiz.
- Not: `.only`/`.skip` lint yasağı F0.6'da test eklentileriyle gelecek.

### 2026-11-12 · F0.1 Monorepo iskeleti ve sürüm kilidi — ✔
- Yapılanlar: `git init -b main`; pnpm 12.18.0 global kuruldu; kök `package.json` (packageManager, devEngines Node 26.13.1,
  scriptler), `pnpm-workspace.yaml` (saveExact, minimumReleaseAgeExclude), `turbo.json`, `.nvmrc`, `.editorconfig`,
  `.gitignore`, `.gitattributes`; §3.1 klasörleri + boş `@mobilya/{config,ui,contracts,utils,e2e}` paketleri;
  henüz kurulmamış scriptler (`e2e`, `e2e:a11y`, `ui:snap`, `knip`) `scripts/not-ready.mjs` ile açıkça hata veriyor.
  `docs/STACK.md` (45 paket, 2026-11-12), ADR-004 (TS 6.0.3), ADR-005 (Node/pnpm), `docs/OGRENME.md` (kullanıcı isteği).
- Kanıt:
  - KK1: `pnpm view` ile tüm paketler sorgulandı → `docs/STACK.md`. prisma `latest`=8.0.0-rc.33 (RC) → kararlı 7.10.1.
  - KK2: `package.json`'da `^`/`~` sayısı 0; `pnpm-lock.yaml` mevcut.
  - KK3: `node_modules` silindi → `pnpm install --frozen-lockfile` ✔ (supply-chain policy ✔) → `pnpm verify` ✔ (0 görev);
    `pnpm exec node -v` → v26.13.1; `pnpm e2e` → beklenen açıklayıcı hata, exit 1.
- Not: Kullanıcı isteğiyle `docs/OGRENME.md` öğrenme rehberi eklendi; CLAUDE.md §2.2-6'ya güncelleme adımı yazıldı.
