# Öğrenme Rehberi — Bu site nasıl yapılıyor?

> Bu dosya **senin için** yazılıyor. Kodu Claude yazıyor; burada her adımda hangi dosyanın ne işe yaradığını,
> hangi aracın neden seçildiğini ve nasıl kullanıldığını sade bir dille anlatıyorum.
> Her görev bittiğinde güncellenir. En alttaki **"Adım adım günlük"** bölümü kronolojik hikâyedir;
> üstteki bölümler ise o ana kadar öğrenilenlerin derli toplu hâlidir.

**Nasıl okumalı?**
1. Önce "Büyük resim"i oku — sitenin parçalarını kafanda canlandır.
2. Bilmediğin bir kelime görünce "Sözlük"e bak.
3. Projede bir dosya görüp "bu ne?" dersen "Dosya rehberi"ne bak.
4. Her görevin sonunda günlükteki **"Kendin dene"** kısmındaki komutları kendi terminalinde çalıştır. En hızlı öğrenme yolu budur.

---

## 1. Büyük resim

Bir e-ticaret sitesi tek bir program değil, birlikte çalışan birkaç programdır:

```
 Müşteri (tarayıcı)              Mağaza çalışanı (tarayıcı)
        │                                 │
        ▼                                 ▼
  apps/web  (vitrin)               apps/admin  (yönetim paneli)
  Ürünleri gösterir,               Ürün ekler, siparişleri yönetir
  sepet, ödeme ekranı              
        │                                 │
        └──────────┬──────────────────────┘
                   ▼  (internet üzerinden JSON veri alışverişi)
             apps/api  (arka uç / backend)
             Bütün iş kuralları burada: fiyat hesabı, stok,
             sipariş, ödeme, kullanıcı girişi...
                   │
     ┌─────────────┼──────────────┬──────────────┐
     ▼             ▼              ▼              ▼
 PostgreSQL      Redis       Meilisearch    MinIO (S3)
 (veritabanı)  (hızlı bellek, (arama motoru) (ürün görselleri)
               iş kuyruğu)
```

- **Ön yüz (frontend)** = kullanıcının gördüğü kısım (`apps/web`, `apps/admin`).
- **Arka uç (backend)** = görünmeyen, kuralları uygulayan ve veriyi saklayan kısım (`apps/api`).
- Ön yüz veritabanına **asla** doğrudan bağlanmaz; her şeyi API'ye sorar. Böylece kurallar tek yerde olur ve
  kötü niyetli biri tarayıcıda fiyatı değiştirse bile sunucu doğru fiyatı kendisi hesaplar.

Bu üç uygulama ve ortak kod parçaları **tek bir depoda** (monorepo) duruyor. Neden? Ön yüz ile API'nin
aynı veri tiplerini paylaşabilmesi için (`packages/contracts`). API'de bir alanın adı değişirse, ön yüzdeki hata
daha kod çalışmadan TypeScript tarafından yakalanır.

---

## 2. Sözlük

| Terim | Anlamı |
|---|---|
| **Node.js** | JavaScript'i tarayıcı dışında (bilgisayarda/sunucuda) çalıştıran program. Bütün araçlarımız onun üzerinde çalışır. |
| **LTS** | "Long Term Support" — uzun süre güvenlik güncellemesi alan, üretimde kullanılması önerilen sürüm. |
| **Paket (package)** | Başkalarının yazıp paylaştığı hazır kod kütüphanesi (ör. `react`). npm kayıt deposundan indirilir. |
| **Paket yöneticisi** | Paketleri indiren, sürümlerini takip eden araç. Biz **pnpm** kullanıyoruz. |
| **Bağımlılık (dependency)** | Projemizin çalışmak için ihtiyaç duyduğu paket. `devDependencies` = yalnızca geliştirirken gerekenler. |
| **Monorepo** | Birden çok uygulama/paketin tek bir git deposunda durması. |
| **Workspace** | Monorepo içindeki her bir paket/uygulama (ör. `apps/web`, `packages/ui`). |
| **Script** | `package.json` içinde isim verilmiş komut. `pnpm build` yazınca "build" script'i çalışır. |
| **Lockfile** | `pnpm-lock.yaml`. Her paketin (ve onların bağımlılıklarının) tam olarak hangi sürümünün kurulduğunu kaydeder. Herkes aynı kurulumu alır. |
| **Semver** | Sürüm numarası düzeni: `ANA.ARA.YAMA` (ör. 26.13.1). Ana sürüm değişince eski kod bozulabilir. |
| **`^` / `~`** | package.json'da "bu sürüm veya uyumlu daha yenisi" anlamına gelir. Biz kullanmıyoruz: sürümler **tam** yazılır, sürpriz güncelleme olmaz. |
| **RC / beta / canary** | Henüz kararlı olmayan, deneme sürümleri. Kullanmıyoruz. |
| **Git** | Kodun her değişikliğini kayıt altına alan sürüm kontrol sistemi. |
| **Commit** | Git'te kaydedilmiş bir değişiklik paketi ("kayıt noktası"). |
| **TypeScript** | Tip bilgisi eklenmiş JavaScript. `fiyat: number` gibi; yanlış tipte veri verirsen kod çalışmadan hata gösterir. |
| **Typecheck** | TypeScript'in bütün kodu tip hatalarına karşı taraması. |
| **Lint** | Kodu hata riskli kalıplar ve kurallar açısından tarayan otomatik kontrol (ESLint). |
| **Build** | Kaynak kodu, çalıştırılabilir/yayınlanabilir hâle derlemek. |

