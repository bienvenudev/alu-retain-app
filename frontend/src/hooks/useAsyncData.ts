import { useCallback, useEffect, useRef, useState } from 'react'

import { getErrorMessage } from '../services/apiError'

export type AsyncState<T> =
  | { status: 'loading' }
  | { message: string; status: 'error' }
  | { data: T; status: 'success' }

// Loads data through a service function and exposes loading / error / success.
// `fetcher` must be referentially stable (a module-level function or
// `useCallback`), because a new function identity triggers a reload.
// `reload` always keeps the current data on screen while refetching. When the
// fetcher changes (a different month, a new filter), the old data is dropped
// and the loading state shows, unless `keepPreviousData` is set.
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  { keepPreviousData = false }: { keepPreviousData?: boolean } = {},
) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const previousFetcher = useRef(fetcher)

  useEffect(() => {
    let ignore = false
    const fetcherChanged = previousFetcher.current !== fetcher
    previousFetcher.current = fetcher

    setState((previous) => {
      return previous.status === 'success' && (keepPreviousData || !fetcherChanged)
        ? previous
        : { status: 'loading' }
    })
    setIsRefreshing(true)

    fetcher()
      .then((data) => {
        if (!ignore) {
          setState({ data, status: 'success' })
          setIsRefreshing(false)
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setState({ message: getErrorMessage(error), status: 'error' })
          setIsRefreshing(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [fetcher, keepPreviousData, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  // True while data is being fetched again; `state` keeps the old data until
  // the new data arrives, so a list can dim instead of disappearing.
  return { isRefreshing, reload, state }
}
