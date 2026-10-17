import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  type ExpenseFormValues,
  expenseSchema,
} from '../../lib/expenseSchema'
import { getErrorMessage } from '../../services/apiError'
import {
  type Category,
  type ExpenseInput,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
} from '../../types/domain'
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning'
import { AmountInput } from '../AmountInput'
import { FormField } from '../FormField'
import { fieldClass } from '../fieldStyles'
import { Button, ButtonLink } from '../ui/Button'
import { ErrorMessage } from '../ui/ErrorMessage'

interface ExpenseFormProps {
  categories: Category[]
  defaultValues: ExpenseFormValues
  onSubmit: (input: ExpenseInput) => Promise<void>
  submitLabel: string
}

export function ExpenseForm({
  categories,
  defaultValues,
  onSubmit,
  submitLabel,
}: ExpenseFormProps) {
  const [apiError, setApiError] = useState<string | null>(null)
  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ExpenseFormValues>({
    defaultValues,
    resolver: zodResolver(expenseSchema),
  })

  useUnsavedChangesWarning(isDirty && !isSubmitting)

  const submit = handleSubmit(async (values) => {
    setApiError(null)

    try {
      await onSubmit(values)
    } catch (error) {
      setApiError(getErrorMessage(error))
    }
  })

  return (
    <form className="grid grid-cols-1 gap-4" noValidate onSubmit={submit}>
      <FormField error={errors.title?.message} label="Title">
        <input
          className={fieldClass}
          aria-invalid={errors.title ? true : undefined}
          {...register('title')}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField error={errors.amount?.message} label="Amount">
          <AmountInput {...register('amount')} />
        </FormField>
        <FormField error={errors.expenseDate?.message} label="Date">
          <input
            className={fieldClass}
          aria-invalid={errors.expenseDate ? true : undefined}
            type="date"
            {...register('expenseDate')}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField error={errors.categoryId?.message} label="Category">
          <select
            className={fieldClass}
          aria-invalid={errors.categoryId ? true : undefined}
            {...register('categoryId')}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField error={errors.paymentMethod?.message} label="Payment method">
          <select className={fieldClass} {...register('paymentMethod')}>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {PAYMENT_METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField error={errors.description?.message} label="Description">
        <input className={fieldClass} {...register('description')} />
      </FormField>

      <FormField error={errors.notes?.message} label="Notes">
        <textarea className={fieldClass} rows={3} {...register('notes')} />
      </FormField>

      {apiError && <ErrorMessage>{apiError}</ErrorMessage>}

      <div className="flex flex-wrap gap-2">
        <Button loading={isSubmitting} type="submit">
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
        <ButtonLink to="/expenses" variant="secondary">
          Cancel
        </ButtonLink>
      </div>
    </form>
  )
}
