import { useState } from 'react'

import { CategoryList } from '../../components/admin/CategoryList'
import { CategoryNameForm } from '../../components/admin/CategoryNameForm'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { ErrorState } from '../../components/ui/ErrorState'
import { Notice } from '../../components/ui/Notice'
import { Panel } from '../../components/ui/Panel'
import { Skeleton } from '../../components/ui/Skeleton'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAdminCategories } from '../../hooks/useAdminCategories'
import { getErrorMessage } from '../../services/apiError'
import { categoriesService } from '../../services/categoriesService'
import { type CategoryWithCount, UNCATEGORIZED_NAME } from '../../types/domain'

export function AdminCategoriesPage() {
  useDocumentTitle('Admin categories')
  const { reload, state } = useAdminCategories()
  const [notice, setNotice] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<CategoryWithCount | null>(
    null,
  )
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleCreate(name: string) {
    const created = await categoriesService.create(name)
    setNotice(`Added category “${created.name}”.`)
    reload()
  }

  async function handleRename(id: string, name: string) {
    const renamed = await categoriesService.rename(id, name)
    setEditingId(null)
    setNotice(`Renamed category to “${renamed.name}”.`)
    reload()
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
      const { reassignedCount } = await categoriesService.remove(pendingDelete.id)
      setNotice(
        `Deleted “${pendingDelete.name}”. ${reassignedCount} ${
          reassignedCount === 1 ? 'expense was' : 'expenses were'
        } moved to ${UNCATEGORIZED_NAME}.`,
      )
      closeDeleteDialog()
      reload()
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <Panel>
        <h2 className="font-display text-xl font-semibold">New category</h2>
        <p className="mt-1 mb-4 text-ink-2">
          Categories are shared by everyone. Names must be unique.
        </p>
        <CategoryNameForm
          clearOnSuccess
          label="Category name"
          onSubmit={handleCreate}
          submitLabel="Add category"
        />
      </Panel>

      {notice && <Notice onDismiss={() => setNotice(null)}>{notice}</Notice>}

      {state.status === 'loading' && (
        <Panel>
          <p className="sr-only" role="status">
            Loading categories…
          </p>
          <Skeleton className="h-6 w-40" />
          <div className="mt-5 grid grid-cols-1 gap-3">
            {[0, 1, 2, 3, 4].map((row) => (
              <Skeleton className="h-12 w-full" key={row} />
            ))}
          </div>
        </Panel>
      )}

      {state.status === 'error' && (
        <ErrorState
          message={state.message}
          onRetry={reload}
          title="We could not load the categories"
        />
      )}

      {state.status === 'success' && (
        <Panel>
          <h2 className="mb-2 font-display text-xl font-semibold">
            All categories{' '}
            <span className="text-base font-normal text-ink-3">
              {state.data.length}
            </span>
          </h2>
          <CategoryList
            categories={state.data}
            editingId={editingId}
            onCancelEdit={() => setEditingId(null)}
            onDelete={setPendingDelete}
            onEdit={setEditingId}
            onRename={handleRename}
          />
        </Panel>
      )}

      {pendingDelete && (
        <ConfirmDialog
          confirmLabel="Delete category"
          error={deleteError}
          isBusy={isDeleting}
          message={`“${pendingDelete.name}” will be deleted. Its ${pendingDelete.expenseCount} ${
            pendingDelete.expenseCount === 1 ? 'expense' : 'expenses'
          } will be moved to ${UNCATEGORIZED_NAME}.`}
          onCancel={closeDeleteDialog}
          onConfirm={confirmDelete}
          title="Delete this category?"
        />
      )}
    </div>
  )
}
