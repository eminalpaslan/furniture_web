---
description: Biten fazı bağımsız gözle denetler; sorunları düzeltir veya göreve dönüştürür
argument-hint: <faz> (ör. F4)
---

Faz: $ARGUMENTS

Kendi yaptığın işi kendin notlamamak için denetimi **bağımsız bir alt ajana** (subagent) yaptır. Alt ajana şunları ver:
- `CLAUDE.md`, `ROADMAP.md` içindeki ilgili faz bölümü, ilgili `docs/` bölümleri,
- fazın başlangıç commit'inden bu yana `git diff --stat` ve önemli dosyaların yolları.
Alt ajana şu görevi ver: "Bu fazın her görevinin kabul kriterlerini kod ve testler üzerinden tek tek doğrula; kanıtı olmayan,
kriteri karşılamayan, belgeyle çelişen veya `CLAUDE.md §1` kurallarını ihlal eden her şeyi dosya/satır referansıyla listele.
Ayrıca güvenlik, hata yönetimi, erişilebilirlik ve tutarlılık açısından en riskli 5 noktayı belirt. Kod değiştirme, yalnızca raporla."

Alt ajan kullanılamıyorsa aynı denetimi kendin yap, ama her kriter için kanıtı (test adı, dosya yolu, komut çıktısı) yeniden üret — hafızana güvenme.

Sonra:
1. `/dogrula` (tüm kapılar, tüm e2e).
2. Fazın tüm UI rotaları için `/gorsel-kontrol`.
3. Rapordaki her bulgu: ya şimdi düzelt ya da `ROADMAP.md`'de uygun faza yeni görev olarak ekle (ID: `F<n>.<m>a` gibi).
4. `docs/PROGRESS.md`'ye faz denetimi raporu: kriter karşılama tablosu, bulgular, yapılan düzeltmeler, eklenen görevler, ölçümler.
5. Faz özet tablosundaki "Faz çıkış kapısı" sağlanmadıysa bir sonraki faza geçme.
