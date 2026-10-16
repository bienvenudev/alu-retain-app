import type {
  Expense,
  ExpenseInput,
  ExpenseQuery,
  PaginatedResult,
} from '../types/domain'
import { apiClient } from './apiClient'

const path = (id: string) => `/expenses/${encodeURIComponent(id)}`

export const expensesService = {
  async create(input: ExpenseInput): Promise<Expense> {
    const { data } = await apiClient.post<Expense>('/expenses', input)

    return data
  },

  async get(id: string): Promise<Expense> {
    const { data } = await apiClient.get<Expense>(path(id))

    return data
  },

  // Undefined query fields are left out of the URL.
  async list(query: ExpenseQuery): Promise<PaginatedResult<Expense>> {
    const { data } = await apiClient.get<PaginatedResult<Expense>>('/expenses', {
      params: query,
    })

    return data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(path(id))
  },

  async update(id: string, input: ExpenseInput): Promise<Expense> {
    const { data } = await apiClient.put<Expense>(path(id), input)

    return data
  },
}
