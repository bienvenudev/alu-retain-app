import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { z } from 'zod'

import { prisma } from '../db/prisma.js'
import { HttpError } from '../lib/errors.js'
import { requireAuth, signToken } from '../middleware/auth.js'
import { serializeUser } from '../serializers/user.js'

const passwordRounds = 12

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Enter a valid email address'))

const signUpSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(2, 'Enter your name').max(80),
  // bcrypt only uses the first 72 bytes, so longer passwords are refused.
  password: z
    .string()
    .min(8, 'Your password must be at least 8 characters')
    .max(72, 'Your password must be 72 characters or fewer'),
})

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
})

// Compared against when the email is unknown, so a miss takes as long as a hit.
const dummyHash = bcrypt.hashSync('not-a-real-password', passwordRounds)

export const authRouter = Router()

authRouter.post('/signup', async (request, response) => {
  const { email, name, password } = signUpSchema.parse(request.body)

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: await bcrypt.hash(password, passwordRounds),
      },
    })

    response
      .status(201)
      .json({ token: signToken(user), user: serializeUser(user) })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new HttpError(409, 'An account with this email already exists.')
    }

    throw error
  }
})

authRouter.post('/signin', async (request, response) => {
  const { email, password } = signInSchema.parse(request.body)
  const user = await prisma.user.findUnique({ where: { email } })
  const passwordMatches = await bcrypt.compare(
    password,
    user?.passwordHash ?? dummyHash,
  )

  if (!user || !passwordMatches) {
    throw new HttpError(401, 'The email or password is incorrect.')
  }

  response.json({ token: signToken(user), user: serializeUser(user) })
})

authRouter.get('/me', requireAuth, async (request, response) => {
  const user = await prisma.user.findUnique({
    where: { id: request.auth?.id },
  })

  if (!user) {
    throw new HttpError(401, 'Your session is invalid. Please sign in again.')
  }

  response.json({ user: serializeUser(user) })
})
