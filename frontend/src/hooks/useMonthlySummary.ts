import { useCallback } from 'react'

import { summaryService } from '../services/summaryService'
import { useAsyncData } from './useAsyncData'

export function useMonthlySummary(year: number, month: number) {
  const fetchSummary = useCallback(
    () => summaryService.getMonthly(year, month),
    [year, month],
  )

  return useAsyncData(fetchSummary)
}
