import { Wallet } from 'lucide-react'
import { useState } from 'react'

import { BudgetForm } from '../components/budget/BudgetForm'
import { BudgetProgress } from '../components/budget/BudgetProgress'
import { MonthPicker } from '../components/MonthPicker'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Notice } from '../components/ui/Notice'
import { Page, PageHeader } from '../components/ui/Page'
import { Panel } from '../components/ui/Panel'
import { Skeleton } from '../components/ui/Skeleton'
import { useMonthlySummary } from '../hooks/useMonthlySummary'
import { useSelectedMonth } from '../month/SelectedMonthContext'
import { budgetsService } from '../services/budgetsService'

export function BudgetPage() {
  const { month, year } = useSelectedMonth()
  const { reload, state } = useMonthlySummary(year, month)
  const [notice, setNotice] = useState<string | null>(null)
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  async function handleSubmit(amount: string) {
    await budgetsService.set(year, month, amount)
    setNotice(`Budget for ${monthLabel} saved.`)
    reload()
  }

  return (
    <Page wide>
      <PageHeader
        actions={<MonthPicker />}
        description="Set what you plan to spend each month and watch how it is going."
        title="Budget"
      />

      {state.status === 'loading' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <p className="sr-only" role="status">
            Loading your budget…
          </p>
          <Panel>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-6 h-11 w-full" />
            <Skeleton className="mt-4 h-11 w-32" />
          </Panel>
          <Panel>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-10 w-56" />
            <Skeleton className="mt-6 h-2.5 w-full rounded-full" />
          </Panel>
        </div>
      )}

      {state.status === 'error' && (
        <ErrorState
          message={state.message}
          onRetry={reload}
          title="We could not load your budget"
        />
      )}

      {state.status === 'success' && (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Panel>
            <h2 className="font-display text-xl font-semibold">
              Budget for {monthLabel}
            </h2>
            <p className="mt-1.5 mb-6 text-ink-2">
              {state.data.budget === null
                ? 'You have not set a budget for this month yet.'
                : 'Change the amount at any time.'}
            </p>
            {notice && (
              <div className="mb-5">
                <Notice onDismiss={() => setNotice(null)}>{notice}</Notice>
              </div>
            )}
            <BudgetForm
              initialAmount={
                state.data.budget === null ? '' : String(Number(state.data.budget))
              }
              key={`${year}-${month}`}
              onSubmit={handleSubmit}
            />
          </Panel>

          {state.data.budget === null ? (
            <EmptyState
              description="Once you set a budget, you will see how much of it you have spent here."
              icon={Wallet}
              title="Nothing to track yet"
            />
          ) : (
            <Panel>
              <BudgetProgress summary={state.data} />
            </Panel>
          )}
        </div>
      )}
    </Page>
  )
}
