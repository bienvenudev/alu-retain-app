import type { HTMLAttributes } from 'react'

// A raised surface with a hairline edge. Use it sparingly, for the few things
// that deserve to stand out from the page.
export function Panel({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface p-5 sm:p-6 ${className}`}
      {...props}
    />
  )
}
