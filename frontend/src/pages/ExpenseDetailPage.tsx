import { Pencil, Trash2 } from 'lucide-react'
import { type PropsWithChildren, useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ConfirmDialog } from '../components/ConfirmDialog'
import { CategoryPill } from '../components/expenses/CategoryPill'
import { BackLink } from '../components/ui/BackLink'
import { Button, ButtonLink } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { Money } from '../components/ui/Money'
import { Page, PageHeader } from '../components/ui/Page'
import { Panel } from '../components/ui/Panel'
import { Skeleton } from '../components/ui/Skeleton'
import { useAsyncData } from '../hooks/useAsyncData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatDate, formatDateTime } from '../lib/format'
import { getErrorMessage } from '../services/apiError'
import { expensesService } from '../services/expensesService'
import { PAYMENT_METHOD_LABELS } from '../types/domain'

function Detail({
  children,
  label,
  wide = false,
}: PropsWithChildren<{ label: string; wide?: boolean }>) {
  return (
    <div className={`min-w-0 ${wide ? 'sm:col-span-2' : ''}`}>
      <dt className="text-sm text-ink-3">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere]">
        {children}
      </dd>
    </div>
  )
}

function None() {
  return <span className="text-ink-3">None</span>
}

// Everything about one expense, read-only, with the actions that change it.
export function ExpenseDetailPage() {
  useDocumentTitle('Expense details')
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const fetchExpense = useCallback(() => expensesService.get(id), [id])
  const { reload, state } = useAsyncData(fetchExpense)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function confirmDelete() {
    if (state.status !== 'success') {
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await expensesService.remove(id)
      navigate('/expenses', {
        state: { notice: `Deleted “${state.data.title}”.` },
      })
    } catch (error) {
      setDeleteError(getErrorMessage(error))
      setIsDeleting(false)
    }
  }

  return (
    <Page>
      <BackLink to="/expenses">Expenses</BackLink>

      {state.status === 'loading' && (
        <div>
          <p className="sr-only" role="status">
            Loading expense…
          </p>
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="mt-3 h-5 w-40" />
          <Panel className="mt-8">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-10 w-56" />
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[0, 1, 2, 3].map((item) => (
                <div key={item}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-6 w-36" />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {state.status === 'error' && (
        <ErrorState
          message={state.message}
          onRetry={reload}
          title="We could not load this expense"
        />
      )}

      {state.status === 'success' && (
        <>
          <PageHeader
            actions={
              <div className="flex gap-2">
                <ButtonLink to={`/expenses/${state.data.id}/edit`} variant="secondary">
                  <Pencil aria-hidden="true" className="size-4" />
                  Edit
                </ButtonLink>
                <Button onClick={() => setConfirmingDelete(true)} variant="danger">
                  <Trash2 aria-hidden="true" className="size-4" />
                  Delete
                </Button>
              </div>
            }
            description={formatDate(state.data.expenseDate)}
            title={state.data.title}
          />

          <Panel>
            <p className="text-sm text-ink-3">Amount</p>
            <p className="mt-1 font-display text-4xl font-semibold">
              <Money amount={state.data.amount} />
            </p>

            <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-2">
              <Detail label="Category">
                <CategoryPill name={state.data.category.name} />
              </Detail>
              <Detail label="Payment method">
                {PAYMENT_METHOD_LABELS[state.data.paymentMethod]}
              </Detail>
              <Detail label="Date">{formatDate(state.data.expenseDate)}</Detail>
              <Detail label="Added">{formatDateTime(state.data.createdAt)}</Detail>
              <Detail label="Description" wide>
                {state.data.description ?? <None />}
              </Detail>
              <Detail label="Notes" wide>
                {state.data.notes ?? <None />}
              </Detail>
            </dl>
          </Panel>

          {confirmingDelete && (
            <ConfirmDialog
              confirmLabel="Delete expense"
              error={deleteError}
              isBusy={isDeleting}
              message={`“${state.data.title}” will be permanently removed.`}
              onCancel={() => {
                setConfirmingDelete(false)
                setDeleteError(null)
              }}
              onConfirm={confirmDelete}
              title="Delete this expense?"
            />
          )}
        </>
      )}
    </Page>
  )
}
