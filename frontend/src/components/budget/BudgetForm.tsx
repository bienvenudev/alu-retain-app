import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { amountSchema } from '../../lib/expenseSchema'
import { getErrorMessage } from '../../services/apiError'
import { AmountInput } from '../AmountInput'
import { FormField } from '../FormField'
import { Button } from '../ui/Button'
import { ErrorMessage } from '../ui/ErrorMessage'

const budgetSchema = z.object({ amount: amountSchema })

type BudgetFormValues = z.infer<typeof budgetSchema>

interface BudgetFormProps {
  initialAmount: string
  onSubmit: (amount: string) => Promise<void>
}

export function BudgetForm({ initialAmount, onSubmit }: BudgetFormProps) {
  const [apiError, setApiError] = useState<string | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<BudgetFormValues>({
    defaultValues: { amount: initialAmount },
    resolver: zodResolver(budgetSchema),
  })

  const submit = handleSubmit(async (values) => {
    setApiError(null)

    try {
      await onSubmit(values.amount)
    } catch (error) {
      setApiError(getErrorMessage(error))
    }
  })

  return (
    <form className="grid grid-cols-1 gap-4" noValidate onSubmit={submit}>
      <FormField error={errors.amount?.message} label="Monthly budget">
        <AmountInput placeholder="e.g. 600000" {...register('amount')} />
      </FormField>
      {apiError && <ErrorMessage>{apiError}</ErrorMessage>}
      <div>
        <Button loading={isSubmitting} type="submit">
          {isSubmitting ? 'Saving…' : 'Save budget'}
        </Button>
      </div>
    </form>
  )
}
