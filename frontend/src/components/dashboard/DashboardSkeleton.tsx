import { Skeleton } from '../ui/Skeleton'

// Shaped like the loaded dashboard so the page does not jump.
export function DashboardSkeleton() {
  return (
    <div>
      <p className="sr-only" role="status">
        Loading your summary…
      </p>
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-14 w-72 max-w-full" />
        <Skeleton className="mt-8 h-2.5 w-full rounded-full" />
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <div key={key}>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-2 h-6 w-28" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {[0, 1].map((column) => (
          <div className="border-t border-line pt-6" key={column}>
            <Skeleton className="h-5 w-44" />
            <div className="mt-5 grid grid-cols-1 gap-4">
              {[0, 1, 2, 3].map((row) => (
                <Skeleton className="h-9 w-full" key={row} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
