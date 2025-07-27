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
  DB_USERNAME: z.string().min(1, 'DB_USERNAME is required'),
  DB_PASSWORD: z.string().optional().default(''),
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
