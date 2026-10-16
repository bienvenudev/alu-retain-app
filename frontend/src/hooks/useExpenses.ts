import { useCallback, useEffect, useState } from 'react'

import { expensesService } from '../services/expensesService'
import { getErrorMessage } from '../services/apiError'
import type { Expense } from '../types/domain'

type ExpensesState =
  | { status: 'loading' }
  | { message: string; status: 'error' }
  | { expenses: Expense[]; status: 'success' }

export function useExpenses() {
  const [state, setState] = useState<ExpensesState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false
    setState({ status: 'loading' })

    expensesService
      .list()
      .then((expenses) => {
        if (!ignore) {
          setState({ expenses, status: 'success' })
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setState({ message: getErrorMessage(error), status: 'error' })
        }
      })

    return () => {
      ignore = true
    }
  }, [reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { reload, state }
}
