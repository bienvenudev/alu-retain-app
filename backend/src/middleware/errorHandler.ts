import type { ErrorRequestHandler, RequestHandler } from 'express'
import { z } from 'zod'

import { HttpError } from '../lib/errors.js'

// Every error leaves the API in the same shape: { error: { message, details? } }.
export const notFound: RequestHandler = (_request, _response, next) => {
  next(new HttpError(404, 'Route not found.'))
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (error instanceof HttpError) {
    response
      .status(error.status)
      .json({ error: { details: error.details, message: error.message } })
    return
  }

  if (error instanceof z.ZodError) {
    response.status(400).json({
      error: {
        details: z.flattenError(error).fieldErrors,
        message: 'The request is invalid.',
      },
    })
    return
  }

  if (error instanceof SyntaxError && 'body' in error) {
    response
      .status(400)
      .json({ error: { message: 'The request body is not valid JSON.' } })
    return
  }

  console.error(error)
  response
    .status(500)
    .json({ error: { message: 'Something went wrong on the server.' } })
}
