import axios from 'axios'

import { tokenStorage } from '../auth/tokenStorage'
import { ApiError } from './apiError'

interface ErrorBody {
  error?: { details?: Record<string, string[]>; message?: string }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
})

let unauthorizedHandler: (() => void) | null = null

// AuthContext registers this so an expired or revoked session signs the user
// out wherever the 401 happens.
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get()

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

// Every failure leaves here as an ApiError with a message fit to show a user.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError<ErrorBody>(error)) {
      throw error
    }

    if (!error.response) {
      throw new ApiError(
        'Could not reach the server. Check your connection and try again.',
        0,
      )
    }

    const { data, status } = error.response
    const url = error.config?.url ?? ''
    const isCredentialRequest =
      url.startsWith('/auth/signin') || url.startsWith('/auth/signup')

    if (status === 401 && !isCredentialRequest) {
      unauthorizedHandler?.()
    }

    const details = data?.error?.details
    const firstDetail = details ? Object.values(details).flat()[0] : undefined

    throw new ApiError(
      firstDetail ??
        data?.error?.message ??
        'Something went wrong. Please try again.',
      status,
      details,
    )
  },
)
