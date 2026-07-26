/**
 * Given a "YYYY-MM-DD" string, returns the UTC day boundaries as Date objects:
 * dayStart = that date at 00:00:00.000Z, dayEnd = the next date at 00:00:00.000Z.
 *
 * NOTE: this treats the date as a UTC calendar day. If you need the day
 * boundaries in a specific resource/user timezone instead, this is the
 * function to extend (e.g. accept a tz offset param).
 */
function getUtcDayBoundaries(dateStr) {
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`)
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
  return { dayStart, dayEnd }
}

/**
 * Given a day window [dayStart, dayEnd) and a list of already-sorted,
 * non-overlapping booked slots ({ start, end }) that fall within that
 * window, returns the complementary free slots.
 */
function computeFreeSlots(dayStart, dayEnd, bookedSlots) {
  const freeSlots = []
  let cursor = dayStart

  for (const slot of bookedSlots) {
    if (slot.start > cursor) {
      freeSlots.push({ start: cursor, end: slot.start })
    }
    if (slot.end > cursor) {
      cursor = slot.end
    }
  }

  if (cursor < dayEnd) {
    freeSlots.push({ start: cursor, end: dayEnd })
  }

  return freeSlots
}

module.exports = { getUtcDayBoundaries, computeFreeSlots }
