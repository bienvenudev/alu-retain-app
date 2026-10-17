import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useSelectedMonth } from '../month/SelectedMonthContext'
import { Button } from './ui/Button'

const monthNames = Array.from({ length: 12 }, (_, index) =>
  new Date(2000, index, 1).toLocaleDateString('en-US', { month: 'short' }),
)

export function MonthPicker() {
  const { month, setMonth, shiftMonth, year } = useSelectedMonth()
  const [open, setOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(year)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const now = new Date()
  const label = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  // Close on Escape (returning focus to the trigger) or a click outside.
  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function toggle() {
    setPickerYear(year)
    setOpen((current) => !current)
  }

  function choose(chosenMonth: number) {
    setMonth({ month: chosenMonth, year: pickerYear })
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div
      aria-label="Select month"
      className="relative inline-flex items-center gap-1 rounded-xl border border-line bg-surface p-1"
      ref={rootRef}
      role="group"
    >
      <Button
        aria-label="Previous month"
        onClick={() => shiftMonth(-1)}
        size="sm"
        variant="ghost"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </Button>

      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex min-h-9 min-w-44 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-150 hover:bg-raised pointer-coarse:min-h-11"
        onClick={toggle}
        ref={triggerRef}
        type="button"
      >
        <CalendarDays aria-hidden="true" className="size-4 text-accent-ink" />
        {label}
      </button>

      <Button
        aria-label="Next month"
        onClick={() => shiftMonth(1)}
        size="sm"
        variant="ghost"
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </Button>

      {open && (
        <div
          aria-label="Choose a month"
          className="absolute top-full left-0 z-20 mt-2 w-72 rounded-xl border border-line-strong bg-raised p-3 shadow-lg shadow-black/40 motion-safe:animate-rise"
          role="dialog"
        >
          <div className="mb-2 flex items-center justify-between">
            <Button
              aria-label="Previous year"
              onClick={() => setPickerYear((current) => current - 1)}
              size="sm"
              variant="ghost"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </Button>
            <span className="font-display font-semibold">{pickerYear}</span>
            <Button
              aria-label="Next year"
              onClick={() => setPickerYear((current) => current + 1)}
              size="sm"
              variant="ghost"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {monthNames.map((name, index) => {
              const value = index + 1
              const isSelected = value === month && pickerYear === year
              const isCurrent =
                value === now.getMonth() + 1 && pickerYear === now.getFullYear()

              return (
                <button
                  aria-current={isCurrent ? 'date' : undefined}
                  aria-pressed={isSelected}
                  className={`min-h-11 cursor-pointer rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isSelected
                      ? 'bg-accent text-on-accent'
                      : `text-ink-2 hover:bg-surface hover:text-ink ${
                          isCurrent ? 'ring-1 ring-inset ring-line-strong' : ''
                        }`
                  }`}
                  key={name}
                  onClick={() => choose(value)}
                  type="button"
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
