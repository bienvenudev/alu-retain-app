import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { ConfirmDialog } from '../components/ConfirmDialog'
import { ExpenseList } from '../components/expenses/ExpenseList'
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
    <section className="page-card page-card-wide">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Retain</p>
          <h1>Expenses</h1>
        </div>
        <Link className="btn" to="/expenses/new">
          Add expense
        </Link>
      </div>

      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button
            aria-label="Dismiss message"
            className="btn-secondary btn-sm"
            onClick={() => setNotice(null)}
            type="button"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mt-6">
        {state.status === 'loading' && (
          <p aria-live="polite" role="status">
            Loading expenses…
          </p>
        )}

        {state.status === 'error' && (
          <div role="alert">
            <p className="form-error">{state.message}</p>
            <button onClick={reload} type="button">
              Try again
            </button>
          </div>
        )}

        {state.status === 'success' && state.data.length === 0 && (
          <p>You have no expenses yet. Add your first one to get started.</p>
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
    </section>
  )
}
