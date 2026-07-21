import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_URL: z.string().url().default('http://localhost:3001'),
  POSTGRES_USER: z.string().default('postgres'),
  POSTGRES_PASSWORD: z.string().default('postgres'),
  POSTGRES_DB: z.string().default('app'),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  MINIO_ROOT_USER: z.string().default('minioadmin'),
  MINIO_ROOT_PASSWORD: z.string().default('minioadmin'),
  MINIO_API_PORT: z.coerce.number().int().positive().default(9000),
  MINIO_CONSOLE_PORT: z.coerce.number().int().positive().default(9001),
});

export type PlatformConfig = z.infer<typeof envSchema>;

let cachedConfig: PlatformConfig | undefined;

export function loadConfig(): PlatformConfig {
  if (!cachedConfig) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
    }
    cachedConfig = parsed.data;
  }
  return cachedConfig;
}
