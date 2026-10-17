import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation } from 'react-router-dom'

import { fieldClass } from '../components/fieldStyles'
import { FormField } from '../components/FormField'
import { PasswordInput } from '../components/PasswordInput'
import { Button } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import {
  type SignInValues,
  signInSchema,
  type SignUpValues,
  signUpSchema,
} from '../lib/authSchemas'
import { ApiError, getErrorMessage } from '../services/apiError'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuth } from './AuthContext'

interface AuthFormProps {
  mode: 'signin' | 'signup'
}

type AuthFormValues = SignInValues & Partial<Pick<SignUpValues, 'name'>>

export function AuthForm({ mode }: AuthFormProps) {
  const isSignUp = mode === 'signup'
  useDocumentTitle(isSignUp ? 'Create account' : 'Sign in')
  const { isAuthenticated, isLoading, signIn, signUp } = useAuth()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<AuthFormValues>({
    defaultValues: { email: '', name: '', password: '' },
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
  })

  const destination =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? '/dashboard'

  // Someone who is already signed in has no use for this page; this also moves
  // a user on to where they were headed once sign-in succeeds.
  if (isAuthenticated) {
    return <Navigate replace to={destination} />
  }

  const submit = handleSubmit(async (values) => {
    setFormError(null)

    try {
      if (isSignUp) {
        await signUp(values.name ?? '', values.email, values.password)
      } else {
        await signIn(values.email, values.password)
      }
    } catch (error) {
      // A taken email belongs to the email field; anything else is about the form.
      if (error instanceof ApiError && error.status === 409) {
        setError('email', { message: error.message }, { shouldFocus: true })
      } else {
        setFormError(getErrorMessage(error))
      }
    }
  })

  return (
    <main className="relative isolate grid grid-cols-1 min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-accent)_28%,transparent),transparent_65%)]"
      />

      {isLoading ? (
        <p
          aria-live="polite"
          className="flex items-center gap-2 text-ink-2"
          role="status"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-4 motion-safe:animate-spin"
          />
          Restoring your session…
        </p>
      ) : (
        <div className="w-full max-w-sm motion-safe:animate-rise">
          <Link
            className="mx-auto mb-8 flex w-fit items-center gap-2.5 font-display text-2xl font-semibold text-ink no-underline"
            to="/"
          >
            <span
              aria-hidden="true"
              className="grid grid-cols-1 size-9 place-items-center rounded-lg bg-accent text-lg font-bold text-on-accent"
            >
              R
            </span>
            Retain
          </Link>

          <section className="rounded-xl border border-line bg-surface p-6 sm:p-8">
            <h1 className="font-display text-3xl font-semibold">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-ink-2">
              {isSignUp
                ? 'Track your spending and stay within budget.'
                : 'Sign in to see where your money went this month.'}
            </p>

            <form className="mt-7 grid grid-cols-1 gap-4" noValidate onSubmit={submit}>
              {isSignUp && (
                <FormField error={errors.name?.message} label="Name">
                  <input
                    autoComplete="name"
                    className={fieldClass}
                    {...register('name')}
                  />
                </FormField>
              )}
              <FormField error={errors.email?.message} label="Email">
                <input
                  autoComplete="email"
                  className={fieldClass}
                  inputMode="email"
                  spellCheck={false}
                  type="email"
                  {...register('email')}
                />
              </FormField>
              <div className="grid grid-cols-1 gap-1.5">
                <FormField error={errors.password?.message} label="Password">
                  <PasswordInput
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    {...register('password')}
                  />
                </FormField>
                {isSignUp && !errors.password && (
                  <p className="text-xs text-ink-3">Use at least 8 characters.</p>
                )}
              </div>

              {formError && <ErrorMessage>{formError}</ErrorMessage>}

              <Button loading={isSubmitting} type="submit">
                {isSubmitting
                  ? isSignUp
                    ? 'Creating account…'
                    : 'Signing in…'
                  : isSignUp
                    ? 'Create account'
                    : 'Sign in'}
              </Button>
            </form>
          </section>

          <p className="mt-6 text-center text-sm text-ink-3">
            {isSignUp ? 'Already have an account?' : 'New to Retain?'}{' '}
            <Link
              className="font-medium text-accent-ink"
              to={isSignUp ? '/signin' : '/signup'}
            >
              {isSignUp ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      )}
    </main>
  )
}
