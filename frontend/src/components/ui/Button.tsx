import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'danger' | 'primary' | 'secondary'
type Size = 'md' | 'sm'

interface StyleProps {
  size?: Size
  variant?: Variant
}

const baseClasses =
  'inline-block cursor-pointer rounded-lg text-center font-bold no-underline transition-colors disabled:cursor-wait disabled:opacity-60'

const variantClasses: Record<Variant, string> = {
  danger: 'bg-red-700 text-white hover:bg-red-800',
  primary: 'bg-indigo-700 text-white hover:bg-indigo-800',
  secondary: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
}

const sizeClasses: Record<Size, string> = {
  md: 'px-4 py-2.5',
  sm: 'px-3 py-1.5 text-sm',
}

function buttonClasses({ size = 'md', variant = 'primary' }: StyleProps) {
  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`
}

export function Button({
  size,
  type = 'button',
  variant,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & StyleProps) {
  return <button className={buttonClasses({ size, variant })} type={type} {...props} />
}

export function ButtonLink({
  size,
  variant,
  ...props
}: LinkProps & StyleProps) {
  return <Link className={buttonClasses({ size, variant })} {...props} />
}
