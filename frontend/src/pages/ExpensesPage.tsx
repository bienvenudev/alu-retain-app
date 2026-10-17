import { Plus, Receipt, SearchX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ConfirmDialog } from '../components/ConfirmDialog'
import { ExpenseFilters } from '../components/expenses/ExpenseFilters'
import { ExpenseList, ExpenseListSkeleton } from '../components/expenses/ExpenseList'
import { Pagination } from '../components/Pagination'
import { Button, ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Notice } from '../components/ui/Notice'
import { Page, PageHeader } from '../components/ui/Page'
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
  const { isRefreshing, reload, state } = useExpenses(debouncedQuery)
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

  const total = state.status === 'success' ? state.data.total : null

  return (
    <Page wide>
      <PageHeader
        actions={
          <ButtonLink to="/expenses/new">
            <Plus aria-hidden="true" className="size-4" />
            Add expense
          </ButtonLink>
        }
        description={
          total === null
            ? undefined
            : `${total} ${hasActiveFilters ? 'matching ' : ''}${total === 1 ? 'expense' : 'expenses'}`
        }
        title="Expenses"
      />

      {notice && (
        <div className="mb-6">
          <Notice onDismiss={() => setNotice(null)}>{notice}</Notice>
        </div>
      )}

      <ExpenseFilters />

      {state.status === 'loading' && <ExpenseListSkeleton />}

      {state.status === 'error' && (
        <ErrorState
          message={state.message}
          onRetry={reload}
          title="We could not load your expenses"
        />
      )}

      {state.status === 'success' && state.data.total === 0 && (
        hasActiveFilters ? (
          <EmptyState
            action={
              <Button
                onClick={() => dispatch(resetFilters())}
                variant="secondary"
              >
                Clear all filters
              </Button>
            }
            description="Try a different search, or remove some filters to see more of your expenses."
            icon={SearchX}
            title="No expenses match"
          />
        ) : (
          <EmptyState
            action={<ButtonLink to="/expenses/new">Add your first expense</ButtonLink>}
            description="Record what you spend and it will show up here, ready to search, filter, and total up."
            icon={Receipt}
            title="No expenses yet"
          />
        )
      )}

      {state.status === 'success' && state.data.items.length > 0 && (
        <div
          aria-busy={isRefreshing}
          className={`transition-opacity duration-150 ${isRefreshing ? 'opacity-60' : ''}`}
        >
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
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          confirmLabel="Delete expense"
          error={deleteError}
          isBusy={isDeleting}
          message={`“${pendingDelete.title}” will be permanently removed.`}
          onCancel={closeDeleteDialog}
          onConfirm={confirmDelete}
          title="Delete this expense?"
        />
      )}
    </Page>
  )
}
