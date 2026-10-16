import { useState } from 'react'

import { BudgetForm } from '../components/budget/BudgetForm'
import { BudgetProgress } from '../components/budget/BudgetProgress'
import { MonthPicker } from '../components/MonthPicker'
import { Button } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Notice } from '../components/ui/Notice'
import { Page, PageHeader } from '../components/ui/Page'
import { Panel } from '../components/ui/Panel'
import { useMonthlySummary } from '../hooks/useMonthlySummary'
import { useSelectedMonth } from '../month/SelectedMonthContext'
import { budgetsService } from '../services/budgetsService'

export function BudgetPage() {
  const { month, year } = useSelectedMonth()
  const { reload, state } = useMonthlySummary(year, month)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(amount: string) {
    await budgetsService.set(year, month, amount)
    setNotice('Budget saved.')
    reload()
  }

  return (
    <Page wide>
      <PageHeader actions={<MonthPicker />} title="Budget" />

      <div className="grid gap-6">
        {state.status === 'loading' && (
          <p aria-live="polite" className="text-ink-2" role="status">
            Loading your budget…
          </p>
        )}

        {state.status === 'error' && (
          <div className="grid justify-start gap-3">
            <ErrorMessage>{state.message}</ErrorMessage>
            <Button onClick={reload}>Try again</Button>
          </div>
        )}

        {state.status === 'success' && (
          <>
            {state.data.budget === null ? (
              <p className="text-ink-2">
                You have not set a budget for this month. Set one below to start
                tracking your spending.
              </p>
            ) : (
              <BudgetProgress summary={state.data} />
            )}

            {notice && <Notice onDismiss={() => setNotice(null)}>{notice}</Notice>}

            <Panel className="max-w-md">
              <BudgetForm
                initialAmount={
                  state.data.budget === null ? '' : String(Number(state.data.budget))
                }
                key={`${year}-${month}`}
                onSubmit={handleSubmit}
              />
            </Panel>
          </>
        )}
      </div>
    </Page>
  )
}