---

## 3. Dosya rehberi

> Projede gördüğün her dosya ve klasörün kısa açıklaması. Yeni dosyalar eklendikçe tablo büyür.

### Kök dizindeki dosyalar

| Dosya | Ne işe yarar? | Hangi görevde geldi |
|---|---|---|
| `CLAUDE.md` | Claude'un çalışma kuralları (anayasa). | başlangıç |
| `ROADMAP.md` | Bütün görevler ve kabul kriterleri. `[x]` = bitti. | başlangıç |
| `BASLARKEN.md` | Senin için kısa başlangıç kılavuzu. | başlangıç |
| `package.json` | Kök projenin kimlik kartı: hangi pnpm/Node sürümü, hangi komutlar (`scripts`), hangi araçlar. | F0.1 |
| `pnpm-workspace.yaml` | pnpm'e "şu klasörlerdeki her şey bu projenin parçası" der; ayrıca pnpm ayarları. | F0.1 |
| `pnpm-lock.yaml` | Kilit dosyası — otomatik üretilir, **elle düzenlenmez**, commit'lenir. | F0.1 |
| `turbo.json` | Turborepo'ya görevlerin (build, test…) nasıl ve hangi sırayla çalışacağını söyler. | F0.1 |
| `.nvmrc` | Projenin Node sürümü (26.13.1). nvm gibi araçlar ve CI bunu okur. | F0.1 |
| `.editorconfig` | Editörlere ortak kural: UTF-8, 2 boşluk girinti, LF satır sonu. Herkesin kodu aynı biçimde. | F0.1 |
| `.gitignore` | Git'in **takip etmeyeceği** dosyalar: `node_modules`, derleme çıktıları, gizli `.env` dosyaları. | F0.1 |
| `.gitattributes` | Windows'ta bile depoda satır sonlarının LF kalmasını sağlar (Windows CRLF kullanır, karışıklık olmasın). | F0.1 |
| `scripts/not-ready.mjs` | Henüz kurulmamış komutları (`pnpm e2e` gibi) çağırınca "şu görevde gelecek" diye **hata** veren küçük betik. Sessizce "başarılı" demesin diye. | F0.1 |

### Klasörler

| Klasör | Ne işe yarar? |
|---|---|
| `apps/web` | Müşterilerin gördüğü vitrin sitesi (Next.js). *F0.4'te kurulacak.* |
| `apps/admin` | Yönetim paneli (Next.js). *F0.4'te kurulacak.* |
| `apps/api` | Arka uç API'si (NestJS) + veritabanı şeması. *F0.4'te kurulacak.* |
| `packages/ui` | Ortak tasarım sistemi: renkler, butonlar, formlar… web ve admin aynısını kullanır. |
| `packages/contracts` | API ile ön yüz arasındaki "sözleşme": veri şemaları (Zod). |
| `packages/config` | Ortak ayar dosyaları: TypeScript, ESLint, Tailwind. |
| `packages/utils` | Küçük, saf yardımcı fonksiyonlar: para biçimlendirme, slug, telefon, tarih. |
| `e2e/` | Uçtan uca testler: gerçek tarayıcı açıp siteyi müşteri gibi gezen testler (Playwright). |
| `docs/` | Proje belgeleri. |
| `node_modules/` | İndirilen paketler. **Git'e girmez**, silinirse `pnpm install` ile geri gelir. |

