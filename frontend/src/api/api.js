import axios from 'axios'

// baseURL doit pointer vers le host seulement pour éviter le /api/api (les routes client devront utiliser /api/...)
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL,
  withCredentials: true, // important si backend utilise cookie httpOnly pour refresh tokens
})

// Met automatiquement Authorization: Bearer <token> si présent dans localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
      }
    } catch (e) {
      /* noop */
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor optionnel : log propre pour debug
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // console.error('API error:', err?.response?.status, err?.response?.data);
    return Promise.reject(err)
  }
)

export default api

// Response interceptor to handle 401 by attempting refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  response => {
    console.log('API response:', response.status, response.config.url)
    return response
  },
  async (error) => {
    console.error('API error:', error.response?.status, error.response?.data, error.config?.url)
    
    // Check if user is banned
    if (error.response && error.response.status === 403 && error.response.data.message && error.response.data.message.includes('banni')) {
      // Show banned user modal
      alert('Votre compte a été banni. Contactez le support pour plus d\'informations.');
      // Clear auth data and redirect to login
      try {
        localStorage.removeItem('kama_auth')
        window.location.href = '/login'
      } catch (e) {
        console.error('Error clearing auth data:', e)
      }
      return Promise.reject(error)
    }
    
    const originalRequest = error.config
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await api.post('/api/auth/refresh')
        const { token } = res.data
        // update localStorage
        try {
          const raw = localStorage.getItem('kama_auth')
          const parsed = raw ? JSON.parse(raw) : {}
          parsed.token = token
          localStorage.setItem('kama_auth', JSON.stringify(parsed))
        } catch (e) {}

        processQueue(null, token)
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        // if refresh fails, ensure tokens cleared
        try { localStorage.removeItem('kama_auth') } catch (e) {}
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)