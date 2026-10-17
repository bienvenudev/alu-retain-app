import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

// Says what is missing and offers the next step.
export function EmptyState({
  action,
  description,
  icon: Icon,
  title,
}: {
  action?: ReactNode
  description: string
  icon: LucideIcon
  title: string
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong px-6 py-14 text-center">
      <span
        aria-hidden="true"
        className="grid size-12 place-items-center rounded-full bg-raised text-accent-ink"
      >
        <Icon className="size-6" />
      </span>
      <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-sm text-ink-2">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
