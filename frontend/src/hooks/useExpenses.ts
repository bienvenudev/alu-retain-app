import { expensesService } from '../services/expensesService'
import { useAsyncData } from './useAsyncData'

const fetchExpenses = () => expensesService.list()

export function useExpenses() {
  return useAsyncData(fetchExpenses)
}
