const bookingService = require('../services/booking.service')

async function create(req, res) {
  const booking = await bookingService.createBooking(req.body)
  res.status(201).json(booking)
}

async function list(req, res) {
  const bookings = await bookingService.listBookings(req.query)
  res.json(bookings)
}

async function getById(req, res) {
  const booking = await bookingService.getBookingById(req.params.id)
  res.json(booking)
}

async function update(req, res) {
  const booking = await bookingService.updateBooking(req.params.id, req.body)
  res.json(booking)
}

async function remove(req, res) {
  await bookingService.deleteBooking(req.params.id)
  res.status(204).send()
}

// Mounted at GET /api/v1/resources/:id/day-view?date=YYYY-MM-DD
async function dayView(req, res) {
  const result = await bookingService.getDayView(req.params.id, req.query.date)
  res.json(result)
}

module.exports = { create, list, getById, update, remove, dayView }
