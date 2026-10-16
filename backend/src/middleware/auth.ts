import type { UserRole } from '@prisma/client'
import type { Request, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

import { env } from '../config/env.js'
import { prisma } from '../db/prisma.js'
import { HttpError } from '../lib/errors.js'

export interface AuthContext {
  id: string
  role: UserRole
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext
    }
  }
}

export function signToken(user: { id: string; role: UserRole }): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN_SECONDS,
    subject: user.id,
  })
}

function readBearerToken(request: Request): string {
  const header = request.headers.authorization
  const [scheme, token] = header?.split(' ') ?? []

  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'You must be signed in.')
  }

  return token
}

// Verifies the token, then loads the user so a deleted account or a changed
// role takes effect immediately instead of when the token expires.
export const requireAuth: RequestHandler = async (request, _response, next) => {
  let userId: string

  try {
    const payload = jwt.verify(readBearerToken(request), env.JWT_SECRET, {
      algorithms: ['HS256'],
    })

    if (typeof payload === 'string' || !payload.sub) {
      throw new HttpError(401, 'Your session is invalid. Please sign in again.')
    }

    userId = payload.sub
  } catch (error) {
    if (error instanceof HttpError) {
      throw error
    }

    throw new HttpError(401, 'Your session is invalid or has expired. Please sign in again.')
  }

  const user = await prisma.user.findUnique({
    select: { id: true, role: true },
    where: { id: userId },
  })

  if (!user) {
    throw new HttpError(401, 'Your session is invalid. Please sign in again.')
  }

  request.auth = user
  next()
}

// Use after `requireAuth`.
export const requireAdmin: RequestHandler = (request, _response, next) => {
  if (request.auth?.role !== 'ADMIN') {
    throw new HttpError(403, 'Administrator access is required.')
  }

  next()
}
