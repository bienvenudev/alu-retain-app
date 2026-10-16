import { Link } from 'react-router-dom'

import { formatDate, formatMoney } from '../../lib/format'
import type { Expense } from '../../types/domain'

export function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  return (
    <div>
      <ul className="m-0 grid list-none gap-2 p-0">
        {expenses.map((expense) => (
          <li
            className="flex items-start justify-between gap-3 border-b border-line pb-2"
            key={expense.id}
          >
            <div>
              <p className="font-medium">{expense.title}</p>
              <p className="text-sm text-ink-3">
                {formatDate(expense.expenseDate)} · {expense.category.name}
              </p>
            </div>
            <span className="font-medium whitespace-nowrap tabular-nums">
              {formatMoney(expense.amount)}
            </span>
          </li>
        ))}
      </ul>
      <Link
        className="mt-3 inline-block text-sm font-bold text-accent-ink"
        to="/expenses"
      >
        View all expenses
      </Link>
    </div>
  )
}
