const prisma = require('../config/db')
const ApiError = require('../utils/ApiError')
const resourceService = require('./resource.service')
const { getUtcDayBoundaries, computeFreeSlots } = require('../utils/dateHelpers')

/**
 * Core overlap rule (matches the spec exactly):
 *   reject when newStart < existingEnd AND newEnd > existingStart
 * Rewritten as a query against existing rows:
 *   existing.startTime < newEnd AND existing.endTime > newStart
 * Using strict < / > (not <=, >=) is what allows back-to-back bookings:
 * a booking ending at 10:00 and one starting at 10:00 do not satisfy
 * both conditions, so they are not flagged as overlapping.
 * Only CONFIRMED bookings block new ones -- a CANCELLED booking frees
 * its slot immediately.
 */
async function findOverlappingBooking({ resourceId, startTime, endTime, excludeBookingId }) {
  return prisma.booking.findFirst({
    where: {
      resourceId,
      status: 'CONFIRMED',
      startTime: { lt: endTime },
      endTime: { gt: startTime },
      ...(excludeBookingId && { id: { not: excludeBookingId } }),
    },
  })
}

async function assertNoOverlap({ resourceId, startTime, endTime, excludeBookingId }) {
  const conflict = await findOverlappingBooking({
    resourceId,
    startTime,
    endTime,
    excludeBookingId,
  })
  if (conflict) {
    throw new ApiError(
      409,
      'BOOKING_OVERLAP',
      `Requested slot overlaps with existing booking "${conflict.title}" ` +
        `(${conflict.startTime.toISOString()} - ${conflict.endTime.toISOString()})`
    )
  }
}

async function createBooking(data) {
  const { resourceId, title, bookedBy, startTime, endTime } = data
  const start = new Date(startTime)
  const end = new Date(endTime)

  // Confirms the resource exists (throws 404 otherwise) before we even
  // consider overlap checks.
  await resourceService.getResourceById(resourceId)

  await assertNoOverlap({ resourceId, startTime: start, endTime: end })

  return prisma.booking.create({
    data: { resourceId, title, bookedBy, startTime: start, endTime: end },
  })
}

async function listBookings({ resourceId, status, from, to } = {}) {
  return prisma.booking.findMany({
    where: {
      ...(resourceId && { resourceId }),
      ...(status && { status }),
      ...(from && { endTime: { gt: new Date(from) } }),
      ...(to && { startTime: { lt: new Date(to) } }),
    },
    orderBy: { startTime: 'asc' },
  })
}

async function getBookingById(id) {
  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking) {
    throw new ApiError(404, 'BOOKING_NOT_FOUND', `Booking ${id} not found`)
  }
  return booking
}

async function updateBooking(id, data) {
  const existing = await getBookingById(id)

  const nextStart = data.startTime ? new Date(data.startTime) : existing.startTime
  const nextEnd = data.endTime ? new Date(data.endTime) : existing.endTime

  if (nextEnd <= nextStart) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'endTime must be after startTime')
  }

  // Only re-check overlap if the time window or status is actually changing --
  // no need to re-validate an untouched, already-valid slot.
  const timeOrStatusChanged =
    data.startTime !== undefined || data.endTime !== undefined || data.status !== undefined

  if (timeOrStatusChanged && (data.status ?? existing.status) === 'CONFIRMED') {
    await assertNoOverlap({
      resourceId: existing.resourceId,
      startTime: nextStart,
      endTime: nextEnd,
      excludeBookingId: id,
    })
  }

  return prisma.booking.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.bookedBy !== undefined && { bookedBy: data.bookedBy }),
      ...(data.startTime !== undefined && { startTime: nextStart }),
      ...(data.endTime !== undefined && { endTime: nextEnd }),
      ...(data.status !== undefined && { status: data.status }),
    },
  })
}

async function deleteBooking(id) {
  await getBookingById(id)
  await prisma.booking.delete({ where: { id } })
}

/**
 * Day View: for a given resource + calendar date (UTC), returns the day's
 * booked slots and the complementary free slots.
 */
async function getDayView(resourceId, dateStr) {
  await resourceService.getResourceById(resourceId)

  const { dayStart, dayEnd } = getUtcDayBoundaries(dateStr)

  const bookings = await prisma.booking.findMany({
    where: {
      resourceId,
      status: 'CONFIRMED',
      startTime: { lt: dayEnd },
      endTime: { gt: dayStart },
    },
    orderBy: { startTime: 'asc' },
  })

  // Clip each booking to the day window in case it extends past midnight,
  // so free-slot math never produces a negative-length gap.
  const bookedSlots = bookings.map((b) => ({
    bookingId: b.id,
    title: b.title,
    start: b.startTime < dayStart ? dayStart : b.startTime,
    end: b.endTime > dayEnd ? dayEnd : b.endTime,
  }))

  const freeSlots = computeFreeSlots(dayStart, dayEnd, bookedSlots)

  return {
    resourceId,
    date: dateStr,
    dayStart,
    dayEnd,
    bookedSlots,
    freeSlots,
  }
}

module.exports = {
  createBooking,
  listBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getDayView,
}
