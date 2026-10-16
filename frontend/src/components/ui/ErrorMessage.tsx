import { CircleAlert } from 'lucide-react'
import type { PropsWithChildren } from 'react'

export function ErrorMessage({ children }: PropsWithChildren) {
  return (
    <p className="flex items-start gap-2 text-sm text-bad" role="alert">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}
