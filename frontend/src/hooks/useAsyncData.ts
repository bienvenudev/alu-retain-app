import { useCallback, useEffect, useState } from 'react'

import { getErrorMessage } from '../services/apiError'

export type AsyncState<T> =
  | { status: 'loading' }
  | { message: string; status: 'error' }
  | { data: T; status: 'success' }

// Loads data through a service function and exposes loading / error / success.
// `fetcher` must be referentially stable (a module-level function or
// `useCallback`), because a new function identity triggers a reload.
// A reload keeps the previous data on screen instead of blanking it.
export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false
    setState((previous) =>
      previous.status === 'success' ? previous : { status: 'loading' },
    )

    fetcher()
      .then((data) => {
        if (!ignore) {
          setState({ data, status: 'success' })
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setState({ message: getErrorMessage(error), status: 'error' })
        }
      })

    return () => {
      ignore = true
    }
  }, [fetcher, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { reload, state }
}
