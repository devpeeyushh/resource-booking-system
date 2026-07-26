const resourceService = require('../services/resource.service')

async function create(req, res) {
  const resource = await resourceService.createResource(req.body)
  res.status(201).json(resource)
}

async function list(req, res) {
  const resources = await resourceService.listResources(req.query)
  res.json(resources)
}

async function getById(req, res) {
  const resource = await resourceService.getResourceById(req.params.id)
  res.json(resource)
}

async function update(req, res) {
  const resource = await resourceService.updateResource(req.params.id, req.body)
  res.json(resource)
}

async function remove(req, res) {
  await resourceService.deleteResource(req.params.id)
  res.status(204).send()
}

module.exports = { create, list, getById, update, remove }
