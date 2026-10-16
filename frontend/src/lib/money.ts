// Amounts arrive from the API as fixed two-decimal strings. This converts to
// integer cents for arithmetic, so floating-point error never shows up.
export function toCents(amount: string): number {
  return Math.round(Number(amount) * 100)
}
