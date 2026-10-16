import type { Budget } from '../types/domain'
import { apiClient } from './apiClient'

export const budgetsService = {
  async set(year: number, month: number, amount: string): Promise<Budget> {
    const { data } = await apiClient.put<Budget>(`/budgets/${year}/${month}`, {
      amount,
    })

    return data
  },
}
