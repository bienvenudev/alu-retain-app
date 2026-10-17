import { RotateCw } from 'lucide-react'

import { Button } from './Button'
import { Panel } from './Panel'

// A failed load: what went wrong, and a way to try again.
export function ErrorState({
  message,
  onRetry,
  title = 'We could not load this',
}: {
  message: string
  onRetry: () => void
  title?: string
}) {
  return (
    <Panel className="grid justify-items-start gap-3" role="alert">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="text-ink-2">{message}</p>
      <Button onClick={onRetry} variant="secondary">
        <RotateCw aria-hidden="true" className="size-4" />
        Try again
      </Button>
    </Panel>
  )
}
