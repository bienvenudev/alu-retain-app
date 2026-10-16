import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { ApiError } from '../services/apiError'
import { setUnauthorizedHandler } from '../services/apiClient'
import { authService } from '../services/authService'
import type { AuthUser, UserRole } from '../types/domain'
import { tokenStorage } from './tokenStorage'

export type { AuthUser, UserRole }

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  signUp: (name: string, email: string, password: string) => Promise<void>
  user: AuthUser | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null)
  // Only wait on the server when there is a saved session to check.
  const [isLoading, setIsLoading] = useState(() => tokenStorage.get() !== null)

  // Restore the session: ask the server who the saved token belongs to.
  useEffect(() => {
    if (!tokenStorage.get()) {
      return
    }

    let ignore = false

    authService
      .me()
      .then((currentUser) => {
        if (!ignore) {
          setUser(currentUser)
        }
      })
      .catch((error: unknown) => {
        // Keep the token if the server was merely unreachable.
        if (error instanceof ApiError && error.status === 401) {
          tokenStorage.clear()
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  // Any request answered with 401 (expired or revoked token) ends the session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStorage.clear()
      setUser(null)
    })

    return () => setUnauthorizedHandler(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      isLoading,
      signIn: async (email, password) => {
        const session = await authService.signIn(email, password)
        tokenStorage.set(session.token)
        setUser(session.user)
      },
      signOut: () => {
        tokenStorage.clear()
        setUser(null)
      },
      signUp: async (name, email, password) => {
        const session = await authService.signUp(name, email, password)
        tokenStorage.set(session.token)
        setUser(session.user)
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
