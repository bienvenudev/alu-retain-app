export const PAYMENT_METHODS = [
  'cash',
  'card',
  'mobile_money',
  'bank_transfer',
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank transfer',
  card: 'Card',
  cash: 'Cash',
  mobile_money: 'Mobile money',
}

export interface Category {
  id: string
  name: string
}

export interface Expense {
  amount: string // fixed-precision decimal serialized as a string, e.g. "12.50"
  category: Category
  createdAt: string
  description: string | null
  expenseDate: string // YYYY-MM-DD
  id: string
  notes: string | null
  paymentMethod: PaymentMethod
  title: string
  updatedAt: string
  userId: string
}

export interface ExpenseInput {
  amount: string
  categoryId: string
  description?: string | null
  expenseDate: string
  notes?: string | null
  paymentMethod: PaymentMethod
  title: string
}

export type SortField = 'amount' | 'date'
export type SortDirection = 'asc' | 'desc'

// Query contract for listing expenses; the Express API will accept the same
// fields as URL query parameters.
export interface ExpenseQuery {
  categoryId?: string
  endDate?: string // YYYY-MM-DD, inclusive
  maxAmount?: number
  minAmount?: number
  page: number
  pageSize: number
  paymentMethod?: PaymentMethod
  search?: string
  sortBy: SortField
  sortDirection: SortDirection
  startDate?: string // YYYY-MM-DD, inclusive
}

export interface PaginatedResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type BudgetStatus = 'approaching' | 'over' | 'within'

export interface Budget {
  amount: string
  id: string
  month: number // 1-12
  updatedAt: string
  year: number
}

export interface CategoryTotal {
  category: Category
  count: number
  total: string
}

// Everything the dashboard and budget pages need for one month. The Express
// API will serve this from a single summary endpoint.
export interface MonthlySummary {
  budget: string | null
  byCategory: CategoryTotal[] // largest first
  expenseCount: number
  highestExpense: Expense | null
  month: number
  percentSpent: number | null // whole percent of the budget used
  recentExpenses: Expense[]
  remaining: string | null // negative when over budget
  status: BudgetStatus | null
  totalSpent: string
  year: number
}
