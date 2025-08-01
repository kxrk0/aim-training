import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

// Custom API Error class
export class ApiError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }
}

// Error handling middleware
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err

  // Convert non-ApiError errors to ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = 500
    const message = 'Internal Server Error'
    error = new ApiError(statusCode, message, false)
  }

  const apiError = error as ApiError

  // Log error
  logger.error(`${apiError.statusCode} - ${apiError.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)

  // Send error response
  res.status(apiError.statusCode).json({
    success: false,
    error: {
      message: apiError.message,
      ...(process.env.NODE_ENV === 'development' && { stack: apiError.stack })
    }
  })
}

// Async handler wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// 404 handler
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`)
  next(error)
} 