import { Router } from 'express'

import { prisma } from '../db/prisma.js'
import { getBudgetStatus, getPercentSpent } from '../lib/budget.js'
import { HttpError } from '../lib/errors.js'
import { fromCents, toCents } from '../lib/money.js'
import { monthRange, periodSchema } from '../lib/period.js'
import { requireAuth } from '../middleware/auth.js'
import { expenseInclude, serializeExpense } from '../serializers/expense.js'

const recentLimit = 5

export const summaryRouter = Router()

summaryRouter.use(requireAuth)

// Everything the dashboard and budget pages need for one month, computed in
// the database and read in a single transaction so the numbers agree.
summaryRouter.get('/', async (request, response) => {
  const userId = request.auth?.id

  if (!userId) {
    throw new HttpError(401, 'You must be signed in.')
  }

  const { month, year } = periodSchema.parse(request.query)
  const where = { expenseDate: monthRange(year, month), userId }

  const [totals, highest, groups, recent, budget] = await prisma.$transaction([
    prisma.expense.aggregate({ _count: true, _sum: { amount: true }, where }),
    prisma.expense.findFirst({
      include: expenseInclude,
      orderBy: [{ amount: 'desc' }, { expenseDate: 'desc' }, { id: 'asc' }],
      where,
    }),
    prisma.expense.groupBy({
      _count: true,
      _sum: { amount: true },
      by: ['categoryId'],
      orderBy: { _sum: { amount: 'desc' } },
      where,
    }),
    prisma.expense.findMany({
      include: expenseInclude,
      orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }],
      take: recentLimit,
      where,
    }),
    prisma.budget.findUnique({
      where: { userId_year_month: { month, userId, year } },
    }),
  ])

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    where: { id: { in: groups.map((group) => group.categoryId) } },
  })
  const categoryById = new Map(categories.map((category) => [category.id, category]))

  const spentCents = toCents(totals._sum.amount)
  const budgetCents = budget ? toCents(budget.amount) : null

  response.json({
    budget: budget ? budget.amount.toFixed(2) : null,
    byCategory: groups.flatMap((group) => {
      const category = categoryById.get(group.categoryId)

      return category
        ? [
            {
              category,
              count: group._count,
              total: fromCents(toCents(group._sum?.amount)),
            },
          ]
        : []
    }),
    expenseCount: totals._count,
    highestExpense: highest ? serializeExpense(highest) : null,
    month,
    percentSpent:
      budgetCents === null ? null : getPercentSpent(spentCents, budgetCents),
    recentExpenses: recent.map(serializeExpense),
    remaining: budgetCents === null ? null : fromCents(budgetCents - spentCents),
    status:
      budgetCents === null ? null : getBudgetStatus(spentCents, budgetCents),
    totalSpent: fromCents(spentCents),
    year,
  })
})
