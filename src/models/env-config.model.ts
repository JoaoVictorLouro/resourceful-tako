import { z } from 'zod';

export const EnvConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  API_KEY: z.string().default(''),
});

export type EnvConfig = z.infer<typeof EnvConfigSchema>;
