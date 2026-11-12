// Henüz kurulmamış bir aracın script'i çağrıldığında sessizce "başarılı" dönmemek için
// (CLAUDE.md §1-6 "sahte başarı yok") açıklayıcı bir hata ile çıkar.
// Araç ilgili görevde kurulunca kök package.json'daki script gerçek komutla değiştirilir.
const [, , script = '?', task = '?'] = process.argv;

process.stderr.write(
  `"${script}" henüz kurulmadı; ${task} görevinde eklenecek (bkz. ROADMAP.md).\n`,
);
process.exit(1);
