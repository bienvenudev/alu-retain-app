import { Link } from 'react-router-dom'

import { formatDate } from '../../lib/format'
import type { Expense } from '../../types/domain'
import { Money } from '../ui/Money'

export function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  return (
    <div>
      <ul className="m-0 list-none p-0">
        {expenses.map((expense) => (
          <li
            className="flex items-start justify-between gap-4 border-b border-line py-3 first:pt-0"
            key={expense.id}
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{expense.title}</p>
              <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-ink-3">
                <span>{expense.category.name}</span>
                <span>{formatDate(expense.expenseDate)}</span>
              </p>
            </div>
            <Money amount={expense.amount} className="shrink-0 font-medium" />
          </li>
        ))}
      </ul>
      <Link
        className="mt-4 inline-block text-sm font-medium text-accent-ink"
        to="/expenses"
      >
        View all expenses
      </Link>
    </div>
  )
}
