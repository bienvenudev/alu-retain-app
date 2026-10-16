import type { Budget } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

import { prisma } from '../db/prisma.js'
import { HttpError } from '../lib/errors.js'
import { periodSchema } from '../lib/period.js'
import { getUserId, requireAuth } from '../middleware/auth.js'

const budgetInputSchema = z.object({
  amount: z
    .string()
    .trim()
    .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Enter an amount like 5000 or 5000.50')
    .refine((value) => Number(value) > 0, 'Budget must be greater than zero'),
})

function serializeBudget(budget: Budget) {
  return {
    amount: budget.amount.toFixed(2),
    id: budget.id,
    month: budget.month,
    updatedAt: budget.updatedAt.toISOString(),
    year: budget.year,
  }
}

export const budgetsRouter = Router()

budgetsRouter.use(requireAuth)

budgetsRouter.get('/:year/:month', async (request, response) => {
  const { month, year } = periodSchema.parse(request.params)
  const budget = await prisma.budget.findUnique({
    where: {
      userId_year_month: { month, userId: getUserId(request), year },
    },
  })

  if (!budget) {
    throw new HttpError(404, 'No budget is set for this month.')
  }

  response.json(serializeBudget(budget))
})

budgetsRouter.put('/:year/:month', async (request, response) => {
  const userId = getUserId(request)
  const { month, year } = periodSchema.parse(request.params)
  const { amount } = budgetInputSchema.parse(request.body)

  const budget = await prisma.budget.upsert({
    create: { amount, month, userId, year },
    update: { amount },
    where: { userId_year_month: { month, userId, year } },
  })

  response.json(serializeBudget(budget))
})
