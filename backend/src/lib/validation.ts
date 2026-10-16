import { z } from 'zod'

import { HttpError } from './errors.js'

// A malformed id can never match a record, so it is reported as not found.
export function parseId(value: unknown, label: string): string {
  const result = z.uuid().safeParse(value)

  if (!result.success) {
    throw new HttpError(404, `${label} not found.`)
  }

  return result.data
}

// YYYY-MM-DD that is also a real calendar date (rejects 2026-02-30).
export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  .refine((value) => {
    const time = Date.parse(value)

    return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value
  }, 'Choose a valid date')

export function toUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}
