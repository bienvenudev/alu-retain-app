import { CategoryBreakdown } from '../../components/dashboard/CategoryBreakdown'
import { Button } from '../../components/ui/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { StatCard } from '../../components/ui/StatCard'
import { useAdminInsights } from '../../hooks/useAdminInsights'
import { formatDate, formatMoney } from '../../lib/format'
import type { CategoryTotal } from '../../types/domain'

function RankedCategories({
  heading,
  items,
}: {
  heading: string
  items: CategoryTotal[]
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{heading}</h2>
      <ol className="m-0 grid list-none gap-2 p-0">
        {items.map(({ category, count, total }, index) => (
          <li
            className="flex items-baseline justify-between gap-3 border-b border-slate-100 pb-2 text-sm"
            key={category.id}
          >
            <span>
              <span className="mr-2 text-slate-400">{index + 1}.</span>
              <span className="font-medium">{category.name}</span>{' '}
              <span className="text-slate-500">({count})</span>
            </span>
            <span className="font-medium whitespace-nowrap tabular-nums">
              {formatMoney(total)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function AdminInsightsPage() {
  const { reload, state } = useAdminInsights()

  if (state.status === 'loading') {
    return (
      <p aria-live="polite" className="text-slate-600" role="status">
        Loading insights…
      </p>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="grid justify-start gap-3">
        <ErrorMessage>{state.message}</ErrorMessage>
        <Button onClick={reload}>Try again</Button>
      </div>
    )
  }

  const insights = state.data

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Registered users" value={insights.userCount} />
        <StatCard label="Total expenses" value={insights.totalExpenseCount} />
        <StatCard
          label="Total spent"
          value={formatMoney(insights.totalSpent)}
        />
        <StatCard
          label="Expenses this month"
          value={insights.currentMonthExpenseCount}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <RankedCategories
          heading="Top categories"
          items={insights.topCategories}
        />
        <RankedCategories
          heading="Least-spent categories"
          items={insights.bottomCategories}
        />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">Spending per category</h2>
        <CategoryBreakdown
          items={insights.categoryTotals}
          totalSpent={insights.totalSpent}
        />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-bold">Recently added expenses</h2>
          <ul className="m-0 grid list-none gap-2 p-0">
            {insights.recentExpenses.map((expense) => (
              <li
                className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2"
                key={expense.id}
              >
                <div>
                  <p className="font-medium">{expense.title}</p>
                  <p className="text-sm text-slate-500">
                    {expense.userName} · {expense.category.name} ·{' '}
                    {formatDate(expense.expenseDate)}
                  </p>
                </div>
                <span className="font-medium whitespace-nowrap tabular-nums">
                  {formatMoney(expense.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold">Recently registered users</h2>
          <ul className="m-0 grid list-none gap-2 p-0">
            {insights.recentUsers.map((user) => (
              <li
                className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2"
                key={user.id}
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <span className="text-sm text-slate-500">
                  {user.createdAt
                    ? formatDate(user.createdAt.slice(0, 10))
                    : '—'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
