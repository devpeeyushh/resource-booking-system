const express = require('express')
const prisma = require('../config/db')
const asyncWrapper = require('../middlewares/asyncWrapper')

const router = express.Router()

// Confirms both the API process and the DB connection are up —
// used by the frontend's Phase 0 setup-check page.
router.get(
  '/',
  asyncWrapper(async (req, res) => {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() })
  })
)

module.exports = router
