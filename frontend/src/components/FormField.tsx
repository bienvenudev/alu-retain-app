import { CircleAlert } from 'lucide-react'
import { cloneElement, type ReactElement, useId } from 'react'

interface FieldControlProps {
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  id?: string
}

interface FormFieldProps {
  // A single control (input, select, textarea). The field gives it an id and
  // links the label and the error message to it.
  children: ReactElement<FieldControlProps>
  error?: string
  label: string
}

export function FormField({ children, error, label }: FormFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="grid content-start gap-1.5">
      <label className="text-sm font-medium text-ink-2" htmlFor={id}>
        {label}
      </label>
      {cloneElement(children, {
        'aria-describedby': error ? errorId : undefined,
        'aria-invalid': error ? true : undefined,
        id,
      })}
      {error && (
        <span
          className="flex items-center gap-1.5 text-xs font-medium text-bad"
          id={errorId}
          role="alert"
        >
          <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
          {error}
        </span>
      )}
    </div>
  )
}
