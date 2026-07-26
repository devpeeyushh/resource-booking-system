const { z } = require('zod')

// ISO 8601 datetime string, e.g. "2026-07-25T09:00:00.000Z"
const isoDateTime = z.string().datetime({ message: 'must be a valid ISO 8601 datetime' })

// POST /bookings
const createBookingSchema = z
  .object({
    resourceId: z.string().uuid('resourceId must be a valid UUID'),
    title: z.string().trim().min(1, 'title is required').max(200),
    bookedBy: z.string().trim().min(1, 'bookedBy is required').max(200),
    startTime: isoDateTime,
    endTime: isoDateTime,
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  })

// PUT /bookings/:id -- all fields optional, but at least one must be present.
// If both startTime and endTime are supplied together we validate ordering
// here; if only one is supplied, the service layer validates against the
// existing stored value (it has to load the record anyway).
const updateBookingSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    bookedBy: z.string().trim().min(1).max(200).optional(),
    startTime: isoDateTime.optional(),
    endTime: isoDateTime.optional(),
    status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
  })
  .refine(
    (data) =>
      !(data.startTime && data.endTime) || new Date(data.endTime) > new Date(data.startTime),
    { message: 'endTime must be after startTime', path: ['endTime'] }
  )

// GET /bookings?resourceId=&status=&from=&to=
const listBookingsQuerySchema = z.object({
  resourceId: z.string().uuid().optional(),
  status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),
  from: isoDateTime.optional(),
  to: isoDateTime.optional(),
})

// GET /resources/:id/day-view?date=YYYY-MM-DD
const dayViewQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format')
    .refine((val) => !Number.isNaN(Date.parse(`${val}T00:00:00.000Z`)), {
      message: 'date must be a valid calendar date',
    }),
})

const idParamSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
})

module.exports = {
  createBookingSchema,
  updateBookingSchema,
  listBookingsQuerySchema,
  dayViewQuerySchema,
  idParamSchema,
}
