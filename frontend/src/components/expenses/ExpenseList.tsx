import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from 'lucide-react'

import { formatDate } from '../../lib/format'
import {
  type Expense,
  PAYMENT_METHOD_LABELS,
  type SortDirection,
  type SortField,
} from '../../types/domain'
import { Button, ButtonLink } from '../ui/Button'
import { Money } from '../ui/Money'
import { Skeleton } from '../ui/Skeleton'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (expense: Expense) => void
  onSort: (field: SortField) => void
  sortBy: SortField
  sortDirection: SortDirection
}

function RowActions({
  expense,
  onDelete,
}: {
  expense: Expense
  onDelete: (expense: Expense) => void
}) {
  return (
    <div className="flex justify-end gap-1">
      <ButtonLink
        aria-label={`Edit ${expense.title}`}
        iconOnly
        size="sm"
        to={`/expenses/${expense.id}/edit`}
        variant="ghost"
      >
        <Pencil aria-hidden="true" className="size-4" />
      </ButtonLink>
      <Button
        aria-label={`Delete ${expense.title}`}
        iconOnly
        onClick={() => onDelete(expense)}
        size="sm"
        variant="ghost-danger"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </Button>
    </div>
  )
}

function CategoryPill({ name }: { name: string }) {
  return (
    <span className="inline-block max-w-full truncate rounded-full bg-raised px-2.5 py-0.5 text-xs font-medium text-ink-2">
      {name}
    </span>
  )
}

function SortHeader({
  align,
  field,
  label,
  onSort,
  sortBy,
  sortDirection,
}: {
  align?: 'right'
  field: SortField
  label: string
  onSort: (field: SortField) => void
  sortBy: SortField
  sortDirection: SortDirection
}) {
  const isActive = sortBy === field
  const Icon = !isActive ? ArrowUpDown : sortDirection === 'asc' ? ArrowUp : ArrowDown
  const ariaSort = !isActive
    ? 'none'
    : sortDirection === 'asc'
      ? 'ascending'
      : 'descending'

  return (
    <th
      aria-sort={ariaSort}
      className={`py-3 pr-4 font-medium ${align === 'right' ? 'text-right' : ''}`}
    >
      <button
        className={`inline-flex cursor-pointer items-center gap-1.5 transition-colors duration-150 hover:text-ink ${
          isActive ? 'text-ink' : ''
        }`}
        onClick={() => onSort(field)}
        type="button"
      >
        {label}
        <Icon aria-hidden="true" className="size-3.5" />
      </button>
    </th>
  )
}

export function ExpenseList({
  expenses,
  onDelete,
  onSort,
  sortBy,
  sortDirection,
}: ExpenseListProps) {
  const sortProps = { onSort, sortBy, sortDirection }

  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="border-b border-line text-ink-3">
          <tr>
            <SortHeader field="date" label="Date" {...sortProps} />
            <th className="py-3 pr-4 font-medium">Title</th>
            <th className="py-3 pr-4 font-medium">Category</th>
            <th className="py-3 pr-4 font-medium">Payment</th>
            <SortHeader align="right" field="amount" label="Amount" {...sortProps} />
            <th className="py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr
              className="border-b border-line transition-colors duration-150 hover:bg-surface"
              key={expense.id}
            >
              <td className="py-3 pr-4 whitespace-nowrap text-ink-2">
                {formatDate(expense.expenseDate)}
              </td>
              <td className="max-w-[18rem] py-3 pr-4 font-medium">
                <span className="block truncate">{expense.title}</span>
              </td>
              <td className="py-3 pr-4">
                <CategoryPill name={expense.category.name} />
              </td>
              <td className="py-3 pr-4 text-ink-2">
                {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
              </td>
              <td className="py-3 pr-4 text-right font-medium">
                <Money amount={expense.amount} />
              </td>
              <td className="py-2">
                <RowActions expense={expense} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="m-0 grid list-none gap-3 p-0 md:hidden">
        {expenses.map((expense) => (
          <li
            className="rounded-xl border border-line bg-surface p-4"
            key={expense.id}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 truncate font-medium">{expense.title}</p>
              <Money amount={expense.amount} className="shrink-0 font-medium" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink-3">
              <CategoryPill name={expense.category.name} />
              <span>{PAYMENT_METHOD_LABELS[expense.paymentMethod]}</span>
              <span>{formatDate(expense.expenseDate)}</span>
            </div>
            <div className="mt-2 border-t border-line pt-2">
              <RowActions expense={expense} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

// Shaped like the loaded list so nothing jumps when the data arrives.
export function ExpenseListSkeleton() {
  return (
    <div>
      <p className="sr-only" role="status">
        Loading expenses…
      </p>
      <div className="grid gap-px">
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <Skeleton className="h-14 w-full" key={row} />
        ))}
      </div>
    </div>
  )
}
