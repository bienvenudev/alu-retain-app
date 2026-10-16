import { hydrateExpense, readDb } from '../mock/db'
import { requireAdmin, simulateRequest } from '../mock/simulate'
import { listAccounts } from '../mock/users'
import { fromCents, toCents } from '../lib/money'
import type { AdminInsights, CategoryTotal } from '../types/domain'

const listLimit = 5

// The function body is the only part that changes when the Express API
// replaces the mock (a GET to /api/admin/insights, admin-only).
export const adminService = {
  getInsights(): Promise<AdminInsights> {
    return simulateRequest(() => {
      requireAdmin()
      const db = readDb()
      const accounts = listAccounts()
      const userNames = new Map(accounts.map((account) => [account.id, account.name]))

      const now = new Date()
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-`

      const categoryTotals = db.categories
        .map((category) => {
          const expenses = db.expenses.filter(
            (expense) => expense.categoryId === category.id,
          )
          const cents = expenses.reduce(
            (sum, expense) => sum + toCents(expense.amount),
            0,
          )

          return {
            cents,
            item: {
              category,
              count: expenses.length,
              total: fromCents(cents),
            } satisfies CategoryTotal,
          }
        })
        .sort((a, b) => b.cents - a.cents || a.item.category.name.localeCompare(b.item.category.name))
        .map((entry) => entry.item)

      const totalCents = db.expenses.reduce(
        (sum, expense) => sum + toCents(expense.amount),
        0,
      )

      return {
        bottomCategories: categoryTotals.slice(-listLimit).reverse(),
        categoryTotals,
        currentMonthExpenseCount: db.expenses.filter((expense) =>
          expense.expenseDate.startsWith(monthPrefix),
        ).length,
        recentExpenses: [...db.expenses]
          .sort(
            (a, b) =>
              b.createdAt.localeCompare(a.createdAt) ||
              b.expenseDate.localeCompare(a.expenseDate),
          )
          .slice(0, listLimit)
          .map((expense) => ({
            ...hydrateExpense(expense, db.categories),
            userName: userNames.get(expense.userId) ?? 'Unknown user',
          })),
        recentUsers: [...accounts]
          .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
          .slice(0, listLimit)
          .map((account) => ({
            createdAt: account.createdAt ?? '',
            email: account.email,
            id: account.id,
            name: account.name,
            role: account.role,
          })),
        topCategories: categoryTotals.slice(0, listLimit),
        totalExpenseCount: db.expenses.length,
        totalSpent: fromCents(totalCents),
        userCount: accounts.length,
      }
    })
  },
}
