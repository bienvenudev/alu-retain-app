import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { getErrorMessage } from '../../services/apiError'
import { fieldClass } from '../fieldStyles'
import { Button } from '../ui/Button'
import { ErrorMessage } from '../ui/ErrorMessage'

const categoryNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Keep the name under 50 characters'),
})

type CategoryNameValues = z.infer<typeof categoryNameSchema>

interface CategoryNameFormProps {
  clearOnSuccess?: boolean
  initialName?: string
  label: string
  onCancel?: () => void
  onSubmit: (name: string) => Promise<void>
  submitLabel: string
}

export function CategoryNameForm({
  clearOnSuccess = false,
  initialName = '',
  label,
  onCancel,
  onSubmit,
  submitLabel,
}: CategoryNameFormProps) {
  const [apiError, setApiError] = useState<string | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<CategoryNameValues>({
    defaultValues: { name: initialName },
    resolver: zodResolver(categoryNameSchema),
  })

  const submit = handleSubmit(async (values) => {
    setApiError(null)

    try {
      await onSubmit(values.name)

      if (clearOnSuccess) {
        reset({ name: '' })
      }
    } catch (error) {
      setApiError(getErrorMessage(error))
    }
  })

  return (
    <form className="grid gap-2" noValidate onSubmit={submit}>
      <div className="flex flex-wrap items-start gap-2">
        <input
          aria-invalid={errors.name ? true : undefined}
          aria-label={label}
          className={`${fieldClass} w-auto min-w-48 flex-1`}
          placeholder={label}
          {...register('name')}
        />
        <Button loading={isSubmitting} type="submit">
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <Button disabled={isSubmitting} onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        )}
      </div>
      {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
      {apiError && <ErrorMessage>{apiError}</ErrorMessage>}
    </form>
  )
}
