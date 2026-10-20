export function CategoryPill({ name }: { name: string }) {
  return (
    <span className="inline-block max-w-full truncate rounded-full bg-raised px-2.5 py-0.5 text-xs font-medium text-ink-2">
      {name}
    </span>
  )
}
