import { existsSync } from 'node:fs';

import type { z } from 'zod';

type EnvSource = Readonly<Record<string, string | undefined>>;

/** Ortam değişkenleri şemaya uymadığında fırlatılır; `variables` sorunlu değişken adlarını sırayla içerir. */
export class EnvValidationError extends Error {
  readonly variables: readonly string[];

  constructor(problems: readonly { variable: string; reason: string }[]) {
    const lines = problems.map(({ variable, reason }) => `  • ${variable}: ${reason}`);
    super(
      [
        'Ortam değişkenleri geçersiz:',
        ...lines,
        'Açıklamalar için kökteki .env.example dosyasına bakın.',
      ].join('\n'),
    );
    this.name = 'EnvValidationError';
    this.variables = problems.map(({ variable }) => variable);
  }
}

/**
 * `source` içindeki değişkenleri şemaya göre doğrular ve dönüştürür (ARCHITECTURE §13).
 * Boş string "tanımlanmamış" sayılır; `.env` dosyasında `KEY=` bırakılan satır varsayılanı devre dışı bırakmasın diye.
 * Hata mesajı değerleri değil yalnızca değişken adlarını ve nedeni içerir — gizli bilgi loglara sızmaz (CLAUDE.md §1-9).
 */
export function parseEnv<TSchema extends z.ZodObject>(
  schema: TSchema,
  source: EnvSource,
): z.output<TSchema> {
  const normalized = Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined && value !== ''),
  );
  const result = schema.safeParse(normalized);
  if (result.success) return result.data;

  const problems = result.error.issues.map((issue) => {
    const variable = issue.path.join('.');
    const missing = issue.code === 'invalid_type' && normalized[variable] === undefined;
    return { variable, reason: missing ? 'eksik (zorunlu)' : `geçersiz — ${issue.message}` };
  });
  throw new EnvValidationError(problems);
}

/**
 * Süreç açılışında kullanılır: ortam geçersizse nedenini stderr'e yazar ve süreci 1 koduyla kapatır.
 * Eksik bir ayarla yarım çalışan bir sunucu, hiç çalışmayan sunucudan daha tehlikelidir.
 */
export function parseEnvOrExit<TSchema extends z.ZodObject>(
  schema: TSchema,
  source: EnvSource,
): z.output<TSchema> {
  try {
    return parseEnv(schema, source);
  } catch (error) {
    if (!(error instanceof EnvValidationError)) throw error;
    process.stderr.write(`${error.message}\n`);
    return process.exit(1);
  }
}

/**
 * Dosya varsa içindeki değişkenleri `process.env`'e yükler; zaten tanımlı değişkenlerin üzerine yazmaz.
 * Lokal geliştirmede kökteki `.env` için kullanılır; sunucularda dosya bulunmaz ve değerler ortamdan gelir.
 */
export function loadEnvFileIfExists(path: string): void {
  if (existsSync(path)) process.loadEnvFile(path);
}
