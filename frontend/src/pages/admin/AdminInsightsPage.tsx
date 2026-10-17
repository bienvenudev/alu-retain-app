import type { PropsWithChildren } from 'react'

import { CategoryBreakdown } from '../../components/dashboard/CategoryBreakdown'
import { ErrorState } from '../../components/ui/ErrorState'
import { Money } from '../../components/ui/Money'
import { Panel } from '../../components/ui/Panel'
import { Skeleton } from '../../components/ui/Skeleton'
import { Stat } from '../../components/ui/Stat'
import { useAdminInsights } from '../../hooks/useAdminInsights'
import { formatDate } from '../../lib/format'
import type { CategoryTotal } from '../../types/domain'

function Section({
  children,
  title,
}: PropsWithChildren<{ title: string }>) {
  return (
    <section className="border-t border-line pt-6">
      <h2 className="mb-5 font-display text-xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function RankedCategories({ items }: { items: CategoryTotal[] }) {
  return (
    <ol className="m-0 list-none p-0">
      {items.map(({ category, count, total }, index) => (
        <li
          className="flex items-baseline justify-between gap-4 border-b border-line py-3 first:pt-0"
          key={category.id}
        >
          <p className="flex min-w-0 items-baseline gap-3">
            <span className="w-4 shrink-0 text-sm text-ink-3 tabular-nums">
              {index + 1}
            </span>
            <span className="truncate font-medium">{category.name}</span>
            <span className="shrink-0 text-sm text-ink-3">
              {count} {count === 1 ? 'expense' : 'expenses'}
            </span>
          </p>
          <Money amount={total} className="shrink-0 font-medium" />
        </li>
      ))}
    </ol>
  )
}

function InsightsSkeleton() {
  return (
    <div className="grid gap-8">
      <p className="sr-only" role="status">
        Loading insights…
      </p>
      <Panel>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <div key={key}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-7 w-28" />
            </div>
          ))}
        </div>
      </Panel>
      <div className="grid gap-8 lg:grid-cols-2">
        {[0, 1].map((column) => (
          <div className="border-t border-line pt-6" key={column}>
            <Skeleton className="h-5 w-40" />
            <div className="mt-5 grid gap-3">
              {[0, 1, 2, 3, 4].map((row) => (
                <Skeleton className="h-9 w-full" key={row} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminInsightsPage() {
  const { reload, state } = useAdminInsights()

  if (state.status === 'loading') {
    return <InsightsSkeleton />
  }

  if (state.status === 'error') {
    return (
      <ErrorState
        message={state.message}
        onRetry={reload}
        title="We could not load the insights"
      />
    )
  }

  const insights = state.data

  return (
    <div className="grid gap-8">
      <Panel>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          <Stat label="Registered users">
            <span className="font-display text-3xl">{insights.userCount}</span>
          </Stat>
          <Stat label="Total expenses">
            <span className="font-display text-3xl">
              {insights.totalExpenseCount}
            </span>
          </Stat>
          <Stat label="Total spent">
            <Money amount={insights.totalSpent} className="font-display text-3xl" />
          </Stat>
          <Stat label="Expenses this month">
            <span className="font-display text-3xl">
              {insights.currentMonthExpenseCount}
            </span>
          </Stat>
        </dl>
      </Panel>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Top categories">
          <RankedCategories items={insights.topCategories} />
        </Section>
        <Section title="Least-spent categories">
          <RankedCategories items={insights.bottomCategories} />
        </Section>
      </div>

      <Section title="Spending per category">
        <CategoryBreakdown
          items={insights.categoryTotals}
          totalSpent={insights.totalSpent}
        />
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Recently added expenses">
          <ul className="m-0 list-none p-0">
            {insights.recentExpenses.map((expense) => (
              <li
                className="flex items-start justify-between gap-4 border-b border-line py-3 first:pt-0"
                key={expense.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{expense.title}</p>
                  <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-ink-3">
                    <span>{expense.userName}</span>
                    <span>{expense.category.name}</span>
                    <span>{formatDate(expense.expenseDate)}</span>
                  </p>
                </div>
                <Money amount={expense.amount} className="shrink-0 font-medium" />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Recently registered users">
          <ul className="m-0 list-none p-0">
            {insights.recentUsers.map((user) => (
              <li
                className="flex items-start justify-between gap-4 border-b border-line py-3 first:pt-0"
                key={user.id}
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    <span className="truncate">{user.name}</span>
                    {user.role === 'admin' && (
                      <span className="shrink-0 rounded-full bg-raised px-2.5 py-0.5 text-xs font-medium text-accent-ink">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-ink-3">{user.email}</p>
                </div>
                <p className="shrink-0 text-sm text-ink-3">
                  {user.createdAt ? formatDate(user.createdAt.slice(0, 10)) : ''}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}
