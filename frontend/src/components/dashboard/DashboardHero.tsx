import { ButtonLink } from '../ui/Button'
import { Money } from '../ui/Money'
import { Stat } from '../ui/Stat'
import { useCountUp } from '../../hooks/useCountUp'
import { formatMoney, formatNumber, splitMoney } from '../../lib/format'
import type { MonthlySummary } from '../../types/domain'
import { ProgressBar, remainingText, StatusBadge } from '../budget/BudgetProgress'

// Very large totals get a smaller figure so they never push the page wider.
function figureSize(value: string): string {
  if (value.length <= 9) {
    return 'text-5xl sm:text-6xl'
  }

  return value.length <= 13 ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'
}

// The loud moment of the dashboard: the month's spending as one large figure,
// its place in the budget, and the supporting numbers beneath.
export function DashboardHero({
  animate,
  monthLabel,
  summary,
}: {
  animate: boolean
  monthLabel: string
  summary: MonthlySummary
}) {
  const spent = Number(summary.totalSpent)
  const counted = useCountUp(spent, animate)
  const money = splitMoney(summary.totalSpent)
  const shown =
    counted === spent ? money.value : formatNumber(Math.round(counted))
  const { budget, highestExpense, percentSpent, status } = summary

  return (
    <section
      aria-labelledby="hero-label"
      className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-28 size-80 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-accent)_24%,transparent),transparent)]"
      />

      <p className="relative text-sm text-ink-3" id="hero-label">
        Spent in {monthLabel}
      </p>
      <p
        className={`relative mt-2 font-display font-semibold tabular-nums ${figureSize(money.value)}`}
      >
        <span aria-hidden="true" className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-[0.5em] font-medium text-ink-3">
            {money.currency}
          </span>
          <span>{shown}</span>
        </span>
        <span className="sr-only">{formatMoney(summary.totalSpent)}</span>
      </p>

      <div className="relative mt-6">
        {budget !== null && percentSpent !== null && status !== null ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge status={status} />
              <p className="text-sm text-ink-3">
                {percentSpent}% of <Money amount={budget} />
              </p>
            </div>
            <div className="mt-3">
              <ProgressBar percent={percentSpent} status={status} />
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-ink-2">
              No budget set for this month, so there is nothing to compare
              against yet.
            </p>
            <ButtonLink size="sm" to="/budget" variant="secondary">
              Set a budget
            </ButtonLink>
          </div>
        )}
      </div>

      <dl className="relative mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
        <Stat label="Budget">
          {budget === null ? (
            <span className="text-ink-3">Not set</span>
          ) : (
            <Money amount={budget} />
          )}
        </Stat>
        <Stat label={status === 'over' ? 'Over budget by' : 'Remaining'}>
          {budget === null ? (
            <span className="text-ink-3">None</span>
          ) : (
            remainingText(summary)
          )}
        </Stat>
        <Stat hint={highestExpense?.title} label="Highest expense">
          {highestExpense ? <Money amount={highestExpense.amount} /> : 'None'}
        </Stat>
        <Stat label="Expenses">{summary.expenseCount}</Stat>
      </dl>
    </section>
  )
}
