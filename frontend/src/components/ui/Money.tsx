import { splitMoney } from '../../lib/format'

// An amount with a small muted currency code. It scales with the surrounding
// text size, so the same component works in a hero figure and in a list row.
export function Money({
  amount,
  className = '',
}: {
  amount: string
  className?: string
}) {
  const { currency, value } = splitMoney(amount)

  return (
    <span className={`whitespace-nowrap tabular-nums ${className}`}>
      <span className="mr-[0.3em] text-[max(0.6em,0.75rem)] font-medium text-ink-3">
        {currency}
      </span>
      {value}
    </span>
  )
}
