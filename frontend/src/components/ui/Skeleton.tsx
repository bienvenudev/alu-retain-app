// A placeholder shaped like the content that is loading, so nothing jumps when
// the real content arrives. Decorative; pair it with a status message.
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-md bg-raised motion-safe:animate-pulse ${className}`}
    />
  )
}
