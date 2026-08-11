import { z } from 'zod';

export const envSchema = z.object({
  APP_NAME: z.string().min(1, 'APP_NAME is required'),
  APP_URL: z.string().url('APP_URL must be a valid URL'),
  APP_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .int()
        .min(1)
        .max(65535, 'APP_PORT must be between 1 and 65535'),
    ),

  NODE_ENV: z
    .enum(['development', 'production', 'test', 'staging'])
    .default('development'),

  // Both read directly by Prisma via `env(...)` in schema.prisma — must stay in
  // this schema so @nestjs/config's `validate` re-assigns them onto process.env
  // (it only re-assigns keys present in the validator's return value).
  // DB_URL: Supabase's pooled ("Transaction" mode / port 6543) connection string,
  // used by the app at runtime.
  DB_URL: z.string().min(1, 'DB_URL is required'),
  // DIRECT_URL: Supabase's direct (port 5432) connection string, used only by
  // Prisma Migrate — the pooler doesn't support the prepared statements migrations need.
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),

  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_JWT_SECRET: z.string().min(1, 'SUPABASE_JWT_SECRET is required'),

  THROTTLE_TTL: z
    .string()
    .optional()
    .default('60000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  THROTTLE_LIMIT: z
    .string()
    .optional()
    .default('100')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),

  CORS_ORIGIN: z.string().optional().default('*'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvConfig {
  try {
    return envSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      throw new Error(
        `Environment validation failed:\n${errorMessages.join('\n')}`,
      );
    }
    throw error;
  }
}
