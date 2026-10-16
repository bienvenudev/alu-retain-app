import { usersStorageKey } from '../auth/storageKeys'

// Temporary accounts for the mock API. The sign-in prototype in
// `auth/AuthContext.tsx` and the admin insights service both read these.
export interface MockAccount {
  createdAt?: string
  email: string
  id: string
  name: string
  password: string
  role: 'admin' | 'user'
}

export const demoUsers: MockAccount[] = [
  {
    createdAt: '2026-01-01T08:00:00.000Z',
    email: 'demo@retain.app',
    id: 'user-demo',
    name: 'Demo User',
    password: 'demo1234',
    role: 'user',
  },
  {
    createdAt: '2026-01-01T07:00:00.000Z',
    email: 'admin@retain.app',
    id: 'user-admin',
    name: 'Demo Admin',
    password: 'admin1234',
    role: 'admin',
  },
]

function isMockAccount(value: unknown): value is MockAccount {
  if (!value || typeof value !== 'object') {
    return false
  }

  const account = value as Record<string, unknown>

  return (
    typeof account.email === 'string' &&
    typeof account.id === 'string' &&
    typeof account.name === 'string' &&
    typeof account.password === 'string' &&
    (account.role === 'user' || account.role === 'admin')
  )
}

export function listAccounts(): MockAccount[] {
  const stored = localStorage.getItem(usersStorageKey)
  let registered: MockAccount[] = []

  if (stored) {
    try {
      const parsed: unknown = JSON.parse(stored)
      registered = Array.isArray(parsed) ? parsed.filter(isMockAccount) : []
    } catch {
      registered = []
    }
  }

  return [...demoUsers, ...registered]
}
