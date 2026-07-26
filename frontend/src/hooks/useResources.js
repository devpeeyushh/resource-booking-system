import { useCallback, useEffect, useRef, useState } from 'react'
import * as resourcesApi from '../api/resources.api'

/**
 * Loads the resource list and exposes CRUD helpers. Every mutation
 * refetches the list from the server afterward rather than patching local
 * state by hand -- keeps the UI as a direct reflection of backend state.
 *
 * `loading` is only true for the very first fetch (or a failed fetch being
 * retried from empty) -- it's what callers should use to show a full-page
 * Loader. `refreshing` is true for every fetch after that, including the
 * ones triggered by create/update/remove -- callers can show a small
 * non-blocking indicator instead of hiding already-visible data.
 */
export function useResources(params = {}) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const hasLoadedOnce = useRef(false)

  const fetchResources = useCallback(async () => {
    if (hasLoadedOnce.current) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError('')
    try {
      const res = await resourcesApi.listResources(params)
      setResources(res.data)
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
    fetchResources()
  }, [fetchResources])

  const create = async (data) => {
    const res = await resourcesApi.createResource(data)
    await fetchResources()
    return res.data
  }

  const update = async (id, data) => {
    const res = await resourcesApi.updateResource(id, data)
    await fetchResources()
    return res.data
  }

  const remove = async (id) => {
    await resourcesApi.deleteResource(id)
    await fetchResources()
  }

  return { resources, loading, refreshing, error, refetch: fetchResources, create, update, remove }
}
