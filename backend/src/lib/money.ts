import type { Prisma } from '@prisma/client'

// Totals are compared as integer cents so rounding never decides a result.
export function toCents(amount: Prisma.Decimal | null | undefined): number {
  return amount ? Math.round(amount.mul(100).toNumber()) : 0
}

export function fromCents(cents: number): string {
  return (cents / 100).toFixed(2)
}
