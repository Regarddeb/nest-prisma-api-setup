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

  DB_CONNECTION: z
    .enum(['mysql', 'postgresql', 'sqlite', 'mongodb'])
    .default('mysql'),
  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z.number().int().min(1).max(65535, 'DB_PORT must be between 1 and 65535'),
    ),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  // Read directly by Prisma via `env("DB_URL")` in schema.prisma — must stay in
  // this schema so @nestjs/config's `validate` re-assigns it onto process.env
  // (it only re-assigns keys present in the validator's return value).
  DB_URL: z.string().min(1, 'DB_URL is required'),
  DB_USERNAME: z.string().min(1, 'DB_USERNAME is required'),
  DB_PASSWORD: z.string().optional().default(''),

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
