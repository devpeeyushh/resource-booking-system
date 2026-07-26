const express = require('express')
const cors = require('cors')

const healthRoutes = require('./routes/health.routes')
const resourceRoutes = require('./routes/resource.routes')
const bookingRoutes = require('./routes/booking.routes')
const errorHandler = require('./middlewares/errorHandler')
const ApiError = require('./utils/ApiError')

const app = express()

// CORS_ORIGIN accepts a comma-separated list so both the local dev origin
// and the deployed Vercel URL can be allowed at once, e.g.:
//   CORS_ORIGIN=http://localhost:5173,https://your-app.vercel.app
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // No origin header = same-origin request, curl, server-to-server
      // health checks, etc. -- not a browser CORS scenario, so allow it.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`))
    },
  })
)
app.use(express.json())

const API_PREFIX = '/api/v1'

app.get('/', (req, res) => res.json({ message: 'Resource Booking System API' }))
app.use(`${API_PREFIX}/health`, healthRoutes)
app.use(`${API_PREFIX}/resources`, resourceRoutes)
app.use(`${API_PREFIX}/bookings`, bookingRoutes)

// 404 fallback for unmatched routes
app.use((req, res, next) => {
  next(new ApiError(404, 'NOT_FOUND', `Route ${req.originalUrl} not found`))
})

// Must be last
app.use(errorHandler)

module.exports = app
