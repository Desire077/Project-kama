import axios from 'axios'

const AUTH_STORAGE_KEY = 'kama_auth'
const LEGACY_AUTH_KEY = 'auth_token'

const persistToken = (token) => {
  if (typeof window === 'undefined' || !token) return
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    parsed.token = token
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed))
  } catch (err) {
    // Stockage corrompu : on écrase avec une nouvelle structure saine
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token }))
  }
  try {
    localStorage.setItem(LEGACY_AUTH_KEY, token)
  } catch (_) {
    /* noop */
  }
}

const clearStoredAuth = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(LEGACY_AUTH_KEY)
}

const getStoredToken = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.token) return parsed.token
    }
  } catch (err) {
    // Si le JSON est invalide on nettoie pour éviter de boucler indéfiniment
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
  try {
    return localStorage.getItem(LEGACY_AUTH_KEY)
  } catch (_) {
    return null
  }
}

// baseURL doit pointer vers le host seulement pour éviter le /api/api (les routes client devront utiliser /api/...)
const baseURL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '')

const api = axios.create({
  baseURL,
  withCredentials: true, // important si backend utilise cookie httpOnly pour refresh tokens
  timeout: 15000 // 15s pour éviter les requêtes qui pendent en prod
})

// Met automatiquement Authorization: Bearer <token> si présent dans localStorage
api.interceptors.request.use(
  (config) => {
    try {
      if (!config.headers?.Authorization) {
        const token = getStoredToken()
        if (token) {
          config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
        }
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
    // Enrichir l'erreur sans casser la compatibilité
    try {
      err.normalizedMessage = err?.response?.data?.message || err?.message || 'Erreur réseau'
    } catch (_) {
      // noop
    }
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
        clearStoredAuth()
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
        persistToken(token)
        processQueue(null, token)
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        // if refresh fails, ensure tokens cleared
        clearStoredAuth()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)