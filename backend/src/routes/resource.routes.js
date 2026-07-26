const express = require('express')
const resourceController = require('../controllers/resource.controller')
const bookingController = require('../controllers/booking.controller')
const asyncWrapper = require('../middlewares/asyncWrapper')
const validateRequest = require('../middlewares/validateRequest')
const {
  createResourceSchema,
  updateResourceSchema,
  listResourcesQuerySchema,
  idParamSchema,
} = require('../utils/schemas/resource.schema')
const { dayViewQuerySchema, idParamSchema: resourceIdParamSchema } = require('../utils/schemas/booking.schema')

const router = express.Router()

router.post('/', validateRequest(createResourceSchema), asyncWrapper(resourceController.create))

router.get(
  '/',
  validateRequest(listResourcesQuerySchema, 'query'),
  asyncWrapper(resourceController.list)
)

router.get(
  '/:id',
  validateRequest(idParamSchema, 'params'),
  asyncWrapper(resourceController.getById)
)

router.put(
  '/:id',
  validateRequest(idParamSchema, 'params'),
  validateRequest(updateResourceSchema),
  asyncWrapper(resourceController.update)
)

router.delete(
  '/:id',
  validateRequest(idParamSchema, 'params'),
  asyncWrapper(resourceController.remove)
)

// Day View: GET /api/v1/resources/:id/day-view?date=YYYY-MM-DD
router.get(
  '/:id/day-view',
  validateRequest(resourceIdParamSchema, 'params'),
  validateRequest(dayViewQuerySchema, 'query'),
  asyncWrapper(bookingController.dayView)
)

module.exports = router
