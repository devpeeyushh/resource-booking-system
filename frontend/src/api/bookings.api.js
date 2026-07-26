import axiosClient from './axiosClient'

export const listBookings = (params = {}) => axiosClient.get('/bookings', { params })

export const getBooking = (id) => axiosClient.get(`/bookings/${id}`)

export const createBooking = (data) => axiosClient.post('/bookings', data)

export const updateBooking = (id, data) => axiosClient.put(`/bookings/${id}`, data)

export const deleteBooking = (id) => axiosClient.delete(`/bookings/${id}`)