### `docs/` belgeleri

| Dosya | Ne anlatır? |
|---|---|
| `PROGRESS.md` | İlerleme günlüğü: ne yapıldı, hangi testler geçti, ne bekleniyor. |
| `DECISIONS.md` | Teknik kararlar ve **neden** öyle karar verildiği (ADR = Architecture Decision Record). |
| `STACK.md` | Kullanılan her aracın tam sürümü ve ne zaman doğrulandığı. |
| `ARCHITECTURE.md` | Backend mimarisi, veri modeli, ödeme/sipariş akışları. |
| `DESIGN_SYSTEM.md` | Renkler, yazı tipleri, buton kuralları, animasyon kuralları. |
| `REFERENCE.md` | Sayfaların şartnamesi (ana sayfa, ürün sayfası…). |
| `OGRENME.md` | Bu dosya. |

---

## 4. Araçlar — ne, neden, nasıl?

### pnpm (paket yöneticisi)
- **Ne:** Paketleri indirir ve monorepo'daki paketleri birbirine bağlar.
- **Neden npm değil:** Paketleri diskte tek bir yerde tutup projelere bağlantı verir → hızlı ve az yer kaplar.
  Ayrıca bir paketin, `package.json`'unda yazmadığı bir paketi "kazara" kullanmasına izin vermez (katı ve güvenli).
- **Bizdeki özel ayar:** `package.json → devEngines.runtime` alanı. pnpm, projenin Node 26.13.1 ile çalışmasını
  sağlamak için bu sürümü **kendisi indirir** — senin bilgisayarındaki Node (22) değişmeden kalır.
- **Güvenlik özelliği:** pnpm 12, yeni yayınlanmış paket sürümlerini bir süre bekletir (kötü niyetli bir sürüm
  yayınlanıp hemen fark edilirse diye). Biz en güncel kararlı sürümü bilinçli olarak seçtiğimiz için o sürümleri
  `pnpm-workspace.yaml` içinde tek tek istisna yazıyoruz (ADR-005).
- **Sık komutlar:**
  - `pnpm install` → bütün bağımlılıkları kurar.
  - `pnpm install --frozen-lockfile` → kilit dosyasına **birebir** uyarak kurar; uyuşmazlık varsa hata verir (CI böyle kurar).
  - `pnpm <script-adı>` → package.json'daki script'i çalıştırır (ör. `pnpm verify`).
  - `pnpm view <paket> version` → bir paketin en güncel sürümünü sorar.
  - `pnpm --filter @mobilya/web <komut>` → komutu yalnızca bir pakette çalıştırır.

### Turborepo (`turbo`)
- **Ne:** Monorepo'daki bütün paketlerde görevleri (build, test, lint…) çalıştıran yönetici.
- **Neden:** (1) Bağımlılık sırasını bilir: `packages/ui` derlenmeden `apps/web` derlenmez (`turbo.json`'daki `"dependsOn": ["^build"]`
  bunu söyler; `^` = "önce bağımlı olduğum paketler"). (2) **Önbellek:** Bir paketin kodu değişmediyse sonucu
  önceki çalıştırmadan getirir, tekrar derlemez → çok hızlı. (3) Birbirinden bağımsız görevleri paralel çalıştırır.
- **Nasıl:** Kök `package.json`'da `"build": "turbo run build"` yazıyor. Turbo, içinde `build` script'i olan her paketi bulup çalıştırır.

### TypeScript
- **Ne / neden:** Yukarıda sözlükte. Büyük projede hataların çoğunu kod çalışmadan yakalar.
- **Sürüm notu:** TypeScript 7 çıkmış (Go diliyle yeniden yazılmış, çok hızlı) ama lint aracımız henüz desteklemiyor.
  Bu yüzden 6.0.3 kullanıyoruz (ADR-004). Bu, "en yeniyi körü körüne almamak, araçların uyumuna bakmak" için güzel bir örnek.

### Git
- **Ne:** Her değişikliğin geçmişini tutar; bir şey bozulursa eski hâline dönülebilir.
- **Bizdeki kural:** Her görev bir commit. Mesajlar "Conventional Commits" biçiminde: `feat(catalog): ... [F4.7]`
  - `feat` = yeni özellik, `fix` = hata düzeltme, `chore` = altyapı/bakım işi, `docs` = belge.
