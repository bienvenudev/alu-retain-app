import type { PropsWithChildren, ReactNode } from 'react'

// The content column of a screen: top-aligned, with a readable max width.
export function Page({
  children,
  wide = false,
}: PropsWithChildren<{ wide?: boolean }>) {
  return (
    <section className={`w-full min-w-0 ${wide ? 'max-w-6xl' : 'max-w-2xl'}`}>
      {children}
    </section>
  )
}

export function PageHeader({
  actions,
  description,
  title,
}: {
  actions?: ReactNode
  description?: string
  title: string
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div>
        <h1 className="font-display text-3xl leading-tight font-semibold sm:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-2 text-ink-2">{description}</p>}
      </div>
      {actions}
    </header>
  )
}
