import { formatDate, formatMoney } from '../../lib/format'
import { type Expense, PAYMENT_METHOD_LABELS } from '../../types/domain'

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="border-b border-slate-200 text-slate-500">
          <tr>
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Title</th>
            <th className="py-2 pr-4 font-medium">Category</th>
            <th className="py-2 pr-4 font-medium">Payment</th>
            <th className="py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr className="border-b border-slate-100" key={expense.id}>
              <td className="py-3 pr-4 whitespace-nowrap">
                {formatDate(expense.expenseDate)}
              </td>
              <td className="py-3 pr-4 font-medium">{expense.title}</td>
              <td className="py-3 pr-4">{expense.category.name}</td>
              <td className="py-3 pr-4">
                {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
              </td>
              <td className="py-3 text-right font-medium tabular-nums">
                {formatMoney(expense.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="grid gap-3 md:hidden">
        {expenses.map((expense) => (
          <li
            className="rounded-lg border border-slate-200 p-3"
            key={expense.id}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium">{expense.title}</span>
              <span className="font-medium tabular-nums">
                {formatMoney(expense.amount)}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {formatDate(expense.expenseDate)} · {expense.category.name} ·{' '}
              {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}