- **Sık komutlar:** `git status` (ne değişti?), `git log --oneline` (geçmiş), `git diff` (değişikliğin kendisi).

---

## 5. Sık kullanılan proje komutları

| Komut | Ne yapar? | Ne zaman çalışır hâle geldi |
|---|---|---|
| `pnpm install` | Bağımlılıkları kurar | F0.1 |
| `pnpm verify` | typecheck + lint + test + build — "her şey yolunda mı?" kontrolü | F0.1 (içi görevlerle doluyor) |
| `pnpm typecheck` / `lint` / `test` / `build` | `verify`'ın parçaları tek tek | F0.1 (içi görevlerle doluyor) |
| `pnpm dev` | Uygulamaları geliştirme modunda başlatır | F0.4'te dolacak |
| `pnpm e2e`, `pnpm e2e:a11y` | Tarayıcı testleri, erişilebilirlik testleri | F0.6'da gelecek |
| `pnpm ui:snap <rota>` | Sayfanın farklı ekran genişliklerinde ekran görüntüsünü alır | F0.7'de gelecek |
| `pnpm knip` | Kullanılmayan kod/bağımlılık avcısı | F0.2'de gelecek |

---

## 6. Adım adım günlük

> Her görev: **Ne yaptık → Neden → Öğrenilecek kavram → Kendin dene.** En yeni en altta (hikâye sırası).

### F0.1 · Monorepo iskeleti ve sürüm kilidi (2026-11-12)

**Ne yaptık?**
1. `git init` ile projeyi bir git deposu yaptık (ana dal adı `main`).
2. Kök `package.json`'u yazdık: pnpm sürümünü (`packageManager`), Node sürümünü (`devEngines`) ve proje
   komutlarını (`scripts`) tanımladık.
3. `pnpm-workspace.yaml` ile `apps/*`, `packages/*` ve `e2e` klasörlerini workspace olarak tanıttık.
4. `CLAUDE.md §3.1`'deki klasör yapısını oluşturduk. Paketler şimdilik boş (yalnızca `package.json`);
   uygulamalar F0.4'te kurulacak.
5. Ortak ayar dosyaları: `.nvmrc`, `.editorconfig`, `.gitignore`, `.gitattributes`.
6. Kullanacağımız ~45 paketin **o günkü en güncel kararlı** sürümünü tek tek sorguladık ve `docs/STACK.md`'ye yazdık.

**Neden böyle?**
- **Sürümleri neden tam yazıyoruz?** `"react": "^19.3.1"` yazsaydık, yarın 19.4.0 çıktığında başka bir bilgisayardaki kurulum
  farklı sürüm alabilirdi → "bende çalışıyor, sende çalışmıyor" sorunu. Tam sürüm + lockfile = herkes aynı.
- **Sürümleri neden hafızadan değil, sorgulayarak?** Sorguladığımızda iki sürpriz çıktı:
  - `prisma`'nın "latest" etiketi bir **RC (deneme sürümü)** gösteriyordu. Körü körüne `latest` alsaydık kararsız sürüm kurulacaktı.
    `dist-tags` ile bakınca son kararlı sürümün 7.10.1 olduğu görüldü.
  - TypeScript 7 çıkmış ama lint aracı desteklemiyor. Paketlerin `peerDependencies` alanı ("ben şu sürümlerle çalışırım")
    kontrol edilerek bulundu.
- **`scripts/not-ready.mjs` neden var?** `pnpm e2e` henüz kurulmadı. Boş bırakılsaydı ya "komut bulunamadı" ya da hiçbir şey
  yapmadan "başarılı" dönebilirdi. Kurallarımız sahte başarıyı yasaklıyor, bu yüzden açıkça hata veriyor.

**Öğrenilecek kavramlar:** monorepo, workspace, lockfile, tam sürüm sabitleme, `dist-tags`, `peerDependencies`, tedarik zinciri güvenliği.

**Kendin dene** (VS Code'da `Ctrl+ö` ile terminali aç):
```bash
pnpm exec node -v           # → v26.13.1  (projenin Node'u)
node -v                     # → v22.x     (bilgisayarının Node'u — farklı! devEngines sayesinde)
pnpm view prisma dist-tags  # "latest" ile "prev" etiketlerini karşılaştır
pnpm verify                 # şimdilik "0 görev" — paketler doldukça burada iş görünecek
pnpm e2e                    # "henüz kurulmadı; F0.6..." hatasını gör
git log --oneline           # ilk commit'i gör
```
