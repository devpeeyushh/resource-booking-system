const prisma = require('../config/db')
const ApiError = require('../utils/ApiError')

async function createResource(data) {
  return prisma.resource.create({ data })
}

async function listResources({ category, search, isActive } = {}) {
  return prisma.resource.findMany({
    where: {
      ...(category && { category }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  })
}

async function getResourceById(id) {
  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) {
    throw new ApiError(404, 'RESOURCE_NOT_FOUND', `Resource ${id} not found`)
  }
  return resource
}

async function updateResource(id, data) {
  await getResourceById(id) // 404s cleanly if missing, before attempting update
  return prisma.resource.update({ where: { id }, data })
}

async function deleteResource(id) {
  await getResourceById(id)
  // onDelete: Cascade on Booking.resource handles removing its bookings.
  await prisma.resource.delete({ where: { id } })
}

module.exports = {
  createResource,
  listResources,
  getResourceById,
  updateResource,
  deleteResource,
}
