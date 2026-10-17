import {
  CircleAlert,
  CircleCheck,
  type LucideIcon,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import type { BudgetStatus, MonthlySummary } from '../../types/domain'
import { Money } from '../ui/Money'

const statusStyles: Record<
  BudgetStatus,
  { badge: string; bar: string; icon: LucideIcon; label: string; text: string }
> = {
  approaching: {
    badge: 'bg-warn/10 text-warn',
    bar: 'bg-warn',
    icon: TriangleAlert,
    label: 'Approaching budget',
    text: 'text-warn',
  },
  over: {
    badge: 'bg-bad/10 text-bad',
    bar: 'bg-bad',
    icon: CircleAlert,
    label: 'Over budget',
    text: 'text-bad',
  },
  within: {
    badge: 'bg-ok/10 text-ok',
    bar: 'bg-ok',
    icon: CircleCheck,
    label: 'Within budget',
    text: 'text-ok',
  },
}

export function StatusBadge({ status }: { status: BudgetStatus }) {
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

// The fill grows from the left on mount. It scales on X (transform only), and
// with reduced motion it simply appears.
export function ProgressBar({
  percent,
  status,
}: {
  percent: number
  status: BudgetStatus
}) {
  const [shown, setShown] = useState(false)
  const clamped = Math.min(percent, 100)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      aria-label="Budget used"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={clamped}
      className="h-2.5 overflow-hidden rounded-full bg-raised"
      role="progressbar"
    >
      <div
        className={`h-full origin-left rounded-full transition-transform duration-700 ease-out motion-reduce:transition-none ${statusStyles[status].bar}`}
        style={{ transform: `scaleX(${shown ? clamped / 100 : 0})` }}
      />
    </div>
  )
}

export function remainingText(summary: MonthlySummary) {
  if (summary.remaining === null || summary.status === null) {
    return null
  }

  const amount = summary.remaining.replace(/^-/, '')

  return summary.status === 'over' ? (
    <>
      <Money amount={amount} /> over budget
    </>
  ) : (
    <>
      <Money amount={amount} /> left
    </>
  )
}

// The full budget picture: amounts, bar, status, and what is left.
export function BudgetProgress({ summary }: { summary: MonthlySummary }) {
  const { budget, percentSpent, status, totalSpent } = summary

  if (budget === null || percentSpent === null || status === null) {
    return null
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-3">Spent so far</p>
        <StatusBadge status={status} />
      </div>
      <p className="mt-2 font-display text-3xl font-semibold">
        <Money amount={totalSpent} />{' '}
        <span className="text-base font-normal text-ink-3">
          of <Money amount={budget} />
        </span>
      </p>
      <div className="mt-4">
        <ProgressBar percent={percentSpent} status={status} />
      </div>
      <div className="mt-2 flex justify-between gap-3 text-sm">
        <span className="text-ink-3">{percentSpent}% used</span>
        <span className={statusStyles[status].text}>{remainingText(summary)}</span>
      </div>
    </div>
  )
}
