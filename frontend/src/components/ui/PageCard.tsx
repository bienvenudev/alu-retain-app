import type { PropsWithChildren } from 'react'

export function PageCard({
  children,
  wide = false,
}: PropsWithChildren<{ wide?: boolean }>) {
  return (
    <section
      className={`w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 ${
        wide ? 'max-w-5xl sm:p-8' : 'max-w-lg sm:p-12'
      }`}
    >
      {children}
    </section>
  )
}

export function PageHeader({
  eyebrow = 'Retain',
  title,
}: {
  eyebrow?: string
  title: string
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold tracking-widest text-indigo-600 uppercase">
        {eyebrow}
      </p>
      <h1 className="text-[clamp(2rem,8vw,3.25rem)] leading-tight font-extrabold">
        {title}
      </h1>
    </div>
  )
}
