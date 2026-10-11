import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

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

    if (password.length < 6) {
      setError('Your password must be at least 6 characters.')
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
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Retain</p>
        <h1>{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-description">
          {isSignUp
            ? 'Start tracking your spending in one place.'
            : 'Sign in to manage your expenses and budget.'}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <label>
              Name
              <input
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>
          )}
          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Password
            <input
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error && (
            <p aria-live="polite" className="form-error" role="alert">
              {error}
            </p>
          )}
          <button disabled={isSubmitting} type="submit">
            {isSubmitting
              ? 'Please wait…'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link to={isSignUp ? '/signin' : '/signup'}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </section>
    </main>
  )
}
