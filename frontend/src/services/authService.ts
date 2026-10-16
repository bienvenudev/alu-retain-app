import type { AuthUser } from '../types/domain'
import { apiClient } from './apiClient'

interface AuthResponse {
  token: string
  user: AuthUser
}

export const authService = {
  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me')

    return data.user
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/signin', {
      email,
      password,
    })

    return data
  },

  async signUp(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/signup', {
      email,
      name,
      password,
    })

    return data
  },
}
