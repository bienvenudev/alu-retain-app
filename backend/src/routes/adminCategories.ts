import { Prisma } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

import { prisma } from '../db/prisma.js'
import { UNCATEGORIZED_NAME } from '../lib/domain.js'
import { HttpError } from '../lib/errors.js'
import { parseId } from '../lib/validation.js'

const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Keep the name under 50 characters'),
})

export const adminCategoriesRouter = Router()

const duplicateMessage = 'A category with this name already exists.'

async function assertNameAvailable(name: string, ignoreId?: string) {
  const duplicate = await prisma.category.findFirst({
    select: { id: true },
    where: {
      id: ignoreId ? { not: ignoreId } : undefined,
      name: { equals: name, mode: 'insensitive' },
    },
  })

  if (duplicate) {
    throw new HttpError(409, duplicateMessage)
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  )
}

adminCategoriesRouter.get('/', async (_request, response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { _count: { select: { expenses: true } }, id: true, name: true },
  })

  response.json(
    categories.map(({ _count, id, name }) => ({
      expenseCount: _count.expenses,
      id,
      name,
    })),
  )
})

adminCategoriesRouter.post('/', async (request, response) => {
  const { name } = categoryInputSchema.parse(request.body)
  await assertNameAvailable(name)

  try {
    const category = await prisma.category.create({
      data: { name },
      select: { id: true, name: true },
    })

    response.status(201).json(category)
  } catch (error) {
    throw isUniqueViolation(error) ? new HttpError(409, duplicateMessage) : error
  }
})

adminCategoriesRouter.patch('/:id', async (request, response) => {
  const id = parseId(request.params.id, 'Category')
  const { name } = categoryInputSchema.parse(request.body)
  const existing = await prisma.category.findUnique({ where: { id } })

  if (!existing) {
    throw new HttpError(404, 'Category not found.')
  }

  if (existing.name === UNCATEGORIZED_NAME) {
    throw new HttpError(400, 'The Uncategorized category cannot be renamed.')
  }

  await assertNameAvailable(name, id)

  try {
    const category = await prisma.category.update({
      data: { name },
      select: { id: true, name: true },
      where: { id },
    })

    response.json(category)
  } catch (error) {
    throw isUniqueViolation(error) ? new HttpError(409, duplicateMessage) : error
  }
})

// Expenses in the deleted category move to "Uncategorized" in the same
// transaction, so no expense is ever left pointing at a missing category.
adminCategoriesRouter.delete('/:id', async (request, response) => {
  const id = parseId(request.params.id, 'Category')

  const reassignedCount = await prisma.$transaction(async (tx) => {
    const category = await tx.category.findUnique({ where: { id } })

    if (!category) {
      throw new HttpError(404, 'Category not found.')
    }

    if (category.name === UNCATEGORIZED_NAME) {
      throw new HttpError(400, 'The Uncategorized category cannot be deleted.')
    }

    const fallback = await tx.category.findUnique({
      where: { name: UNCATEGORIZED_NAME },
    })

    if (!fallback) {
      throw new HttpError(500, 'The Uncategorized category is missing.')
    }

    const moved = await tx.expense.updateMany({
      data: { categoryId: fallback.id },
      where: { categoryId: id },
    })
    await tx.category.delete({ where: { id } })

    return moved.count
  })

  response.json({ reassignedCount })
})
