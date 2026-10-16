import { currentUserStorageKey } from '../auth/storageKeys'
import { ApiError } from '../services/apiError'

const latencyMs = 350
const failFlagKey = 'retain.mock.fail'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Runs a handler the way a network call would: after a short delay, and
// failing on demand. Set `localStorage['retain.mock.fail'] = '1'` in the
// browser console to see every error state in the UI.
export async function simulateRequest<T>(handler: () => T): Promise<T> {
  await wait(latencyMs)

  if (localStorage.getItem(failFlagKey) === '1') {
    throw new ApiError('The server could not be reached. Please try again.', 503)
  }

  return handler()
}

// Stands in for the server reading the user from an auth token.
export function requireCurrentUserId(): string {
  const stored = localStorage.getItem(currentUserStorageKey)

  if (stored) {
    try {
      const user: unknown = JSON.parse(stored)

      if (user && typeof user === 'object' && 'id' in user) {
        const { id } = user as { id: unknown }

        if (typeof id === 'string') {
          return id
        }
      }
    } catch {
      // Treated as signed out below.
    }
  }

  throw new ApiError('You must be signed in.', 401)
}
