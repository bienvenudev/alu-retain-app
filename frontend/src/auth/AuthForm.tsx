import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { FormField } from '../components/FormField'
import { fieldClass } from '../components/fieldStyles'
import { Button } from '../components/ui/Button'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { useAuth } from './AuthContext'

interface AuthFormProps {
  mode: 'signin' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const { signIn, signUp } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSignUp = mode === 'signup'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (isSignUp && name.trim().length < 2) {
      setError('Please enter your name.')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    if (isSignUp && password.length < 8) {
      setError('Your password must be at least 8 characters.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isSignUp) {
        await signUp(name, email, password)
      } else {
        await signIn(email, password)
      }

      const destination =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname ?? '/dashboard'
      navigate(destination, { replace: true })
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to complete authentication.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="w-full max-w-md rounded-xl border border-line bg-surface p-6 sm:p-8">
        <h1 className="font-display text-3xl font-semibold">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-ink-2">
          {isSignUp
            ? 'Start tracking your spending in one place.'
            : 'Sign in to manage your expenses and budget.'}
        </p>
        <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
          {isSignUp && (
            <FormField label="Name">
              <input
                autoComplete="name"
                className={fieldClass}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </FormField>
          )}
          <FormField label="Email">
            <input
              autoComplete="email"
              className={fieldClass}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </FormField>
          <FormField label="Password">
            <input
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className={fieldClass}
              minLength={isSignUp ? 8 : undefined}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </FormField>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button loading={isSubmitting} type="submit">
            {isSubmitting
              ? 'Please wait…'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-3">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link
            className="font-medium text-accent-ink"
            to={isSignUp ? '/signin' : '/signup'}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </section>
    </main>
  )
}
