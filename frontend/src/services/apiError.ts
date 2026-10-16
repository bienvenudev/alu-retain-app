export class ApiError extends Error {
  readonly details?: Record<string, string[]>
  readonly status: number // 0 when the server could not be reached

  constructor(
    message: string,
    status: number,
    details?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.details = details
    this.status = status
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.'
}
