const { z } = require('zod')

// POST /resources
const createResourceSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(200),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(100).optional(),
  isActive: z.boolean().optional(),
})

// PUT /resources/:id  -- all fields optional, but at least one must be present
const updateResourceSchema = createResourceSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
  })

// GET /resources?category=&search=&isActive=
const listResourcesQuerySchema = z.object({
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
})

const idParamSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
})

module.exports = {
  createResourceSchema,
  updateResourceSchema,
  listResourcesQuerySchema,
  idParamSchema,
}
