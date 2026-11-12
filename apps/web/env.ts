import { parseEnvOrExit } from '@mobilya/utils/env';
import { z } from 'zod';

// Her değişkenin açıklaması kökteki .env.example dosyasındadır (ARCHITECTURE §13).
// Bu değerler yalnızca sunucuda okunur; tarayıcıya gidecek değişkenler `NEXT_PUBLIC_` önekiyle ayrıca tanımlanır.
export const serverEnvSchema = z.object({
  API_URL: z.url(),
});

export type ServerEnv = z.output<typeof serverEnvSchema>;

export function readServerEnvOrExit(): ServerEnv {
  return parseEnvOrExit(serverEnvSchema, process.env);
}
