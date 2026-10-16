import type { Prisma } from '@prisma/client'

export const expenseInclude = {
  category: { select: { id: true, name: true } },
} satisfies Prisma.ExpenseInclude

type ExpenseWithCategory = Prisma.ExpenseGetPayload<{
  include: typeof expenseInclude
}>

// Money is sent as a fixed two-decimal string so no precision is lost in JSON.
export function serializeExpense(expense: ExpenseWithCategory) {
  return {
    amount: expense.amount.toFixed(2),
    category: expense.category,
    createdAt: expense.createdAt.toISOString(),
    description: expense.description,
    expenseDate: expense.expenseDate.toISOString().slice(0, 10),
    id: expense.id,
    notes: expense.notes,
    paymentMethod: expense.paymentMethod,
    title: expense.title,
    updatedAt: expense.updatedAt.toISOString(),
    userId: expense.userId,
  }
}
