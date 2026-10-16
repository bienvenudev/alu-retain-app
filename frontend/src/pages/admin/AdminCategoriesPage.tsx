import { useState } from 'react'

import { CategoryNameForm } from '../../components/admin/CategoryNameForm'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Button } from '../../components/ui/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Notice } from '../../components/ui/Notice'
import { useAdminCategories } from '../../hooks/useAdminCategories'
import { getErrorMessage } from '../../services/apiError'
import { categoriesService } from '../../services/categoriesService'
import { type CategoryWithCount, UNCATEGORIZED_NAME } from '../../types/domain'

export function AdminCategoriesPage() {
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
    <div className="grid gap-6">
      <section aria-labelledby="add-category">
        <h2 className="mb-3 text-lg font-bold" id="add-category">
          Add category
        </h2>
        <CategoryNameForm
          clearOnSuccess
          label="Category name"
          onSubmit={handleCreate}
          submitLabel="Add category"
        />
      </section>

      {notice && <Notice onDismiss={() => setNotice(null)}>{notice}</Notice>}

      <section aria-labelledby="all-categories">
        <h2 className="mb-3 text-lg font-bold" id="all-categories">
          All categories
        </h2>

        {state.status === 'loading' && (
          <p aria-live="polite" className="text-ink-2" role="status">
            Loading categories…
          </p>
        )}

        {state.status === 'error' && (
          <div className="grid justify-start gap-3">
            <ErrorMessage>{state.message}</ErrorMessage>
            <Button onClick={reload}>Try again</Button>
          </div>
        )}

        {state.status === 'success' && (
          <ul className="m-0 grid list-none gap-2 p-0">
            {state.data.map((category) => {
              const isProtected = category.name === UNCATEGORIZED_NAME

              return (
                <li
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line p-3"
                  key={category.id}
                >
                  {editingId === category.id ? (
                    <div className="flex-1">
                      <CategoryNameForm
                        initialName={category.name}
                        label="Category name"
                        onCancel={() => setEditingId(null)}
                        onSubmit={(name) => handleRename(category.id, name)}
                        submitLabel="Save"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-ink-3">
                          {category.expenseCount}{' '}
                          {category.expenseCount === 1 ? 'expense' : 'expenses'}
                          {isProtected && ' · Default category'}
                        </p>
                      </div>
                      {!isProtected && (
                        <div className="flex gap-2">
                          <Button
                            aria-label={`Rename ${category.name}`}
                            onClick={() => setEditingId(category.id)}
                            size="sm"
                            variant="secondary"
                          >
                            Rename
                          </Button>
                          <Button
                            aria-label={`Delete ${category.name}`}
                            onClick={() => setPendingDelete(category)}
                            size="sm"
                            variant="danger"
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {pendingDelete && (
        <ConfirmDialog
          confirmLabel="Delete"
          error={deleteError}
          isBusy={isDeleting}
          message={`“${pendingDelete.name}” will be deleted. Its ${pendingDelete.expenseCount} ${
            pendingDelete.expenseCount === 1 ? 'expense' : 'expenses'
          } will be moved to ${UNCATEGORIZED_NAME}.`}
          onCancel={closeDeleteDialog}
          onConfirm={confirmDelete}
          title="Delete category?"
        />
      )}
    </div>
  )
}
