const ApiError = require('../utils/ApiError')

// Must be registered last, after all routes.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    })
  }

  // Prisma "record not found" on update/delete (P2025) -> clean 404.
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Record not found' },
    })
  }

  // DB-level EXCLUDE constraint violation (Postgres code 23P01). This is the
  // safety net for the overlap-prevention constraint from
  // prisma/manual-sql/overlap-exclusion-constraint.sql -- it should rarely
  // fire in practice since booking.service.js already checks for overlaps
  // before inserting, but a race between two concurrent requests can still
  // hit it, so we translate it into the same clean error shape.
  const rawMessage = err.message || ''
  if (rawMessage.includes('23P01') || rawMessage.includes('exclusion constraint')) {
    return res.status(409).json({
      error: {
        code: 'BOOKING_OVERLAP',
        message: 'This booking overlaps with an existing booking for the resource',
      },
    })
  }

  // Anything else: log server-side, never leak internals to the client.
  console.error(err)
  return res.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' },
  })
}

module.exports = errorHandler
