// Money is summed as integer cents so floating-point error never appears.
export function toCents(amount: string): number {
  return Math.round(Number(amount) * 100)
}

export function fromCents(cents: number): string {
  return (cents / 100).toFixed(2)
}
