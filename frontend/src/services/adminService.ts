import type { AdminInsights } from '../types/domain'
import { apiClient } from './apiClient'

export const adminService = {
  async getInsights(): Promise<AdminInsights> {
    const { data } = await apiClient.get<AdminInsights>('/admin/insights')

    return data
  },
}
