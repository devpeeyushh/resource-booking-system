const express = require('express')
const bookingController = require('../controllers/booking.controller')
const asyncWrapper = require('../middlewares/asyncWrapper')
const validateRequest = require('../middlewares/validateRequest')
const {
  createBookingSchema,
  updateBookingSchema,
  listBookingsQuerySchema,
  idParamSchema,
} = require('../utils/schemas/booking.schema')

const router = express.Router()

router.post('/', validateRequest(createBookingSchema), asyncWrapper(bookingController.create))

router.get(
  '/',
  validateRequest(listBookingsQuerySchema, 'query'),
  asyncWrapper(bookingController.list)
)

router.get(
  '/:id',
  validateRequest(idParamSchema, 'params'),
  asyncWrapper(bookingController.getById)
)

router.put(
  '/:id',
  validateRequest(idParamSchema, 'params'),
  validateRequest(updateBookingSchema),
  asyncWrapper(bookingController.update)
)

router.delete(
  '/:id',
  validateRequest(idParamSchema, 'params'),
  asyncWrapper(bookingController.remove)
)

module.exports = router
