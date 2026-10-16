import { readDb } from '../mock/db'
import { simulateRequest } from '../mock/simulate'
import type { Category } from '../types/domain'

// The function bodies are the only part that changes when the Express API
// replaces the mock: each one becomes a typed Axios call.
export const categoriesService = {
  list(): Promise<Category[]> {
    return simulateRequest(() =>
      [...readDb().categories].sort((a, b) => a.name.localeCompare(b.name)),
    )
  },
}
