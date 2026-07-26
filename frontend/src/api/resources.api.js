import axiosClient from './axiosClient'

export const listResources = (params = {}) => axiosClient.get('/resources', { params })

export const getResource = (id) => axiosClient.get(`/resources/${id}`)

export const createResource = (data) => axiosClient.post('/resources', data)

export const updateResource = (id, data) => axiosClient.put(`/resources/${id}`, data)

export const deleteResource = (id) => axiosClient.delete(`/resources/${id}`)

export const getDayView = (resourceId, date) =>
  axiosClient.get(`/resources/${resourceId}/day-view`, { params: { date } })
