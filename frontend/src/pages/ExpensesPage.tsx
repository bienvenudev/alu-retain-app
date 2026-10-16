import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ConfirmDialog } from '../components/ConfirmDialog'
import { ExpenseFilters } from '../components/expenses/ExpenseFilters'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { Pagination } from '../components/Pagination'
import { Button, ButtonLink } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { PageCard, PageHeader } from '../components/ui/PageCard'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useExpenses } from '../hooks/useExpenses'
import { getErrorMessage } from '../services/apiError'
import { expensesService } from '../services/expensesService'
import {
  resetFilters,
  selectExpenseFilters,
  selectExpenseQuery,
  selectHasActiveFilters,
  setPage,
  setSort,
} from '../store/expenseFiltersSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import type { Expense, SortField } from '../types/domain'

export function ExpensesPage() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectExpenseFilters)
  const query = useAppSelector(selectExpenseQuery)
  const hasActiveFilters = useAppSelector(selectHasActiveFilters)
  // Wait for typing to pause before asking the service for new results.
  const debouncedQuery = useDebouncedValue(query, 250)
  const { reload, state } = useExpenses(debouncedQuery)
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

  // If the last item on a page was deleted, step back to the last real page.
  useEffect(() => {
    if (
      state.status === 'success' &&
      state.data.totalPages > 0 &&
      state.data.page > state.data.totalPages
    ) {
      dispatch(setPage(state.data.totalPages))
    }
  }, [dispatch, state])

  function handleSort(field: SortField) {
    const isSameField = filters.sortBy === field
    const direction =
      isSameField && filters.sortDirection === 'desc' ? 'asc' : 'desc'

    dispatch(setSort({ sortBy: field, sortDirection: direction }))
  }

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

      <ExpenseFilters />

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

        {state.status === 'success' && state.data.total === 0 && (
          <div className="grid justify-start gap-3">
            <p className="text-slate-600">
              {hasActiveFilters
                ? 'No expenses match your filters.'
                : 'You have no expenses yet. Add your first one to get started.'}
            </p>
            {hasActiveFilters && (
              <Button
                onClick={() => dispatch(resetFilters())}
                variant="secondary"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {state.status === 'success' && state.data.items.length > 0 && (
          <>
            <ExpenseList
              expenses={state.data.items}
              onDelete={setPendingDelete}
              onSort={handleSort}
              sortBy={filters.sortBy}
              sortDirection={filters.sortDirection}
            />
            <Pagination
              onPageChange={(page) => dispatch(setPage(page))}
              page={state.data.page}
              pageSize={state.data.pageSize}
              total={state.data.total}
              totalPages={state.data.totalPages}
            />
          </>
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
