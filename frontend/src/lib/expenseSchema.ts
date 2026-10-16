import { z } from 'zod'

import { type Expense, PAYMENT_METHODS } from '../types/domain'
import { todayIso } from './format'

export const expenseSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter an amount like 12.50')
    .refine((value) => Number(value) > 0, 'Amount must be greater than zero'),
  categoryId: z.string().min(1, 'Choose a category'),
  description: z.string().trim().max(500, 'Keep this under 500 characters'),
  expenseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid date'),
  notes: z.string().trim().max(500, 'Keep this under 500 characters'),
  paymentMethod: z.enum(PAYMENT_METHODS),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Keep the title under 120 characters'),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>

export function emptyExpenseValues(): ExpenseFormValues {
  return {
    amount: '',
    categoryId: '',
    description: '',
    expenseDate: todayIso(),
    notes: '',
    paymentMethod: 'card',
    title: '',
  }
}

export function toExpenseFormValues(expense: Expense): ExpenseFormValues {
  return {
    amount: expense.amount,
    categoryId: expense.category.id,
    description: expense.description ?? '',
    expenseDate: expense.expenseDate,
    notes: expense.notes ?? '',
    paymentMethod: expense.paymentMethod,
    title: expense.title,
  }
}
