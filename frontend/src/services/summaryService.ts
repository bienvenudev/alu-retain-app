import type { MonthlySummary } from '../types/domain'
import { apiClient } from './apiClient'

export const summaryService = {
  async getMonthly(year: number, month: number): Promise<MonthlySummary> {
    const { data } = await apiClient.get<MonthlySummary>('/summary', {
      params: { month, year },
    })

    return data
  },
}
