import { formatMoney } from '../../lib/format'
import { toCents } from '../../lib/money'
import type { CategoryTotal } from '../../types/domain'

export function CategoryBreakdown({
  items,
  totalSpent,
}: {
  items: CategoryTotal[]
  totalSpent: string
}) {
  const totalCents = toCents(totalSpent)

  return (
    <ul className="m-0 grid list-none gap-3 p-0">
      {items.map(({ category, count, total }) => {
        const share = totalCents > 0 ? (toCents(total) / totalCents) * 100 : 0

        return (
          <li key={category.id}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">
                {category.name}{' '}
                <span className="font-normal text-ink-3">
                  ({count} {count === 1 ? 'expense' : 'expenses'})
                </span>
              </span>
              <span className="font-medium whitespace-nowrap tabular-nums">
                {formatMoney(total)}
              </span>
            </div>
            <div
              aria-hidden="true"
              className="mt-1 h-2 overflow-hidden rounded-full bg-raised"
            >
              <div
                className="h-full rounded-full bg-accent-ink"
                style={{ width: `${share}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
