# [MARKA_ADI] — Mobilya E-Ticaret

Türkiye pazarına takım (set) ağırlıklı mobilya satan B2C e-ticaret sitesi. Monorepo: vitrin (`apps/web`), yönetim paneli
(`apps/admin`), API + işçi (`apps/api`) ve ortak paketler (`packages/*`).

- Proje kuralları: [CLAUDE.md](CLAUDE.md) · Yol haritası: [ROADMAP.md](ROADMAP.md) · İlerleme: [docs/PROGRESS.md](docs/PROGRESS.md)
- Mimari: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · Tasarım sistemi: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)
- Sürümler: [docs/STACK.md](docs/STACK.md) · Kararlar: [docs/DECISIONS.md](docs/DECISIONS.md)
- **Yeni başlıyorsan:** [docs/OGRENME.md](docs/OGRENME.md) — hangi dosya ne işe yarar, hangi araç neden kullanıldı.

## Gereksinimler

| Araç | Not |
|---|---|
| [Git](https://git-scm.com/) | |
| [Node.js](https://nodejs.org/) 18 veya üzeri (LTS önerilir) | Yalnızca pnpm'i çalıştırmak için. Projenin kendi Node sürümünü (26.13.1, `.nvmrc`) pnpm otomatik indirir. |
| [pnpm](https://pnpm.io/) 12.18.0 | `npm install -g pnpm@12.18.0` |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Lokal servisler ve entegrasyon testleri için; **çalışır durumda** olmalı. |

## Sıfırdan kurulum

```bash
git clone <depo-adresi> mobilya-eticaret
cd mobilya-eticaret

pnpm install                 # bağımlılıklar + git kancaları (husky)
cp .env.example .env         # lokal ortam değişkenleri (Windows PowerShell: Copy-Item .env.example .env)
pnpm infra:up                # Postgres, Redis, Meilisearch, S3 (RustFS), Mailpit — hepsi "healthy" olana kadar bekler
pnpm e2e:install             # Playwright için Chromium (bir kez)

pnpm verify                  # tip + lint + test + build — hepsi yeşil olmalı
pnpm e2e                     # tarayıcı + erişilebilirlik testleri — hepsi yeşil olmalı
pnpm dev                     # web :3000, admin :3001, api :4000
```

Kurulum doğru ise:

| Adres | Beklenen |
|---|---|
| http://localhost:3000 | Vitrin (şimdilik boş sayfa, sekme başlığı `[MARKA_ADI]`) |
| http://localhost:3001 | Yönetim paneli (sekme başlığı `[MARKA_ADI] Yönetim`) |
| http://localhost:4000/health/live | `{"status":"ok"}` |
| http://localhost:18025 | Mailpit (yakalanan e-postalar) |
| http://localhost:19001/rustfs/console/ | RustFS konsolu (`mobilya` / `mobilya_dev_secret`) |

## Komutlar

| Komut | Ne yapar |
|---|---|
| `pnpm dev` | Üç uygulamayı geliştirme modunda başlatır |
| `pnpm verify` | Doğrulama kapıları G1–G4: typecheck, lint, test, build (CLAUDE.md §4.1) |
| `pnpm test` | Birim + entegrasyon testleri (entegrasyon testleri Docker ister) |
| `pnpm e2e` / `pnpm e2e:a11y` | Uygulamaları derleyip Playwright testleri / yalnızca erişilebilirlik testleri |
| `pnpm ui:snap <rota> [--states hover,focus,menu]` | Rotanın 375/768/1280/1440 px ekran görüntüleri + taşma/konsol raporu → `.artifacts/screens/` (uygulama çalışıyor olmalı) |
| `pnpm infra:up` / `infra:down` / `infra:reset` | Lokal servisleri başlat / durdur / **verileri silip** sıfırla |
| `pnpm format` / `format:check` | Prettier ile biçimlendir / kontrol et |
| `pnpm knip` | Kullanılmayan kod ve bağımlılıklar |
| `pnpm lint:ci` | GitHub Actions iş akışını actionlint ile denetle (Docker) |

## Portlar

Lokal servisler başka projelerle çakışmasın diye "1 + standart port" kuralıyla ve **yalnızca `127.0.0.1`** üzerinde
yayınlanır (geliştirme şifreleri herkesçe bilindiği için aynı ağdaki başka cihazlar erişemez); hepsi `.env` ile değiştirilebilir.

| Servis | Port |
|---|---|
| Vitrin / Panel / API | 3000 / 3001 / 4000 |
| PostgreSQL | 15432 |
| Redis | 16379 |
| Meilisearch | 17700 |
| S3 API / konsol | 19000 / 19001 |
| SMTP / Mailpit arayüzü | 11025 / 18025 |

## Sık karşılaşılan sorunlar

- **`API_URL: eksik (zorunlu)` / `DATABASE_URL: eksik`** → kökte `.env` yok veya satır silinmiş: `cp .env.example .env`.
- **Entegrasyon testleri `Could not find a working container runtime`** → Docker Desktop açık değil.
- **Git Bash'te `pnpm ui:snap /` yanlış rota alıyor** → Git Bash `/` ile başlayan argümanı Windows yoluna çevirir:
  `MSYS_NO_PATHCONV=1 pnpm ui:snap /` (PowerShell'de sorun yok).
- **Windows'ta `Sistem belirtilen yolu bulamıyor (os error 3)`** → proje klasörünün yolu çok uzun (Windows 260 karakter sınırı;
  pnpm `node_modules` içinde uzun dosya adları kullanır). Projeyi kısa bir yola (ör. `C:\projeler\mobilya`) klonla.
- **Commit reddedildi** → mesaj Conventional Commits biçiminde ve küçük harfle başlamalı: `feat(catalog): takım kartları [F4.7]`.
