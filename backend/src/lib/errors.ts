export class HttpError extends Error {
  readonly details?: Record<string, string[]>
  readonly status: number

  constructor(status: number, message: string, details?: Record<string, string[]>) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.details = details
  }
}
