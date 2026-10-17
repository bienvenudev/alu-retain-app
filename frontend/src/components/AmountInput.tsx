import { forwardRef, type InputHTMLAttributes } from 'react'

import { fieldClass } from './fieldStyles'

// A money field with the currency shown inside it. Amounts are typed as plain
// numbers (the API takes a string like "5000" or "5000.50").
export const AmountInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, 'inputMode' | 'type'>
>(function AmountInput(props, ref) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-ink-3"
      >
        RWF
      </span>
      <input
        placeholder="0"
        {...props}
        className={`${fieldClass} pl-12 tabular-nums`}
        inputMode="decimal"
        ref={ref}
      />
    </div>
  )
})
