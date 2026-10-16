import { useCallback } from 'react'

import { expensesService } from '../services/expensesService'
import type { ExpenseQuery } from '../types/domain'
import { useAsyncData } from './useAsyncData'

// `query` must be referentially stable (for example a memoized selector
// result), because a new object triggers a reload.
export function useExpenses(query: ExpenseQuery) {
  const fetchExpenses = useCallback(() => expensesService.list(query), [query])

  return useAsyncData(fetchExpenses)
}
