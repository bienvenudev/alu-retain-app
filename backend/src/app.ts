import cors from 'cors'
import express from 'express'

import { env } from './config/env.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { authRouter } from './routes/auth.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.FRONTEND_ORIGIN }))
  app.use(express.json({ limit: '100kb' }))

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' })
  })
  app.use('/api/auth', authRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
