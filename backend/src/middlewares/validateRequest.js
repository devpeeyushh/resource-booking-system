const ApiError = require('../utils/ApiError')

/**
 * Validates req[source] (body | query | params) against a zod schema.
 * On success, replaces req[source] with the parsed/transformed value
 * (so e.g. isActive="true" becomes boolean true downstream).
 * On failure, throws a single ApiError with all issues attached, which
 * errorHandler turns into a 422 response.
 */
const validateRequest = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source])

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
    const error = new ApiError(422, 'VALIDATION_ERROR', 'Request validation failed')
    error.details = details
    return next(error)
  }

  req[source] = result.data
  next()
}

module.exports = validateRequest
