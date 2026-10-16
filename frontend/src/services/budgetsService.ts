import { readDb, writeDb } from '../mock/db'
import { requireCurrentUserId, simulateRequest } from '../mock/simulate'
import type { Budget } from '../types/domain'
import { ApiError } from './apiError'
import { assertValidPeriod } from './period'

// The function bodies are the only part that changes when the Express API
// replaces the mock (a PUT to /api/budgets/:year/:month).
export const budgetsService = {
  set(year: number, month: number, amount: string): Promise<Budget> {
    return simulateRequest(() => {
      const userId = requireCurrentUserId()
      assertValidPeriod(year, month)

      if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        throw new ApiError('Budget must be greater than zero.', 400)
      }

      const db = readDb()
      const timestamp = new Date().toISOString()
      const existing = db.budgets.find(
        (budget) =>
          budget.userId === userId &&
          budget.year === year &&
          budget.month === month,
      )
      const saved = {
        amount: Number(amount).toFixed(2),
        createdAt: existing?.createdAt ?? timestamp,
        id: existing?.id ?? crypto.randomUUID(),
        month,
        updatedAt: timestamp,
        userId,
        year,
      }

      writeDb({
        ...db,
        budgets: existing
          ? db.budgets.map((budget) => (budget.id === saved.id ? saved : budget))
          : [...db.budgets, saved],
      })

      return {
        amount: saved.amount,
        id: saved.id,
        month,
        updatedAt: saved.updatedAt,
        year,
      }
    })
  },
}
