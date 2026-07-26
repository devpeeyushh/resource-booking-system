// Wraps an async route handler so rejected promises are forwarded to
// Express's error-handling middleware instead of crashing the process.
const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = asyncWrapper
