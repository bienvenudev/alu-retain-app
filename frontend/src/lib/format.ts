// Rwandan franc, shown as "RWF 12,500" (fractions only when present).
const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'RWF',
  currencyDisplay: 'code',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  style: 'currency',
})

export function formatMoney(amount: string): string {
  return currencyFormatter.format(Number(amount))
}

// Parses YYYY-MM-DD as a local date so the day never shifts with the timezone.
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)

  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

// Splits "RWF 12,500" into the currency code and the figure, so the code can be
// shown small and muted beside a large number.
export function splitMoney(amount: string): { currency: string; value: string } {
  let currency = 'RWF'
  let value = ''

  for (const part of currencyFormatter.formatToParts(Number(amount))) {
    if (part.type === 'currency') {
      currency = part.value
    } else if (part.type !== 'literal') {
      value += part.value
    }
  }

  return { currency, value }
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}
