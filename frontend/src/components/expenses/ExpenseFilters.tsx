import { useCategories } from '../../hooks/useCategories'
import {
  resetFilters,
  selectExpenseFilters,
  selectHasActiveFilters,
  setCategoryId,
  setEndDate,
  setMaxAmount,
  setMinAmount,
  setPaymentMethod,
  setSearch,
  setSort,
  setStartDate,
} from '../../store/expenseFiltersSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  type SortDirection,
  type SortField,
} from '../../types/domain'
import { fieldClass } from '../fieldStyles'
import { FormField } from '../FormField'
import { Button } from '../ui/Button'

const sortOptions: {
  label: string
  sortBy: SortField
  sortDirection: SortDirection
}[] = [
  { label: 'Newest first', sortBy: 'date', sortDirection: 'desc' },
  { label: 'Oldest first', sortBy: 'date', sortDirection: 'asc' },
  { label: 'Highest amount', sortBy: 'amount', sortDirection: 'desc' },
  { label: 'Lowest amount', sortBy: 'amount', sortDirection: 'asc' },
]

export function ExpenseFilters() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectExpenseFilters)
  const hasActiveFilters = useAppSelector(selectHasActiveFilters)
  const categories = useCategories()

  const hasInvalidDateRange =
    filters.startDate !== '' &&
    filters.endDate !== '' &&
    filters.startDate > filters.endDate

  return (
    <form
      className="mb-6 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(event) => event.preventDefault()}
      role="search"
    >
      <div className="sm:col-span-2">
        <FormField label="Search">
          <input
            className={fieldClass}
            onChange={(event) => dispatch(setSearch(event.target.value))}
            placeholder="Title, notes, or category"
            type="search"
            value={filters.search}
          />
        </FormField>
      </div>

      <FormField
        error={
          categories.state.status === 'error'
            ? 'Could not load categories'
            : undefined
        }
        label="Category"
      >
        <select
          className={fieldClass}
          onChange={(event) => dispatch(setCategoryId(event.target.value))}
          value={filters.categoryId}
        >
          <option value="">All categories</option>
          {categories.state.status === 'success' &&
            categories.state.data.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>
      </FormField>

      <FormField label="Payment method">
        <select
          className={fieldClass}
          onChange={(event) =>
            dispatch(
              setPaymentMethod(
                PAYMENT_METHODS.find((method) => method === event.target.value) ??
                  '',
              ),
            )
          }
          value={filters.paymentMethod}
        >
          <option value="">All methods</option>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {PAYMENT_METHOD_LABELS[method]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="From date">
        <input
          className={fieldClass}
          onChange={(event) => dispatch(setStartDate(event.target.value))}
          type="date"
          value={filters.startDate}
        />
      </FormField>

      <FormField
        error={hasInvalidDateRange ? 'Must be after the start date' : undefined}
        label="To date"
      >
        <input
          aria-invalid={hasInvalidDateRange ? true : undefined}
          className={fieldClass}
          onChange={(event) => dispatch(setEndDate(event.target.value))}
          type="date"
          value={filters.endDate}
        />
      </FormField>

      <FormField label="Min amount (RWF)">
        <input
          className={fieldClass}
          inputMode="decimal"
          onChange={(event) => dispatch(setMinAmount(event.target.value))}
          placeholder="0"
          value={filters.minAmount}
        />
      </FormField>

      <FormField label="Max amount (RWF)">
        <input
          className={fieldClass}
          inputMode="decimal"
          onChange={(event) => dispatch(setMaxAmount(event.target.value))}
          placeholder="Any"
          value={filters.maxAmount}
        />
      </FormField>

      <FormField label="Sort by">
        <select
          className={fieldClass}
          onChange={(event) => {
            const option = sortOptions.find(
              (candidate) => candidate.label === event.target.value,
            )

            if (option) {
              dispatch(
                setSort({
                  sortBy: option.sortBy,
                  sortDirection: option.sortDirection,
                }),
              )
            }
          }}
          value={
            sortOptions.find(
              (option) =>
                option.sortBy === filters.sortBy &&
                option.sortDirection === filters.sortDirection,
            )?.label
          }
        >
          {sortOptions.map((option) => (
            <option key={option.label} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="flex items-end">
        <Button
          disabled={!hasActiveFilters}
          onClick={() => dispatch(resetFilters())}
          variant="secondary"
        >
          Clear filters
        </Button>
      </div>
    </form>
  )
}
