import { toCents } from '../../lib/money'
import type { CategoryTotal } from '../../types/domain'
import { Money } from '../ui/Money'

export function CategoryBreakdown({
  items,
  totalSpent,
}: {
  items: CategoryTotal[]
  totalSpent: string
}) {
  const totalCents = toCents(totalSpent)

  return (
    <ul className="m-0 grid list-none gap-4 p-0">
      {items.map(({ category, count, total }) => {
        const share = totalCents > 0 ? (toCents(total) / totalCents) * 100 : 0

        return (
          <li key={category.id}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate font-medium">
                {category.name}
                <span className="ml-2 text-sm font-normal text-ink-3">
                  {count}
                </span>
              </p>
              <p className="flex shrink-0 items-baseline gap-3">
                <span className="text-sm text-ink-3 tabular-nums">
                  {Math.round(share)}%
                </span>
                <Money amount={total} className="font-medium" />
              </p>
            </div>
            <div
              aria-hidden="true"
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised"
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
