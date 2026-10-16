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
    <label className="grid gap-1.5 text-sm font-bold text-slate-700">
      {label}
      {children}
      {error && (
        <span className="text-xs font-semibold text-red-700" role="alert">
          {error}
        </span>
      )}
    </label>
  )
}
