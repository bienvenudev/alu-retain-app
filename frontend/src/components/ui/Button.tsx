import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'danger' | 'ghost' | 'ghost-danger' | 'primary' | 'secondary'
type Size = 'md' | 'sm'

interface StyleProps {
  // A square button that holds only an icon (give it an aria-label).
  iconOnly?: boolean
  size?: Size
  variant?: Variant
}

const baseClasses =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap no-underline transition-[background-color,border-color,color,filter] duration-150 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-50'

const variantClasses: Record<Variant, string> = {
  danger:
    'border border-bad/30 bg-bad/10 text-bad hover:bg-bad/20 disabled:hover:bg-bad/10',
  ghost: 'text-ink-2 hover:bg-raised hover:text-ink',
  'ghost-danger': 'text-ink-3 hover:bg-bad/10 hover:text-bad',
  primary:
    'bg-accent text-on-accent hover:brightness-110 disabled:hover:brightness-100',
  secondary:
    'border border-line-strong bg-surface text-ink hover:bg-raised disabled:hover:bg-surface',
}

// Touch screens get a 44px minimum target; pointer devices stay compact.
const sizeClasses: Record<Size, string> = {
  md: 'min-h-11 px-4 text-sm',
  sm: 'min-h-9 px-3 text-sm pointer-coarse:min-h-11',
}

const iconSizeClasses: Record<Size, string> = {
  md: 'size-11',
  sm: 'size-9 pointer-coarse:size-11',
}

function buttonClasses({
  iconOnly = false,
  size = 'md',
  variant = 'primary',
}: StyleProps) {
  const sizing = iconOnly ? iconSizeClasses[size] : sizeClasses[size]

  return `${baseClasses} ${variantClasses[variant]} ${sizing}`
}

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    StyleProps {
  // Disables the button and shows a spinner while a request is running.
  loading?: boolean
}

export function Button({
  children,
  disabled,
  iconOnly,
  loading = false,
  size,
  type = 'button',
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      aria-busy={loading || undefined}
      className={buttonClasses({ iconOnly, size, variant })}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading && (
        <LoaderCircle
          aria-hidden="true"
          className="size-4 motion-safe:animate-spin"
        />
      )}
      {children}
    </button>
  )
}

export function ButtonLink({
  iconOnly,
  size,
  variant,
  ...props
}: LinkProps & StyleProps) {
  return (
    <Link className={buttonClasses({ iconOnly, size, variant })} {...props} />
  )
}
