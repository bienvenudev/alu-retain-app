import { ApiError } from '../services/apiError'
import type { Category, Expense, PaymentMethod } from '../types/domain'
import seedData from './seed.json'

// Temporary in-browser database that stands in for the Express API. It is
// only used by the files in `src/services`; components never import it.

export interface StoredExpense {
  amount: string
  categoryId: string
  createdAt: string
  description: string | null
  expenseDate: string
  id: string
  notes: string | null
  paymentMethod: PaymentMethod
  title: string
  updatedAt: string
  userId: string
}

export interface StoredBudget {
  amount: string
  createdAt: string
  id: string
  month: number
  updatedAt: string
  userId: string
  year: number
}

interface MockDb {
  budgets: StoredBudget[]
  categories: Category[]
  expenses: StoredExpense[]
}

interface SeedExpense {
  amount: string
  categoryId: string
  daysAgo: number
  description: string | null
  notes: string | null
  paymentMethod: PaymentMethod
  title: string
  userId: string
}

interface SeedBudget {
  amount: string
  monthsAgo: number
  userId: string
}

const dbStorageKey = 'retain.mock.db.v3'

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

function buildSeedDb(): MockDb {
  const now = new Date()
  const timestamp = now.toISOString()
  const seedExpenses = seedData.expenses as SeedExpense[]
  const seedBudgets = seedData.budgets as SeedBudget[]

  return {
    budgets: seedBudgets.map(({ monthsAgo, ...budget }, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)

      return {
        ...budget,
        createdAt: timestamp,
        id: `budget-seed-${index + 1}`,
        month: date.getMonth() + 1,
        updatedAt: timestamp,
        year: date.getFullYear(),
      }
    }),
    categories: seedData.categories,
    expenses: seedExpenses.map(({ daysAgo, ...expense }, index) => {
      const date = new Date(now)
      date.setDate(now.getDate() - daysAgo)

      return {
        ...expense,
        createdAt: timestamp,
        expenseDate: toIsoDate(date),
        id: `expense-seed-${index + 1}`,
        updatedAt: timestamp,
      }
    }),
  }
}

function isMockDb(value: unknown): value is MockDb {
  if (!value || typeof value !== 'object') {
    return false
  }

  const db = value as Record<string, unknown>

  return (
    Array.isArray(db.budgets) &&
    Array.isArray(db.categories) &&
    Array.isArray(db.expenses)
  )
}

export function readDb(): MockDb {
  const stored = localStorage.getItem(dbStorageKey)

  if (stored) {
    try {
      const parsed: unknown = JSON.parse(stored)

      if (isMockDb(parsed)) {
        return parsed
      }
    } catch {
      // Fall through and reseed from the JSON file.
    }
  }

  const db = buildSeedDb()
  writeDb(db)
  return db
}

export function writeDb(db: MockDb): void {
  localStorage.setItem(dbStorageKey, JSON.stringify(db))
}

// Joins an expense with its category, like the API's `include: { category }`.
export function hydrateExpense(
  stored: StoredExpense,
  categories: Category[],
): Expense {
  const category = categories.find((item) => item.id === stored.categoryId)

  if (!category) {
    throw new ApiError('Expense references an unknown category.', 500)
  }

  return { ...stored, category }
}
