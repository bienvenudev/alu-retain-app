import { Router } from 'express'

import { prisma } from '../db/prisma.js'
import { fromCents, toCents } from '../lib/money.js'
import { monthRange } from '../lib/period.js'
import { expenseInclude, serializeExpense } from '../serializers/expense.js'
import { serializeUser } from '../serializers/user.js'

const listLimit = 5

export const adminInsightsRouter = Router()

// Platform-wide numbers for administrators (the router is mounted behind
// `requireAuth` and `requireAdmin`).
adminInsightsRouter.get('/', async (_request, response) => {
  const now = new Date()

  const [
    userCount,
    totals,
    currentMonthExpenseCount,
    groups,
    categories,
    recentExpenses,
    recentUsers,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.expense.aggregate({ _count: true, _sum: { amount: true } }),
    prisma.expense.count({
      where: {
        expenseDate: monthRange(now.getUTCFullYear(), now.getUTCMonth() + 1),
      },
    }),
    prisma.expense.groupBy({
      _count: true,
      _sum: { amount: true },
      by: ['categoryId'],
      orderBy: { categoryId: 'asc' },
    }),
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.expense.findMany({
      include: { ...expenseInclude, user: { select: { name: true } } },
      orderBy: [{ createdAt: 'desc' }, { expenseDate: 'desc' }, { id: 'asc' }],
      take: listLimit,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: listLimit,
    }),
  ])

  const groupByCategory = new Map(groups.map((group) => [group.categoryId, group]))

  // Every category appears, including those with no spending yet.
  const categoryTotals = categories
    .map((category) => {
      const group = groupByCategory.get(category.id)
      const cents = toCents(group?._sum?.amount)

      return {
        cents,
        item: { category, count: group?._count ?? 0, total: fromCents(cents) },
      }
    })
    .sort(
      (a, b) =>
        b.cents - a.cents || a.item.category.name.localeCompare(b.item.category.name),
    )
    .map((entry) => entry.item)

  response.json({
    bottomCategories: categoryTotals.slice(-listLimit).reverse(),
    categoryTotals,
    currentMonthExpenseCount,
    recentExpenses: recentExpenses.map((expense) => ({
      ...serializeExpense(expense),
      userName: expense.user.name,
    })),
    recentUsers: recentUsers.map((user) => ({
      ...serializeUser(user),
      createdAt: user.createdAt.toISOString(),
    })),
    topCategories: categoryTotals.slice(0, listLimit),
    totalExpenseCount: totals._count,
    totalSpent: fromCents(toCents(totals._sum.amount)),
    userCount,
  })
})
