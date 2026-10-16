import { useState } from 'react'

import { BudgetForm } from '../components/budget/BudgetForm'
import { BudgetProgress } from '../components/budget/BudgetProgress'
import { MonthPicker } from '../components/MonthPicker'
import { Button } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { PageCard, PageHeader } from '../components/ui/PageCard'
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
    <PageCard wide>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Budget" />
        <MonthPicker />
      </div>

      <div className="mt-6 grid gap-6">
        {state.status === 'loading' && (
          <p aria-live="polite" className="text-slate-600" role="status">
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
              <p className="text-slate-600">
                You have not set a budget for this month. Set one below to start
                tracking your spending.
              </p>
            ) : (
              <BudgetProgress summary={state.data} />
            )}

            {notice && (
              <p
                className="rounded-lg bg-green-50 px-3.5 py-2.5 text-sm font-semibold text-green-700"
                role="status"
              >
                {notice}
              </p>
            )}

            <BudgetForm
              initialAmount={
                state.data.budget === null ? '' : String(Number(state.data.budget))
              }
              key={`${year}-${month}`}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </div>
    </PageCard>
  )
}
