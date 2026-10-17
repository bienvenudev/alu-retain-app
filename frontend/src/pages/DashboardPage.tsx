import { Receipt } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useAuth } from '../auth/AuthContext'
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown'
import { DashboardHero } from '../components/dashboard/DashboardHero'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { RecentExpenses } from '../components/dashboard/RecentExpenses'
import { MonthPicker } from '../components/MonthPicker'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Page, PageHeader } from '../components/ui/Page'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMonthlySummary } from '../hooks/useMonthlySummary'
import { useSelectedMonth } from '../month/SelectedMonthContext'
import type { MonthlySummary } from '../types/domain'

// The entrance plays once per visit to the app, not on every month change.
let entrancePlayed = false

function DashboardContent({
  monthLabel,
  summary,
}: {
  monthLabel: string
  summary: MonthlySummary
}) {
  const [animate] = useState(() => !entrancePlayed)

  useEffect(() => {
    entrancePlayed = true
  }, [])

  const rise = (delayMs: number) =>
    animate
      ? { className: 'motion-safe:animate-rise', style: { animationDelay: `${delayMs}ms` } }
      : {}

  return (
    <div>
      <div {...rise(0)}>
        <DashboardHero animate={animate} monthLabel={monthLabel} summary={summary} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section
          aria-labelledby="by-category"
          className={`border-t border-line pt-6 ${rise(90).className ?? ''}`}
          style={rise(90).style}
        >
          <h2 className="mb-5 font-display text-xl font-semibold" id="by-category">
            Spending by category
          </h2>
          <CategoryBreakdown
            items={summary.byCategory}
            totalSpent={summary.totalSpent}
          />
        </section>
        <section
          aria-labelledby="recent"
          className={`border-t border-line pt-6 ${rise(180).className ?? ''}`}
          style={rise(180).style}
        >
          <h2 className="mb-5 font-display text-xl font-semibold" id="recent">
            Recent expenses
          </h2>
          <RecentExpenses expenses={summary.recentExpenses} />
        </section>
      </div>
    </div>
  )
}

export function DashboardPage() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const { month, year } = useSelectedMonth()
  const { reload, state } = useMonthlySummary(year, month)
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  const firstName = user?.name.split(' ')[0]

  return (
    <Page wide>
      <PageHeader
        actions={<MonthPicker />}
        description={firstName ? `Welcome back, ${firstName}.` : undefined}
        title="Dashboard"
      />

      {state.status === 'loading' && <DashboardSkeleton />}

      {state.status === 'error' && (
        <ErrorState
          message={state.message}
          onRetry={reload}
          title="We could not load your summary"
        />
      )}

      {state.status === 'success' && state.data.expenseCount === 0 && (
        <EmptyState
          action={<ButtonLink to="/expenses/new">Add an expense</ButtonLink>}
          description="Add your first expense for this month and your spending summary will appear here."
          icon={Receipt}
          title={`No expenses in ${monthLabel}`}
        />
      )}

      {state.status === 'success' && state.data.expenseCount > 0 && (
        <DashboardContent monthLabel={monthLabel} summary={state.data} />
      )}
    </Page>
  )
}
