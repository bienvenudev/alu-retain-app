import { ChevronLeft } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'

// A quiet link back to the list a screen came from.
export function BackLink({ children, to }: PropsWithChildren<{ to: string }>) {
  return (
    <Link
      className="mb-4 inline-flex items-center gap-1 text-sm text-ink-3 no-underline transition-colors duration-150 hover:text-ink"
      to={to}
    >
      <ChevronLeft aria-hidden="true" className="size-4" />
      {children}
    </Link>
  )
}
