import { ChevronLeft, ChevronRight } from 'lucide-react'

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
      className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-3"
    >
      <p>
        Showing {first}–{last} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          size="sm"
          variant="secondary"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          Previous
        </Button>
        <span className="px-1 tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          size="sm"
          variant="secondary"
        >
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </nav>
  )
}
