import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useId, useState } from 'react'

import { useCategories } from '../../hooks/useCategories'
import { formatDate, formatMoney } from '../../lib/format'
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

interface FilterChip {
  key: string
  label: string
  onRemove: () => void
}

// Search and sort are always in reach; the rest of the filters open on demand,
// and every active filter shows as a chip that can be removed on its own.
export function ExpenseFilters() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectExpenseFilters)
  const hasActiveFilters = useAppSelector(selectHasActiveFilters)
  const categories = useCategories()
  const [panelOpen, setPanelOpen] = useState(false)
  const panelId = useId()

  const categoryName =
    categories.state.status === 'success'
      ? categories.state.data.find((category) => category.id === filters.categoryId)
          ?.name
      : undefined

  const chips: FilterChip[] = []

  if (filters.categoryId) {
    chips.push({
      key: 'category',
      label: categoryName ?? 'Category',
      onRemove: () => dispatch(setCategoryId('')),
    })
  }

  if (filters.paymentMethod) {
    chips.push({
      key: 'payment',
      label: PAYMENT_METHOD_LABELS[filters.paymentMethod],
      onRemove: () => dispatch(setPaymentMethod('')),
    })
  }

  if (filters.startDate) {
    chips.push({
      key: 'start',
      label: `From ${formatDate(filters.startDate)}`,
      onRemove: () => dispatch(setStartDate('')),
    })
  }

  if (filters.endDate) {
    chips.push({
      key: 'end',
      label: `Until ${formatDate(filters.endDate)}`,
      onRemove: () => dispatch(setEndDate('')),
    })
  }

  if (filters.minAmount.trim()) {
    chips.push({
      key: 'min',
      label: `At least ${formatMoney(filters.minAmount)}`,
      onRemove: () => dispatch(setMinAmount('')),
    })
  }

  if (filters.maxAmount.trim()) {
    chips.push({
      key: 'max',
      label: `At most ${formatMoney(filters.maxAmount)}`,
      onRemove: () => dispatch(setMaxAmount('')),
    })
  }

  const hasInvalidDateRange =
    filters.startDate !== '' &&
    filters.endDate !== '' &&
    filters.startDate > filters.endDate

  return (
    <div className="mb-6 grid grid-cols-1 gap-3" role="search">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-ink-3"
          />
          <input
            aria-label="Search expenses"
            className={`${fieldClass} pl-10`}
            name="search"
            onChange={(event) => dispatch(setSearch(event.target.value))}
            placeholder="Search by title, notes, or category…"
            type="search"
            value={filters.search}
          />
        </div>
        <div className="flex gap-3">
          <select
            aria-label="Sort by"
            className={`${fieldClass} flex-1 sm:w-44 sm:flex-none`}
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
          <Button
            aria-controls={panelId}
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((open) => !open)}
            variant="secondary"
          >
            <SlidersHorizontal aria-hidden="true" className="size-4" />
            Filters
            {chips.length > 0 && (
              <span className="grid grid-cols-1 size-5 place-items-center rounded-full bg-accent text-xs font-semibold text-on-accent">
                {chips.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {panelOpen && (
        <div
          className="grid grid-cols-1 gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3 motion-safe:animate-rise"
          id={panelId}
        >
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

          <div className="hidden lg:block" />

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
              className={fieldClass}
              onChange={(event) => dispatch(setEndDate(event.target.value))}
              type="date"
              value={filters.endDate}
            />
          </FormField>

          <div className="hidden lg:block" />

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
              placeholder="No limit"
              value={filters.maxAmount}
            />
          </FormField>
        </div>
      )}

      {(chips.length > 0 || hasActiveFilters) && (
        <ul className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
          {chips.map((chip) => (
            <li
              className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-surface py-0.5 pr-0.5 pl-3 text-sm text-ink-2"
              key={chip.key}
            >
              {chip.label}
              <button
                aria-label={`Remove filter: ${chip.label}`}
                className="grid grid-cols-1 size-7 cursor-pointer place-items-center rounded-full text-ink-3 transition-colors duration-150 hover:bg-raised hover:text-ink pointer-coarse:size-9"
                onClick={chip.onRemove}
                type="button"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </li>
          ))}
          {hasActiveFilters && (
            <li>
              <Button
                onClick={() => dispatch(resetFilters())}
                size="sm"
                variant="ghost"
              >
                Clear all
              </Button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
