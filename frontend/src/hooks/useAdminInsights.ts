import { adminService } from '../services/adminService'
import { useAsyncData } from './useAsyncData'

const fetchInsights = () => adminService.getInsights()

export function useAdminInsights() {
  return useAsyncData(fetchInsights)
}
