---
description: Oturumu başlatır, durumu kontrol eder ve sıradaki yol haritası görevini planlayıp uygular
---

`CLAUDE.md §2.1` oturum başlangıç protokolünü uygula, ardından §2.2 görev döngüsünü **bir görev için** baştan sona çalıştır.

Adımlar:
1. `CLAUDE.md`, `docs/PROGRESS.md`, `ROADMAP.md` dosyalarını oku.
2. `git status` ve `git log --oneline -10` çalıştır. Proje kuruluysa `pnpm verify` çalıştır; kırmızıysa önce onu düzelt.
3. `docs/PROGRESS.md` → "Aktif görev" doluysa ondan devam et. Boşsa `ROADMAP.md`'de bağımlılıkları tamamlanmış ilk `[ ]` görevi seç.
4. Görevin ilgili belge bölümlerini oku (UI → `docs/DESIGN_SYSTEM.md` + `docs/REFERENCE.md` + `docs/reference/` görselleri; backend → `docs/ARCHITECTURE.md`).
5. Planı `docs/PROGRESS.md` → "Aktif görev"e yaz.
6. Uygula → `/dogrula` → (UI ise) `/gorsel-kontrol` → `CLAUDE.md §5` öz-denetim listesini satır satır cevapla.
7. `ROADMAP.md`'de `[x]` yap, `docs/PROGRESS.md` günlüğüne kanıtla yaz, commit'le.
8. Kısa bir özet ver: biten görev, kanıt, sıradaki görev. Kullanıcıdan beklenen bir bilgi engel olduysa tek mesajda sor.

Ek talimat (varsa): $ARGUMENTS
