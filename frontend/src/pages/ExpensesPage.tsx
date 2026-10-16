import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ConfirmDialog } from '../components/ConfirmDialog'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { Button, ButtonLink } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { PageCard, PageHeader } from '../components/ui/PageCard'
import { useExpenses } from '../hooks/useExpenses'
import { getErrorMessage } from '../services/apiError'
import { expensesService } from '../services/expensesService'
import type { Expense } from '../types/domain'

export function ExpensesPage() {
  const { reload, state } = useExpenses()
  const location = useLocation()
  const navigate = useNavigate()
  const [notice, setNotice] = useState<string | null>(
    (location.state as { notice?: string } | null)?.notice ?? null,
  )
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Clear the router state so a refresh does not show the notice again.
  useEffect(() => {
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, navigate])

  function closeDeleteDialog() {
    setPendingDelete(null)
    setDeleteError(null)
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await expensesService.remove(pendingDelete.id)
      setNotice(`Deleted “${pendingDelete.title}”.`)
      closeDeleteDialog()
      reload()
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <PageCard wide>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Expenses" />
        <ButtonLink to="/expenses/new">Add expense</ButtonLink>
      </div>

      {notice && (
        <div
          className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-green-50 px-3.5 py-2.5 text-sm font-semibold text-green-700"
          role="status"
        >
          <span>{notice}</span>
          <Button
            aria-label="Dismiss message"
            onClick={() => setNotice(null)}
            size="sm"
            variant="secondary"
          >
            ✕
          </Button>
        </div>
      )}

      <div className="mt-6">
        {state.status === 'loading' && (
          <p aria-live="polite" className="text-slate-600" role="status">
            Loading expenses…
          </p>
        )}

        {state.status === 'error' && (
          <div className="grid justify-start gap-3">
            <ErrorMessage>{state.message}</ErrorMessage>
            <Button onClick={reload}>Try again</Button>
          </div>
        )}

        {state.status === 'success' && state.data.length === 0 && (
          <p className="text-slate-600">
            You have no expenses yet. Add your first one to get started.
          </p>
        )}

        {state.status === 'success' && state.data.length > 0 && (
          <ExpenseList expenses={state.data} onDelete={setPendingDelete} />
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          confirmLabel="Delete"
          error={deleteError}
          isBusy={isDeleting}
          message={`“${pendingDelete.title}” will be permanently removed.`}
          onCancel={closeDeleteDialog}
          onConfirm={confirmDelete}
          title="Delete expense?"
        />
      )}
    </PageCard>
  )
}
