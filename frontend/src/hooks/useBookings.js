import { useCallback, useEffect, useRef, useState } from 'react'
import * as bookingsApi from '../api/bookings.api'

/**
 * Loads the booking list and exposes CRUD helpers. Every mutation refetches
 * the list from the server afterward -- see useResources.js for the
 * loading-vs-refreshing distinction and why it refetches instead of
 * patching local state.
 */
export function useBookings(params = {}) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const hasLoadedOnce = useRef(false)

  const fetchBookings = useCallback(async () => {
    if (hasLoadedOnce.current) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError('')
    try {
      const res = await bookingsApi.listBookings(params)
      setBookings(res.data)
      hasLoadedOnce.current = true
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const create = async (data) => {
    const res = await bookingsApi.createBooking(data)
    await fetchBookings()
    return res.data
  }

  const update = async (id, data) => {
    const res = await bookingsApi.updateBooking(id, data)
    await fetchBookings()
    return res.data
  }

  const remove = async (id) => {
    await bookingsApi.deleteBooking(id)
    await fetchBookings()
  }

  return { bookings, loading, refreshing, error, refetch: fetchBookings, create, update, remove }
}
