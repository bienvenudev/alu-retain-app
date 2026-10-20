import { type PropsWithChildren, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ExpenseForm } from '../components/expenses/ExpenseForm'
import { BackLink } from '../components/ui/BackLink'
import { Button, ButtonLink } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Page, PageHeader } from '../components/ui/Page'
import { Panel } from '../components/ui/Panel'
import { Skeleton } from '../components/ui/Skeleton'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAsyncData } from '../hooks/useAsyncData'
import { useCategories } from '../hooks/useCategories'
import {
  emptyExpenseValues,
  toExpenseFormValues,
} from '../lib/expenseSchema'
import { expensesService } from '../services/expensesService'
import type { ExpenseInput } from '../types/domain'

function FormShell({
  children,
  description,
  title,
}: PropsWithChildren<{ description?: string; title: string }>) {
  return (
    <Page>
      <BackLink to="/expenses">Expenses</BackLink>
      <PageHeader description={description} title={title} />
      <Panel>{children}</Panel>
    </Page>
  )
}

// Shaped like the form so the page does not jump when it loads.
function FormSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5">
      <p className="sr-only" role="status">
        Loading…
      </p>
      {[0, 1, 2, 3].map((field) => (
        <div key={field}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-11 w-full" />
        </div>
      ))}
    </div>
  )
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <ErrorMessage>{message}</ErrorMessage>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onRetry}>Try again</Button>
        <ButtonLink to="/expenses" variant="secondary">
          Back to expenses
        </ButtonLink>
      </div>
    </div>
  )
}

export function NewExpensePage() {
  useDocumentTitle('Add expense')
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
      {categories.state.status === 'loading' && <FormSkeleton />}
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
  useDocumentTitle('Edit expense')
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
    <FormShell
      description={
        expense.state.status === 'success' ? expense.state.data.title : undefined
      }
      title="Edit expense"
    >
      {error && <LoadError message={error} onRetry={retry} />}
      {!error &&
        (expense.state.status === 'loading' ||
          categories.state.status === 'loading') && <FormSkeleton />}
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
