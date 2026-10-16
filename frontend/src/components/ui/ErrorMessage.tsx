import type { PropsWithChildren } from 'react'

export function ErrorMessage({ children }: PropsWithChildren) {
  return (
    <p className="text-sm text-red-700" role="alert">
      {children}
    </p>
  )
}
