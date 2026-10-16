import { rateLimit } from 'express-rate-limit'

import { env } from '../config/env.js'

const windowMs = 15 * 60 * 1000

function limiter(limit: number, message: string) {
  return rateLimit({
    legacyHeaders: false,
    limit,
    message: { error: { message } },
    standardHeaders: 'draft-8',
    windowMs,
  })
}

// Every API route, per client address. Health checks are registered before it.
export const apiLimiter = limiter(
  env.API_RATE_LIMIT_MAX,
  'Too many requests. Please slow down and try again in a few minutes.',
)

// Sign-in and sign-up only: slows down password guessing and mass sign-ups.
export const credentialsLimiter = limiter(
  env.AUTH_RATE_LIMIT_MAX,
  'Too many attempts. Please try again in a few minutes.',
)
