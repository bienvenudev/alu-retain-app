import 'dotenv/config'

import { z } from 'zod'

const envSchema = z.object({
  // Requests per address per 15 minutes across the whole API.
  API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(600),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  // One origin, or several separated by commas.
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(604800),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),
  // Storage guards so one account or script cannot fill the free database.
  MAX_CATEGORIES: z.coerce.number().int().positive().default(100),
  MAX_EXPENSES_PER_USER: z.coerce.number().int().positive().default(2000),
  MAX_USERS: z.coerce.number().int().positive().default(500),
  PORT: z.coerce.number().int().positive().default(3000),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const problems = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')

  throw new Error(`Invalid environment configuration:\n${problems}`)
}

export const env = parsed.data
