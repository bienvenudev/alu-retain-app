import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, type InputHTMLAttributes, useState } from 'react'

import { fieldClass } from './fieldStyles'

// A password field with a show/hide toggle. Pass the autoComplete hint that
// matches the form (current-password or new-password).
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>
>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        className={`${fieldClass} pr-11`}
        ref={ref}
        type={visible ? 'text' : 'password'}
      />
      <button
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 grid grid-cols-1 w-11 cursor-pointer place-items-center rounded-r-lg text-ink-3 transition-colors duration-150 hover:text-ink"
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-[18px]" />
        ) : (
          <Eye aria-hidden="true" className="size-[18px]" />
        )}
      </button>
    </div>
  )
})
