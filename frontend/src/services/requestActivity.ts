// Tracks whether the API is taking unusually long to answer. A free-tier server
// that has been idle needs up to a minute to wake up, and the UI uses this to
// say so instead of looking frozen.
const slowAfterMs = 5000

let pending = 0
let isSlow = false
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

function setSlow(value: boolean): void {
  if (isSlow !== value) {
    isSlow = value
    listeners.forEach((listener) => listener())
  }
}

export function requestStarted(): void {
  pending += 1

  if (pending === 1) {
    timer = setTimeout(() => setSlow(true), slowAfterMs)
  }
}

export function requestFinished(): void {
  pending = Math.max(0, pending - 1)

  if (pending === 0) {
    clearTimeout(timer)
    setSlow(false)
  }
}

// For useSyncExternalStore.
export function subscribeToSlowRequests(listener: () => void): () => void {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

export function getSlowRequestSnapshot(): boolean {
  return isSlow
}
