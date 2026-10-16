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
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  )
}
