import { type PropsWithChildren, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ExpenseForm } from '../components/expenses/ExpenseForm'
import { useAsyncData } from '../hooks/useAsyncData'
import { useCategories } from '../hooks/useCategories'
import {
  emptyExpenseValues,
  toExpenseFormValues,
} from '../lib/expenseSchema'
import { expensesService } from '../services/expensesService'
import type { ExpenseInput } from '../types/domain'

function FormShell({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <section className="page-card">
      <p className="eyebrow">Retain</p>
      <h1>{title}</h1>
      {children}
    </section>
  )
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-6" role="alert">
      <p className="form-error">{message}</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={onRetry} type="button">
          Try again
        </button>
        <Link className="btn btn-secondary" to="/expenses">
          Back to expenses
        </Link>
      </div>
    </div>
  )
}

export function NewExpensePage() {
  const navigate = useNavigate()
  const categories = useCategories()

  async function handleSubmit(input: ExpenseInput) {
    const created = await expensesService.create(input)
    navigate('/expenses', {
      state: { notice: `Added “${created.title}”.` },
    })
  }

  return (
    <FormShell title="Add expense">
      {categories.state.status === 'loading' && (
        <p aria-live="polite" role="status">
          Loading…
        </p>
      )}
      {categories.state.status === 'error' && (
        <LoadError
          message={categories.state.message}
          onRetry={categories.reload}
        />
      )}
      {categories.state.status === 'success' && (
        <ExpenseForm
          categories={categories.state.data}
          defaultValues={emptyExpenseValues()}
          onSubmit={handleSubmit}
          submitLabel="Add expense"
        />
      )}
    </FormShell>
  )
}

export function EditExpensePage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const categories = useCategories()
  const fetchExpense = useCallback(() => expensesService.get(id), [id])
  const expense = useAsyncData(fetchExpense)

  async function handleSubmit(input: ExpenseInput) {
    const updated = await expensesService.update(id, input)
    navigate('/expenses', {
      state: { notice: `Saved changes to “${updated.title}”.` },
    })
  }

  function retry() {
    categories.reload()
    expense.reload()
  }

  const error =
    expense.state.status === 'error'
      ? expense.state.message
      : categories.state.status === 'error'
        ? categories.state.message
        : null

  return (
    <FormShell title="Edit expense">
      {error && <LoadError message={error} onRetry={retry} />}
      {!error &&
        (expense.state.status === 'loading' ||
          categories.state.status === 'loading') && (
          <p aria-live="polite" role="status">
            Loading…
          </p>
        )}
      {expense.state.status === 'success' &&
        categories.state.status === 'success' && (
          <ExpenseForm
            categories={categories.state.data}
            defaultValues={toExpenseFormValues(expense.state.data)}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
          />
        )}
    </FormShell>
  )
}
