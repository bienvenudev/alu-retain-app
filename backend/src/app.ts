import cors from 'cors'
import express from 'express'

import { env } from './config/env.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { adminRouter } from './routes/admin.js'
import { authRouter } from './routes/auth.js'
import { categoriesRouter } from './routes/categories.js'
import { expensesRouter } from './routes/expenses.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.FRONTEND_ORIGIN }))
  app.use(express.json({ limit: '100kb' }))

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' })
  })
  app.use('/api/auth', authRouter)
  app.use('/api/categories', categoriesRouter)
  app.use('/api/expenses', expensesRouter)
  app.use('/api/admin', adminRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
