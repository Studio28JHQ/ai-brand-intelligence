import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  API_URL: z.string().url().default('http://localhost:3001'),
  // The Frontend's own origin — read only by the API, to build links (e.g. the "Verify Email"
  // button in transactional emails, `F9-S03`) that must point at the Frontend, not the API itself.
  WEB_URL: z.string().url().default('http://localhost:3000'),
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
  EMAIL_REPLY_TO: z.string().optional(),
  // Email delivery (F9-S02-HF02, F9-S02-HF03). Defaults to 'resend' — the platform ships assuming
  // real delivery is required; 'console' (log instead of deliver) is an explicit, documented opt-out
  // for local development, never the silent default. Adding a new provider means adding one value
  // here plus one new `EmailProvider` implementation (`infrastructure/notifications/`); no existing
  // use case changes.
  EMAIL_PROVIDER: z.enum(['console', 'resend']).default('resend'),
  RESEND_API_KEY: z.string().optional(),
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
  const problems: string[] = [...missing];
  if (config.EMAIL_PROVIDER === 'console') {
    problems.push(
      'EMAIL_PROVIDER must not be "console" in production — it only logs emails and never delivers them; set it to a real provider (e.g. "resend")',
    );
  }
  if (problems.length > 0) {
    throw new Error(
      `Refusing to start with NODE_ENV=production: the following secrets must be set explicitly ` +
        `and cannot rely on their development defaults: ${problems.join('; ')}.`,
    );
  }
}

const EMAIL_PROVIDER_REQUIREMENTS: Record<Exclude<PlatformConfig['EMAIL_PROVIDER'], 'console'>, { envVar: string; howToObtain: string }> = {
  resend: {
    envVar: 'RESEND_API_KEY',
    howToObtain:
      'Sign up at https://resend.com, verify a sending domain (Domains → Add Domain), then create an API key at https://resend.com/api-keys.',
  },
};

/**
 * Independent of `assertProductionSecrets`: this must fail fast in *every* environment, not just
 * production, the moment a real provider is active (`EMAIL_PROVIDER=resend`, the default) without
 * also supplying its credentials — silently falling back to the console logger at that point would
 * hide a real misconfiguration behind what looks like working output (`F9-S02-HF02`). Set
 * `EMAIL_PROVIDER=console` explicitly to opt out of this check for local development without a
 * provider account.
 */
export function assertEmailProviderConfigured(config: PlatformConfig): void {
  if (config.EMAIL_PROVIDER === 'console') {
    return;
  }
  const requirement = EMAIL_PROVIDER_REQUIREMENTS[config.EMAIL_PROVIDER];
  if (!config.RESEND_API_KEY || config.RESEND_API_KEY.trim().length === 0) {
    throw new Error(
      `Refusing to start with EMAIL_PROVIDER=${config.EMAIL_PROVIDER}: missing required environment variable ` +
        `${requirement.envVar}. ${requirement.howToObtain}`,
    );
  }
  if (!config.EMAIL_FROM || config.EMAIL_FROM.trim().length === 0) {
    throw new Error(
      `Refusing to start with EMAIL_PROVIDER=${config.EMAIL_PROVIDER}: missing required environment variable EMAIL_FROM ` +
        `(the verified sender address to send from).`,
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
