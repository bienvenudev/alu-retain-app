import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type UserRole = 'user' | 'admin'

export interface AuthUser {
  email: string
  id: string
  name: string
  role: UserRole
}

interface StoredUser extends AuthUser {
  password: string
}

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  signUp: (name: string, email: string, password: string) => Promise<void>
  user: AuthUser | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const currentUserStorageKey = 'retain.currentUser'
const usersStorageKey = 'retain.users'

function getStoredUsers(): StoredUser[] {
  const value = localStorage.getItem(usersStorageKey)

  if (!value) {
    return []
  }

  try {
    const users: unknown = JSON.parse(value)

    if (!Array.isArray(users)) {
      return []
    }

    return users.filter(isStoredUser)
  } catch {
    localStorage.removeItem(usersStorageKey)
    return []
  }
}

function isStoredUser(value: unknown): value is StoredUser {
  if (!value || typeof value !== 'object') {
    return false
  }

  const user = value as Record<string, unknown>

  return (
    typeof user.email === 'string' &&
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    (user.role === 'user' || user.role === 'admin') &&
    typeof user.password === 'string'
  )
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') {
    return false
  }

  const user = value as Record<string, unknown>

  return (
    typeof user.email === 'string' &&
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    (user.role === 'user' || user.role === 'admin')
  )
}

function toAuthUser({ password: _password, ...user }: StoredUser): AuthUser {
  return user
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem(currentUserStorageKey)

    if (storedUser) {
      try {
        const parsedUser: unknown = JSON.parse(storedUser)

        if (isAuthUser(parsedUser)) {
          setUser(parsedUser)
        }
      } catch {
        localStorage.removeItem(currentUserStorageKey)
      }
    }

    setIsLoading(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      isLoading,
      signIn: async (email, password) => {
        const normalizedEmail = normalizeEmail(email)
        const storedUser = getStoredUsers().find(
          (candidate) => candidate.email === normalizedEmail,
        )

        if (!storedUser || storedUser.password !== password) {
          throw new Error('The email or password is incorrect.')
        }

        const authenticatedUser = toAuthUser(storedUser)
        localStorage.setItem(
          currentUserStorageKey,
          JSON.stringify(authenticatedUser),
        )
        setUser(authenticatedUser)
      },
      signOut: () => {
        localStorage.removeItem(currentUserStorageKey)
        setUser(null)
      },
      signUp: async (name, email, password) => {
        const normalizedEmail = normalizeEmail(email)
        const users = getStoredUsers()

        if (users.some((candidate) => candidate.email === normalizedEmail)) {
          throw new Error('An account with this email already exists.')
        }

        const newUser: StoredUser = {
          email: normalizedEmail,
          id: crypto.randomUUID(),
          name: name.trim(),
          password,
          role: 'user',
        }

        localStorage.setItem(usersStorageKey, JSON.stringify([...users, newUser]))
        const authenticatedUser = toAuthUser(newUser)
        localStorage.setItem(
          currentUserStorageKey,
          JSON.stringify(authenticatedUser),
        )
        setUser(authenticatedUser)
      },
      user,
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }

  return context
}
