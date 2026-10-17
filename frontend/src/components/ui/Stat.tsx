import type { ReactNode } from 'react'

// One labelled figure. Use inside a <dl> so the label and value stay paired.
export function Stat({
  children,
  hint,
  label,
}: {
  children: ReactNode
  hint?: string
  label: string
}) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-ink-3">{label}</dt>
      <dd className="mt-1 text-lg font-semibold">
        {children}
        {hint && (
          <span className="mt-0.5 block truncate text-sm font-normal text-ink-3">
            {hint}
          </span>
        )}
      </dd>
    </div>
  )
}
