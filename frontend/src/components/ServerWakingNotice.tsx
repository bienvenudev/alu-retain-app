import { useSyncExternalStore } from 'react'

import {
  getSlowRequestSnapshot,
  subscribeToSlowRequests,
} from '../services/requestActivity'

export function ServerWakingNotice() {
  const isSlow = useSyncExternalStore(
    subscribeToSlowRequests,
    getSlowRequestSnapshot,
  )

  if (!isSlow) {
    return null
  }

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900"
      role="status"
    >
      The server is waking up after being idle. This can take up to a minute.
    </div>
  )
}
