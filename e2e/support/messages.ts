import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

interface Messages {
  meta: { title: string };
}

// Testler kullanıcıya görünen metni koddan değil uygulamanın kendi mesaj dosyasından okur;
// metin değişince test kendiliğinden uyum sağlar.
function readMessages(app: 'web' | 'admin'): Messages {
  const file = fileURLToPath(new URL(`../../apps/${app}/messages/tr.json`, import.meta.url));
  return JSON.parse(readFileSync(file, 'utf8')) as Messages;
}

export const webMessages = readMessages('web');
export const adminMessages = readMessages('admin');
