const { PrismaClient } = require('@prisma/client')

// Reuse a single PrismaClient instance across the app (recommended by Prisma
// docs to avoid exhausting DB connections, especially with hot-reload in dev).
const prisma = new PrismaClient()

module.exports = prisma
