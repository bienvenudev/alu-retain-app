import { formatMoney } from '../../lib/format'
import type { BudgetStatus, MonthlySummary } from '../../types/domain'

const statusStyles: Record<
  BudgetStatus,
  { badge: string; bar: string; label: string }
> = {
  approaching: {
    badge: 'bg-amber-100 text-amber-800',
    bar: 'bg-amber-500',
    label: 'Approaching budget',
  },
  over: {
    badge: 'bg-red-100 text-red-800',
    bar: 'bg-red-600',
    label: 'Over budget',
  },
  within: {
    badge: 'bg-green-100 text-green-800',
    bar: 'bg-green-600',
    label: 'Within budget',
  },
}

export function StatusBadge({ status }: { status: BudgetStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-bold ${statusStyles[status].badge}`}
    >
      {statusStyles[status].label}
    </span>
  )
}

export function BudgetProgress({ summary }: { summary: MonthlySummary }) {
  const { budget, percentSpent, status, totalSpent } = summary

  if (budget === null || percentSpent === null || status === null) {
    return null
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold">
          {formatMoney(totalSpent)} of {formatMoney(budget)} spent
        </p>
        <StatusBadge status={status} />
      </div>
      <div
        aria-label="Budget used"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.min(percentSpent, 100)}
        className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
      >
        <div
          className={`h-full rounded-full ${statusStyles[status].bar}`}
          style={{ width: `${Math.min(percentSpent, 100)}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-slate-500">{percentSpent}% of budget used</p>
    </div>
  )
}
