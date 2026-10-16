import type { BudgetStatus } from '../types/domain'

// Thresholds: under 80% spent is within budget, 80% up to (not including)
// 100% is approaching, and 100% or more is over. Integer cents keep the
// comparisons exact.
export function getBudgetStatus(
  spentCents: number,
  budgetCents: number,
): BudgetStatus {
  if (spentCents >= budgetCents) {
    return 'over'
  }

  if (spentCents * 100 >= budgetCents * 80) {
    return 'approaching'
  }

  return 'within'
}

// Rounded down so 99.9% never reads as 100% while the budget is still intact.
export function getPercentSpent(spentCents: number, budgetCents: number) {
  return Math.floor((spentCents * 100) / budgetCents)
}
