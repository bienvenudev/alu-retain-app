import type { User } from '@prisma/client'

export interface UserResponse {
  email: string
  id: string
  name: string
  role: 'admin' | 'user'
}

export function serializeUser(
  user: Pick<User, 'email' | 'id' | 'name' | 'role'>,
): UserResponse {
  return {
    email: user.email,
    id: user.id,
    name: user.name,
    role: user.role === 'ADMIN' ? 'admin' : 'user',
  }
}
