import { Button } from './ui/Button'

interface PaginationProps {
  onPageChange: (page: number) => void
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function Pagination({
  onPageChange,
  page,
  pageSize,
  total,
  totalPages,
}: PaginationProps) {
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Pagination"
      className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600"
    >
      <p>
        Showing {first}–{last} of {total}
      </p>
      <div className="flex items-center gap-3">
        <Button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          size="sm"
          variant="secondary"
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          size="sm"
          variant="secondary"
        >
          Next
        </Button>
      </div>
    </nav>
  )
}
