import { Router } from 'express'

import { prisma } from '../db/prisma.js'
import { requireAuth } from '../middleware/auth.js'

export const categoriesRouter = Router()

categoriesRouter.get('/', requireAuth, async (_request, response) => {
  response.json(
    await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  )
})
