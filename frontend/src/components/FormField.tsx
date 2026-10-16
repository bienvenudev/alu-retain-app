import { CircleAlert } from 'lucide-react'
import type { PropsWithChildren } from 'react'

interface FormFieldProps {
  error?: string
  label: string
}

export function FormField({
  children,
  error,
  label,
}: PropsWithChildren<FormFieldProps>) {
  return (
    <label className="grid content-start gap-1.5 text-sm font-medium text-ink-2">
      {label}
      {children}
      {error && (
        <span
          className="flex items-center gap-1.5 text-xs font-medium text-bad"
          role="alert"
        >
          <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
          {error}
        </span>
      )}
    </label>
  )
}
