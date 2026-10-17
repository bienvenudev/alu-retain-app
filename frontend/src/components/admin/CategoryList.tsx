import { Lock, Pencil, Trash2 } from 'lucide-react'

import { type CategoryWithCount, UNCATEGORIZED_NAME } from '../../types/domain'
import { Button } from '../ui/Button'
import { CategoryNameForm } from './CategoryNameForm'

interface CategoryListProps {
  categories: CategoryWithCount[]
  editingId: string | null
  onCancelEdit: () => void
  onDelete: (category: CategoryWithCount) => void
  onEdit: (id: string) => void
  onRename: (id: string, name: string) => Promise<void>
}

function expenseLabel(count: number) {
  return `${count} ${count === 1 ? 'expense' : 'expenses'}`
}

export function CategoryList({
  categories,
  editingId,
  onCancelEdit,
  onDelete,
  onEdit,
  onRename,
}: CategoryListProps) {
  return (
    <ul className="m-0 list-none divide-y divide-line p-0">
      {categories.map((category) => {
        const isDefault = category.name === UNCATEGORIZED_NAME

        if (editingId === category.id) {
          return (
            <li className="py-3" key={category.id}>
              <CategoryNameForm
                initialName={category.name}
                label="Category name"
                onCancel={onCancelEdit}
                onSubmit={(name) => onRename(category.id, name)}
                submitLabel="Save"
              />
            </li>
          )
        }

        return (
          <li
            className="flex items-center justify-between gap-3 py-3"
            key={category.id}
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium">
                <span className="truncate">{category.name}</span>
                {isDefault && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-raised px-2.5 py-0.5 text-xs font-medium text-ink-2">
                    <Lock aria-hidden="true" className="size-3" />
                    Default
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-ink-3">
                {isDefault
                  ? `${expenseLabel(category.expenseCount)}. Receives expenses from deleted categories.`
                  : expenseLabel(category.expenseCount)}
              </p>
            </div>
            {!isDefault && (
              <div className="flex shrink-0 gap-1">
                <Button
                  aria-label={`Rename ${category.name}`}
                  iconOnly
                  onClick={() => onEdit(category.id)}
                  size="sm"
                  variant="ghost"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                </Button>
                <Button
                  aria-label={`Delete ${category.name}`}
                  iconOnly
                  onClick={() => onDelete(category)}
                  size="sm"
                  variant="ghost-danger"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </Button>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
