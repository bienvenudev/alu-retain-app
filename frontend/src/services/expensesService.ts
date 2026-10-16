import { readDb, type StoredExpense, writeDb } from '../mock/db'
import { requireCurrentUserId, simulateRequest } from '../mock/simulate'
import type { Category, Expense, ExpenseInput } from '../types/domain'
import { ApiError } from './apiError'

// The function bodies are the only part that changes when the Express API
// replaces the mock. Ownership is enforced here the same way the server will.

function toExpense(stored: StoredExpense, categories: Category[]): Expense {
  const category = categories.find((item) => item.id === stored.categoryId)

  if (!category) {
    throw new ApiError('Expense references an unknown category.', 500)
  }

  return { ...stored, category }
}

function validate(input: ExpenseInput, categories: Category[]): void {
  const amount = Number(input.amount)

  if (!input.title.trim()) {
    throw new ApiError('Title is required.', 400)
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError('Amount must be greater than zero.', 400)
  }

  if (!categories.some((category) => category.id === input.categoryId)) {
    throw new ApiError('Choose a valid category.', 400)
  }
}

function findOwned(expenses: StoredExpense[], id: string, userId: string) {
  const expense = expenses.find(
    (item) => item.id === id && item.userId === userId,
  )

  if (!expense) {
    throw new ApiError('Expense not found.', 404)
  }

  return expense
}

export const expensesService = {
  create(input: ExpenseInput): Promise<Expense> {
    return simulateRequest(() => {
      const userId = requireCurrentUserId()
      const db = readDb()
      validate(input, db.categories)

      const timestamp = new Date().toISOString()
      const created: StoredExpense = {
        amount: Number(input.amount).toFixed(2),
        categoryId: input.categoryId,
        createdAt: timestamp,
        description: input.description?.trim() || null,
        expenseDate: input.expenseDate,
        id: crypto.randomUUID(),
        notes: input.notes?.trim() || null,
        paymentMethod: input.paymentMethod,
        title: input.title.trim(),
        updatedAt: timestamp,
        userId,
      }

      writeDb({ ...db, expenses: [...db.expenses, created] })
      return toExpense(created, db.categories)
    })
  },

  get(id: string): Promise<Expense> {
    return simulateRequest(() => {
      const userId = requireCurrentUserId()
      const db = readDb()

      return toExpense(findOwned(db.expenses, id, userId), db.categories)
    })
  },

  list(): Promise<Expense[]> {
    return simulateRequest(() => {
      const userId = requireCurrentUserId()
      const db = readDb()

      return db.expenses
        .filter((expense) => expense.userId === userId)
        .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))
        .map((expense) => toExpense(expense, db.categories))
    })
  },

  remove(id: string): Promise<void> {
    return simulateRequest(() => {
      const userId = requireCurrentUserId()
      const db = readDb()
      findOwned(db.expenses, id, userId)

      writeDb({
        ...db,
        expenses: db.expenses.filter((expense) => expense.id !== id),
      })
    })
  },

  update(id: string, input: ExpenseInput): Promise<Expense> {
    return simulateRequest(() => {
      const userId = requireCurrentUserId()
      const db = readDb()
      const existing = findOwned(db.expenses, id, userId)
      validate(input, db.categories)

      const updated: StoredExpense = {
        ...existing,
        amount: Number(input.amount).toFixed(2),
        categoryId: input.categoryId,
        description: input.description?.trim() || null,
        expenseDate: input.expenseDate,
        notes: input.notes?.trim() || null,
        paymentMethod: input.paymentMethod,
        title: input.title.trim(),
        updatedAt: new Date().toISOString(),
      }

      writeDb({
        ...db,
        expenses: db.expenses.map((expense) =>
          expense.id === id ? updated : expense,
        ),
      })
      return toExpense(updated, db.categories)
    })
  },
}
