import { readDb, writeDb } from '../mock/db'
import { requireAdmin, simulateRequest } from '../mock/simulate'
import {
  type Category,
  type CategoryWithCount,
  UNCATEGORIZED_NAME,
} from '../types/domain'
import { ApiError } from './apiError'

// The function bodies are the only part that changes when the Express API
// replaces the mock. Mutations are admin-only, as the server will enforce.

function normalizeName(name: string, categories: Category[], ignoreId?: string) {
  const trimmed = name.trim()

  if (!trimmed) {
    throw new ApiError('Category name is required.', 400)
  }

  if (trimmed.length > 50) {
    throw new ApiError('Category name must be 50 characters or fewer.', 400)
  }

  const duplicate = categories.some(
    (category) =>
      category.id !== ignoreId &&
      category.name.toLowerCase() === trimmed.toLowerCase(),
  )

  if (duplicate) {
    throw new ApiError('A category with this name already exists.', 409)
  }

  return trimmed
}

function findCategory(categories: Category[], id: string): Category {
  const category = categories.find((item) => item.id === id)

  if (!category) {
    throw new ApiError('Category not found.', 404)
  }

  return category
}

export const categoriesService = {
  create(name: string): Promise<Category> {
    return simulateRequest(() => {
      requireAdmin()
      const db = readDb()
      const category: Category = {
        id: crypto.randomUUID(),
        name: normalizeName(name, db.categories),
      }

      writeDb({ ...db, categories: [...db.categories, category] })
      return category
    })
  },

  list(): Promise<Category[]> {
    return simulateRequest(() =>
      [...readDb().categories].sort((a, b) => a.name.localeCompare(b.name)),
    )
  },

  listWithCounts(): Promise<CategoryWithCount[]> {
    return simulateRequest(() => {
      requireAdmin()
      const db = readDb()

      return [...db.categories]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((category) => ({
          ...category,
          expenseCount: db.expenses.filter(
            (expense) => expense.categoryId === category.id,
          ).length,
        }))
    })
  },

  // Expenses in the deleted category move to "Uncategorized" in the same
  // write, so no expense is ever left pointing at a missing category.
  remove(id: string): Promise<{ reassignedCount: number }> {
    return simulateRequest(() => {
      requireAdmin()
      const db = readDb()
      const category = findCategory(db.categories, id)
      const fallback = db.categories.find(
        (item) => item.name === UNCATEGORIZED_NAME,
      )

      if (category.name === UNCATEGORIZED_NAME || !fallback) {
        throw new ApiError('The Uncategorized category cannot be deleted.', 400)
      }

      let reassignedCount = 0
      const expenses = db.expenses.map((expense) => {
        if (expense.categoryId !== id) {
          return expense
        }

        reassignedCount += 1
        return { ...expense, categoryId: fallback.id }
      })

      writeDb({
        ...db,
        categories: db.categories.filter((item) => item.id !== id),
        expenses,
      })
      return { reassignedCount }
    })
  },

  rename(id: string, name: string): Promise<Category> {
    return simulateRequest(() => {
      requireAdmin()
      const db = readDb()
      const existing = findCategory(db.categories, id)

      if (existing.name === UNCATEGORIZED_NAME) {
        throw new ApiError('The Uncategorized category cannot be renamed.', 400)
      }

      const renamed = { ...existing, name: normalizeName(name, db.categories, id) }

      writeDb({
        ...db,
        categories: db.categories.map((item) =>
          item.id === id ? renamed : item,
        ),
      })
      return renamed
    })
  },
}
