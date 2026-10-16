const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
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
