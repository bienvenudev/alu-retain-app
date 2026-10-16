import type { Prisma } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

import { env } from '../config/env.js'
import { prisma } from '../db/prisma.js'
import { PAYMENT_METHODS } from '../lib/domain.js'
import { HttpError } from '../lib/errors.js'
import { dateString, parseId, toUtcDate } from '../lib/validation.js'
import { getUserId, requireAuth } from '../middleware/auth.js'
import { expenseInclude, serializeExpense } from '../serializers/expense.js'

const optionalText = z
  .string()
  .trim()
  .max(500, 'Keep this under 500 characters')
  .nullish()
  .transform((value) => value || null)

const expenseInputSchema = z.object({
  amount: z
    .string()
    .trim()
    .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Enter an amount like 5000 or 5000.50')
    .refine((value) => Number(value) > 0, 'Amount must be greater than zero'),
  categoryId: z.uuid('Choose a category'),
  description: optionalText,
  expenseDate: dateString,
  notes: optionalText,
  paymentMethod: z.enum(PAYMENT_METHODS),
  title: z.string().trim().min(1, 'Title is required').max(120),
})

const listQuerySchema = z.object({
  categoryId: z.uuid().optional(),
  endDate: dateString.optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  minAmount: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['amount', 'date']).default('date'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  startDate: dateString.optional(),
})

export const expensesRouter = Router()

// Every route below is scoped to the signed-in user, so one user can never
// read or change another user's expenses.
expensesRouter.use(requireAuth)

async function assertCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({
    select: { id: true },
    where: { id: categoryId },
  })

  if (!category) {
    throw new HttpError(400, 'Choose a valid category.', {
      categoryId: ['Choose a valid category'],
    })
  }
}

async function findOwnedExpense(id: string, userId: string) {
  const expense = await prisma.expense.findFirst({
    include: expenseInclude,
    where: { id, userId },
  })

  if (!expense) {
    throw new HttpError(404, 'Expense not found.')
  }

  return expense
}

expensesRouter.get('/', async (request, response) => {
  const userId = getUserId(request)
  const query = listQuerySchema.parse(request.query)

  const where: Prisma.ExpenseWhereInput = {
    amount: { gte: query.minAmount, lte: query.maxAmount },
    categoryId: query.categoryId,
    expenseDate: {
      gte: query.startDate ? toUtcDate(query.startDate) : undefined,
      lte: query.endDate ? toUtcDate(query.endDate) : undefined,
    },
    paymentMethod: query.paymentMethod,
    userId,
  }

  if (query.search) {
    const contains = { contains: query.search, mode: 'insensitive' as const }

    where.OR = [
      { title: contains },
      { description: contains },
      { notes: contains },
      { category: { name: contains } },
    ]
  }

  // The trailing id keeps the order stable so pages never overlap.
  const orderBy: Prisma.ExpenseOrderByWithRelationInput[] =
    query.sortBy === 'amount'
      ? [{ amount: query.sortDirection }, { expenseDate: 'desc' }, { id: 'asc' }]
      : [
          { expenseDate: query.sortDirection },
          { createdAt: query.sortDirection },
          { id: 'asc' },
        ]

  const [total, expenses] = await prisma.$transaction([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      include: expenseInclude,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      where,
    }),
  ])

  response.json({
    items: expenses.map(serializeExpense),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.ceil(total / query.pageSize),
  })
})

expensesRouter.get('/:id', async (request, response) => {
  const expense = await findOwnedExpense(
    parseId(request.params.id, 'Expense'),
    getUserId(request),
  )

  response.json(serializeExpense(expense))
})

expensesRouter.post('/', async (request, response) => {
  const userId = getUserId(request)
  const input = expenseInputSchema.parse(request.body)
  await assertCategoryExists(input.categoryId)

  if ((await prisma.expense.count({ where: { userId } })) >= env.MAX_EXPENSES_PER_USER) {
    throw new HttpError(
      403,
      `You have reached the limit of ${env.MAX_EXPENSES_PER_USER.toLocaleString('en-US')} expenses. Delete some to add more.`,
    )
  }

  const expense = await prisma.expense.create({
    data: { ...input, expenseDate: toUtcDate(input.expenseDate), userId },
    include: expenseInclude,
  })

  response.status(201).json(serializeExpense(expense))
})

expensesRouter.put('/:id', async (request, response) => {
  const userId = getUserId(request)
  const id = parseId(request.params.id, 'Expense')
  const input = expenseInputSchema.parse(request.body)
  await findOwnedExpense(id, userId)
  await assertCategoryExists(input.categoryId)

  const expense = await prisma.expense.update({
    data: { ...input, expenseDate: toUtcDate(input.expenseDate) },
    include: expenseInclude,
    where: { id },
  })

  response.json(serializeExpense(expense))
})

expensesRouter.delete('/:id', async (request, response) => {
  const id = parseId(request.params.id, 'Expense')
  await findOwnedExpense(id, getUserId(request))
  await prisma.expense.delete({ where: { id } })

  response.status(204).end()
})
