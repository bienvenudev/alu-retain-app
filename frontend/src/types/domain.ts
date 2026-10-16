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
