import type { ReactNode } from 'react'

export function StatCard({
  hint,
  label,
  value,
}: {
  hint?: ReactNode
  label: string
  value: ReactNode
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm text-ink-3">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1 truncate text-sm text-ink-3">{hint}</p>}
    </div>
  )
}
