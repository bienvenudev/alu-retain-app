import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { env } from './config/env.js'
import { prisma } from './db/prisma.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { apiLimiter } from './middleware/rateLimits.js'
import { adminRouter } from './routes/admin.js'
import { authRouter } from './routes/auth.js'
import { budgetsRouter } from './routes/budgets.js'
import { categoriesRouter } from './routes/categories.js'
import { expensesRouter } from './routes/expenses.js'
import { summaryRouter } from './routes/summary.js'

export function createApp() {
  const app = express()

  // The host's proxy sits in front of the app; trust it for client IPs.
  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim()),
    }),
  )
  app.use(express.json({ limit: '100kb' }))

  // Cheap check for uptime monitors; it never touches the database, so pinging
  // it does not keep a scale-to-zero database awake.
  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' })
  })

  app.get('/api/health/db', async (_request, response) => {
    try {
      await prisma.$queryRaw`SELECT 1`
      response.json({ status: 'ok' })
    } catch (error) {
      console.error(error)
      response
        .status(503)
        .json({ error: { message: 'The database is unavailable.' } })
    }
  })
  app.use('/api', apiLimiter)
  app.use('/api/auth', authRouter)
  app.use('/api/categories', categoriesRouter)
  app.use('/api/expenses', expensesRouter)
  app.use('/api/budgets', budgetsRouter)
  app.use('/api/summary', summaryRouter)
  app.use('/api/admin', adminRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
