import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  API_URL: z.string().url().default('http://localhost:3001'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/app'),
  POSTGRES_USER: z.string().default('postgres'),
  POSTGRES_PASSWORD: z.string().default('postgres'),
  POSTGRES_DB: z.string().default('app'),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  MINIO_HOST: z.string().default('localhost'),
  MINIO_ROOT_USER: z.string().default('minioadmin'),
  MINIO_ROOT_PASSWORD: z.string().default('minioadmin'),
  MINIO_API_PORT: z.coerce.number().int().positive().default(9000),
  MINIO_CONSOLE_PORT: z.coerce.number().int().positive().default(9001),
  // CORS: comma-separated list of allowed origins for browser requests directly against the API
  // (the Next.js app itself calls the API server-to-server and is unaffected by this).
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_TTL_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_LIMIT: z.coerce.number().int().positive().default(120),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  // Authentication (F9-S02)
  JWT_SECRET: z.string().default('dev-only-jwt-secret-do-not-use-in-production'),
  JWT_SESSION_EXPIRATION_MINUTES: z.coerce.number().int().positive().default(60),
  JWT_REMEMBER_ME_EXPIRATION_DAYS: z.coerce.number().int().positive().default(30),
  OTP_EXPIRATION_MINUTES: z.coerce.number().int().positive().default(10),
  EMAIL_FROM: z.string().default('no-reply@ai-visibility-auditor.local'),
});

export type PlatformConfig = z.infer<typeof envSchema>;

// These fields ship with working local-development defaults so `pnpm dev` needs zero setup.
// That convenience becomes a real risk in production: a misconfigured deploy could silently run
// against a well-known default credential instead of failing loudly. `assertProductionSecrets`
// lets a specific app (the API, which is the only consumer of these fields — `apps/web` only
// ever reads `API_URL` and has nothing to check here) opt into requiring them explicitly whenever
// NODE_ENV=production. It is not called automatically by `loadConfig` itself: `loadConfig` is
// shared by every app in the monorepo, and `next start` always sets NODE_ENV=production for the
// web app too, which has no Postgres/MinIO credentials of its own to provide.
const REQUIRED_IN_PRODUCTION = [
  'DATABASE_URL',
  'POSTGRES_PASSWORD',
  'MINIO_ROOT_USER',
  'MINIO_ROOT_PASSWORD',
  'JWT_SECRET',
] as const;

export function assertProductionSecrets(config: PlatformConfig): void {
  if (config.NODE_ENV !== 'production') {
    return;
  }

  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key] || process.env[key]!.trim().length === 0);
  if (missing.length > 0) {
    throw new Error(
      `Refusing to start with NODE_ENV=production: the following secrets must be set explicitly ` +
        `and cannot rely on their development defaults: ${missing.join(', ')}.`,
    );
  }
}

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
