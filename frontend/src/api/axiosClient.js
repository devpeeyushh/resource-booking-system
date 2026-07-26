import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Central place to normalize every error response from the API into a
// single shape the rest of the app can rely on: a plain Error whose
// .message is always safe to show the user, plus .code and .details
// (field-level validation errors) when the backend provides them.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Backend reached, but responded with an error (4xx/5xx) --
    // shape: { error: { code, message, details } }
    if (error.response) {
      const apiError = error.response.data?.error
      const normalized = new Error(apiError?.message || 'Something went wrong')
      normalized.status = error.response.status
      normalized.code = apiError?.code
      normalized.details = apiError?.details
      return Promise.reject(normalized)
    }

    // Request never got a response: backend down, no network, CORS
    // failure, or the request timed out.
    const normalized = new Error(
      error.code === 'ECONNABORTED'
        ? 'The request timed out. Please try again.'
        : 'Unable to reach the server. Check your connection and try again.'
    )
    normalized.code = 'NETWORK_ERROR'
    return Promise.reject(normalized)
  }
)

export default axiosClient
