import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type {
  ExpenseQuery,
  PaymentMethod,
  SortDirection,
  SortField,
} from '../types/domain'
import type { RootState } from './index'

// Search, filter, sort, and pagination controls for the expense list. The
// expenses themselves are fetched through `expensesService`, not stored here.
export interface ExpenseFiltersState {
  categoryId: string // '' means all categories
  endDate: string
  maxAmount: string // raw input text; converted to a number in the selector
  minAmount: string
  page: number
  pageSize: number
  paymentMethod: PaymentMethod | ''
  search: string
  sortBy: SortField
  sortDirection: SortDirection
  startDate: string
}

const initialState: ExpenseFiltersState = {
  categoryId: '',
  endDate: '',
  maxAmount: '',
  minAmount: '',
  page: 1,
  pageSize: 8,
  paymentMethod: '',
  search: '',
  sortBy: 'date',
  sortDirection: 'desc',
  startDate: '',
}

const expenseFiltersSlice = createSlice({
  initialState,
  name: 'expenseFilters',
  reducers: {
    resetFilters: () => initialState,
    setCategoryId(state, action: PayloadAction<string>) {
      state.categoryId = action.payload
      state.page = 1
    },
    setEndDate(state, action: PayloadAction<string>) {
      state.endDate = action.payload
      state.page = 1
    },
    setMaxAmount(state, action: PayloadAction<string>) {
      state.maxAmount = action.payload
      state.page = 1
    },
    setMinAmount(state, action: PayloadAction<string>) {
      state.minAmount = action.payload
      state.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload)
    },
    setPaymentMethod(state, action: PayloadAction<PaymentMethod | ''>) {
      state.paymentMethod = action.payload
      state.page = 1
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
      state.page = 1
    },
    setSort(
      state,
      action: PayloadAction<{ sortBy: SortField; sortDirection: SortDirection }>,
    ) {
      state.sortBy = action.payload.sortBy
      state.sortDirection = action.payload.sortDirection
      state.page = 1
    },
    setStartDate(state, action: PayloadAction<string>) {
      state.startDate = action.payload
      state.page = 1
    },
  },
})

export const {
  resetFilters,
  setCategoryId,
  setEndDate,
  setMaxAmount,
  setMinAmount,
  setPage,
  setPaymentMethod,
  setSearch,
  setSort,
  setStartDate,
} = expenseFiltersSlice.actions

export const expenseFiltersReducer = expenseFiltersSlice.reducer

export const selectExpenseFilters = (state: RootState) => state.expenseFilters

function parseAmount(value: string): number | undefined {
  const trimmed = value.trim()
  const amount = Number(trimmed)

  return trimmed !== '' && Number.isFinite(amount) && amount >= 0
    ? amount
    : undefined
}

// Memoized so the object only changes when a control changes.
export const selectExpenseQuery = createSelector(
  [selectExpenseFilters],
  (filters): ExpenseQuery => ({
    categoryId: filters.categoryId || undefined,
    endDate: filters.endDate || undefined,
    maxAmount: parseAmount(filters.maxAmount),
    minAmount: parseAmount(filters.minAmount),
    page: filters.page,
    pageSize: filters.pageSize,
    paymentMethod: filters.paymentMethod || undefined,
    search: filters.search.trim() || undefined,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
    startDate: filters.startDate || undefined,
  }),
)

export const selectHasActiveFilters = createSelector(
  [selectExpenseFilters],
  (filters) =>
    Boolean(
      filters.search.trim() ||
        filters.categoryId ||
        filters.paymentMethod ||
        filters.startDate ||
        filters.endDate ||
        filters.minAmount.trim() ||
        filters.maxAmount.trim(),
    ),
)
