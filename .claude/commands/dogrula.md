---
description: Doğrulama kapılarını (G1–G6) çalıştırır ve kanıtlı rapor verir
---

`CLAUDE.md §4.1` kapılarını sırayla çalıştır. Her komutun çıktısını gerçekten oku; tahmin yürütme.

1. `pnpm typecheck` → hata sayısı
2. `pnpm lint` → hata + uyarı sayısı
3. `pnpm test` → geçen/toplam, domain modülleri kapsamı (`--coverage`)
4. `pnpm build` → başarı, yeni uyarı var mı
5. `pnpm e2e` → (kapsam: $ARGUMENTS boşsa tümü, doluysa ilgili spec'ler)
6. `pnpm e2e:a11y` → ciddi/kritik ihlal sayısı

Rapor formatı (bunu `docs/PROGRESS.md` günlüğüne de ekle):
```
Doğrulama — <tarih>
G1 typecheck: ✔ 0 hata
G2 lint: ✔ 0/0
G3 test: ✔ 148/148 · pricing %92 · cart %88
G4 build: ✔
G5 e2e: ✔ 23/23
G6 a11y: ✔ 0 ihlal
```
Herhangi bir kapı kırmızıysa: nedenini bul, düzelt, **tüm kapıları baştan** çalıştır. Kapıyı geçmek için test, kural veya eşik gevşetme (`CLAUDE.md §1-5`).
