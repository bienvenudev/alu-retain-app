import { Link } from 'react-router-dom'

import { BudgetProgress } from '../components/budget/BudgetProgress'
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown'
import { RecentExpenses } from '../components/dashboard/RecentExpenses'
import { MonthPicker } from '../components/MonthPicker'
import { Button, ButtonLink } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Page, PageHeader } from '../components/ui/Page'
import { StatCard } from '../components/ui/StatCard'
import { useMonthlySummary } from '../hooks/useMonthlySummary'
import { formatMoney } from '../lib/format'
import { useSelectedMonth } from '../month/SelectedMonthContext'

export function DashboardPage() {
  const { month, year } = useSelectedMonth()
  const { reload, state } = useMonthlySummary(year, month)

  return (
    <Page wide>
      <PageHeader actions={<MonthPicker />} title="Dashboard" />

      <div>
        {state.status === 'loading' && (
          <p aria-live="polite" className="text-ink-2" role="status">
            Loading your summary…
          </p>
        )}

        {state.status === 'error' && (
          <div className="grid justify-start gap-3">
            <ErrorMessage>{state.message}</ErrorMessage>
            <Button onClick={reload}>Try again</Button>
          </div>
        )}

        {state.status === 'success' && state.data.expenseCount === 0 && (
          <div className="grid justify-start gap-3">
            <p className="text-ink-2">
              No expenses recorded for this month yet.
            </p>
            <ButtonLink to="/expenses/new">Add expense</ButtonLink>
          </div>
        )}

        {state.status === 'success' && state.data.expenseCount > 0 && (
          <div className="grid gap-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                hint={`${state.data.expenseCount} ${
                  state.data.expenseCount === 1 ? 'expense' : 'expenses'
                }`}
                label="Total spent"
                value={formatMoney(state.data.totalSpent)}
              />
              <StatCard
                hint={
                  state.data.budget === null && (
                    <Link className="font-bold text-accent-ink" to="/budget">
                      Set a budget
                    </Link>
                  )
                }
                label="Budget"
                value={
                  state.data.budget === null
                    ? 'Not set'
                    : formatMoney(state.data.budget)
                }
              />
              <StatCard
                label={state.data.status === 'over' ? 'Over budget by' : 'Remaining'}
                value={
                  state.data.remaining === null
                    ? '—'
                    : formatMoney(
                        state.data.remaining.replace(/^-/, ''),
                      )
                }
              />
              <StatCard
                hint={state.data.highestExpense?.title}
                label="Highest expense"
                value={
                  state.data.highestExpense
                    ? formatMoney(state.data.highestExpense.amount)
                    : '—'
                }
              />
            </div>

            <BudgetProgress summary={state.data} />

            <div className="grid gap-8 lg:grid-cols-2">
              <section aria-labelledby="by-category">
                <h2 className="mb-3 text-lg font-bold" id="by-category">
                  Spending by category
                </h2>
                <CategoryBreakdown
                  items={state.data.byCategory}
                  totalSpent={state.data.totalSpent}
                />
              </section>
              <section aria-labelledby="recent">
                <h2 className="mb-3 text-lg font-bold" id="recent">
                  Recent expenses
                </h2>
                <RecentExpenses expenses={state.data.recentExpenses} />
              </section>
            </div>
          </div>
        )}
      </div>
    </Page>
  )
}
