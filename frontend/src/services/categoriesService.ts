import type { Category, CategoryWithCount } from '../types/domain'
import { apiClient } from './apiClient'

const adminPath = (id: string) =>
  `/admin/categories/${encodeURIComponent(id)}`

// The create, rename, delete, and count calls are admin-only on the server.
export const categoriesService = {
  async create(name: string): Promise<Category> {
    const { data } = await apiClient.post<Category>('/admin/categories', {
      name,
    })

    return data
  },

  async list(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories')

    return data
  },

  async listWithCounts(): Promise<CategoryWithCount[]> {
    const { data } = await apiClient.get<CategoryWithCount[]>(
      '/admin/categories',
    )

    return data
  },

  // The server moves the category's expenses to "Uncategorized".
  async remove(id: string): Promise<{ reassignedCount: number }> {
    const { data } = await apiClient.delete<{ reassignedCount: number }>(
      adminPath(id),
    )

    return data
  },

  async rename(id: string, name: string): Promise<Category> {
    const { data } = await apiClient.patch<Category>(adminPath(id), { name })

    return data
  },
}
