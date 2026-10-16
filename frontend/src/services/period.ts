import { ApiError } from './apiError'

export function assertValidPeriod(year: number, month: number): void {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new ApiError('Choose a valid month.', 400)
  }
}
