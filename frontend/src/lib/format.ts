// Rwandan franc, shown as "RWF 12,500". Whole amounts have no decimals; amounts
// with cents always show two ("RWF 18,000.50", never "18,000.5").
function currencyFormat(maximumFractionDigits: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'RWF',
    currencyDisplay: 'code',
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
    style: 'currency',
  })
}

const wholeFormatter = currencyFormat(0)
const centsFormatter = currencyFormat(2)

function formatterFor(amount: string): Intl.NumberFormat {
  return Number.isInteger(Number(amount)) ? wholeFormatter : centsFormatter
}

export function formatMoney(amount: string): string {
  return formatterFor(amount).format(Number(amount))
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

  for (const part of formatterFor(amount).formatToParts(Number(amount))) {
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

export function formatDateTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
