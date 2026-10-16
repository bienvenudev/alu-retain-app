import { useSelectedMonth } from '../month/SelectedMonthContext'
import { fieldClass } from './fieldStyles'
import { Button } from './ui/Button'

export function MonthPicker() {
  const { month, setMonth, shiftMonth, year } = useSelectedMonth()
  const value = `${year}-${String(month).padStart(2, '0')}`
  const label = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      aria-label="Select month"
      className="flex flex-wrap items-center gap-2"
      role="group"
    >
      <Button
        aria-label="Previous month"
        onClick={() => shiftMonth(-1)}
        size="sm"
        variant="secondary"
      >
        ←
      </Button>
      <span className="min-w-36 text-center font-bold" aria-live="polite">
        {label}
      </span>
      <Button
        aria-label="Next month"
        onClick={() => shiftMonth(1)}
        size="sm"
        variant="secondary"
      >
        →
      </Button>
      <input
        aria-label="Jump to month"
        className={`${fieldClass} w-auto py-1.5`}
        onChange={(event) => {
          const [nextYear, nextMonth] = event.target.value.split('-').map(Number)

          if (nextYear && nextMonth) {
            setMonth({ month: nextMonth, year: nextYear })
          }
        }}
        type="month"
        value={value}
      />
    </div>
  )
}
