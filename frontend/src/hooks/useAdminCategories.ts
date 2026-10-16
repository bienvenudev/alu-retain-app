import { categoriesService } from '../services/categoriesService'
import { useAsyncData } from './useAsyncData'

const fetchCategories = () => categoriesService.listWithCounts()

export function useAdminCategories() {
  return useAsyncData(fetchCategories)
}
