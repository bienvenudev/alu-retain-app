import { categoriesService } from '../services/categoriesService'
import { useAsyncData } from './useAsyncData'

const fetchCategories = () => categoriesService.list()

export function useCategories() {
  return useAsyncData(fetchCategories)
}
