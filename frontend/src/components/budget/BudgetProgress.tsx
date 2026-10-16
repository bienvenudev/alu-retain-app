import { CircleAlert, CircleCheck, type LucideIcon, TriangleAlert } from 'lucide-react'

import { formatMoney } from '../../lib/format'
import type { BudgetStatus, MonthlySummary } from '../../types/domain'

const statusStyles: Record<
  BudgetStatus,
  { badge: string; bar: string; icon: LucideIcon; label: string }
> = {
  approaching: {
    badge: 'bg-warn/10 text-warn',
    bar: 'bg-warn',
    icon: TriangleAlert,
    label: 'Approaching budget',
  },
  over: {
    badge: 'bg-bad/10 text-bad',
    bar: 'bg-bad',
    icon: CircleAlert,
    label: 'Over budget',
  },
  within: {
    badge: 'bg-ok/10 text-ok',
    bar: 'bg-ok',
    icon: CircleCheck,
    label: 'Within budget',
  },
}

function StatusBadge({ status }: { status: BudgetStatus }) {
  const { badge, icon: Icon, label } = statusStyles[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${badge}`}
    >
      <Icon aria-hidden="true" className="size-4" />
      {label}
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
        className="mt-3 h-3 overflow-hidden rounded-full bg-raised"
        role="progressbar"
      >
        <div
          className={`h-full rounded-full ${statusStyles[status].bar}`}
          style={{ width: `${Math.min(percentSpent, 100)}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-ink-3">{percentSpent}% of budget used</p>
    </div>
  )
}
