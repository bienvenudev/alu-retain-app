import { hydrateExpense, readDb } from '../mock/db'
import { requireCurrentUserId, simulateRequest } from '../mock/simulate'
import { getBudgetStatus, getPercentSpent } from '../lib/budget'
import { fromCents, toCents } from '../lib/money'
import type { CategoryTotal, MonthlySummary } from '../types/domain'
import { assertValidPeriod } from './period'

const recentLimit = 5

// The function body is the only part that changes when the Express API
// replaces the mock (a GET to /api/summary?year=&month=).
export const summaryService = {
  getMonthly(year: number, month: number): Promise<MonthlySummary> {
    return simulateRequest(() => {
      const userId = requireCurrentUserId()
      assertValidPeriod(year, month)

      const db = readDb()
      const prefix = `${year}-${String(month).padStart(2, '0')}-`
      const expenses = db.expenses
        .filter(
          (expense) =>
            expense.userId === userId && expense.expenseDate.startsWith(prefix),
        )
        .map((expense) => hydrateExpense(expense, db.categories))

      const totalCents = expenses.reduce(
        (sum, expense) => sum + toCents(expense.amount),
        0,
      )

      const totals = new Map<string, { cents: number; item: CategoryTotal }>()
      for (const expense of expenses) {
        const entry = totals.get(expense.category.id) ?? {
          cents: 0,
          item: { category: expense.category, count: 0, total: '0.00' },
        }
        entry.cents += toCents(expense.amount)
        entry.item = {
          ...entry.item,
          count: entry.item.count + 1,
          total: fromCents(entry.cents),
        }
        totals.set(expense.category.id, entry)
      }

      const highestExpense = expenses.reduce<(typeof expenses)[number] | null>(
        (highest, expense) =>
          !highest || toCents(expense.amount) > toCents(highest.amount)
            ? expense
            : highest,
        null,
      )

      const budget = db.budgets.find(
        (candidate) =>
          candidate.userId === userId &&
          candidate.year === year &&
          candidate.month === month,
      )
      const budgetCents = budget ? toCents(budget.amount) : null

      return {
        budget: budget?.amount ?? null,
        byCategory: [...totals.values()]
          .sort((a, b) => b.cents - a.cents)
          .map((entry) => entry.item),
        expenseCount: expenses.length,
        highestExpense,
        month,
        percentSpent:
          budgetCents === null ? null : getPercentSpent(totalCents, budgetCents),
        recentExpenses: [...expenses]
          .sort(
            (a, b) =>
              b.expenseDate.localeCompare(a.expenseDate) ||
              b.createdAt.localeCompare(a.createdAt),
          )
          .slice(0, recentLimit),
        remaining:
          budgetCents === null ? null : fromCents(budgetCents - totalCents),
        status:
          budgetCents === null ? null : getBudgetStatus(totalCents, budgetCents),
        totalSpent: fromCents(totalCents),
        year,
      }
    })
  },
}
