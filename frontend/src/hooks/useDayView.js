import { useCallback, useEffect, useState } from 'react'
import * as resourcesApi from '../api/resources.api'

export function useDayView(resourceId, date) {
  const [dayView, setDayView] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDayView = useCallback(async () => {
    if (!resourceId || !date) {
      setDayView(null)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await resourcesApi.getDayView(resourceId, date)
      setDayView(res.data)
    } catch (err) {
      setError(err.message)
      setDayView(null)
    } finally {
      setLoading(false)
    }
  }, [resourceId, date])

  useEffect(() => {
    fetchDayView()
  }, [fetchDayView])

  return { dayView, loading, error, refetch: fetchDayView }
}
