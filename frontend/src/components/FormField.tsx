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
    <label>
      {label}
      {children}
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  )
}
