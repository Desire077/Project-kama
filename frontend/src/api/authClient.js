import api from './api'

export async function register(payload) {
  // payload: { firstName, lastName, email, password, ... }
  const res = await api.post('/api/auth/register', payload)
  const { token, user } = res.data || {}
  if (token) localStorage.setItem('auth_token', token)
  if (user) localStorage.setItem('auth_user', JSON.stringify(user))
  return res.data
}

export async function login(credentials) {
  // credentials: { email, password }
  const res = await api.post('/api/auth/login', credentials)
  const { token, user } = res.data || {}
  if (token) localStorage.setItem('auth_token', token)
  if (user) localStorage.setItem('auth_user', JSON.stringify(user))
  return res.data
}

export async function refresh() {
  // backend must expose POST /api/auth/refresh and use httpOnly cookie for refresh token
  const res = await api.post('/api/auth/refresh')
  const { token, user } = res.data || {}
  if (token) localStorage.setItem('auth_token', token)
  if (user) localStorage.setItem('auth_user', JSON.stringify(user))
  return res.data
}

export async function logout() {
  try {
    await api.post('/api/auth/logout')
  } catch (e) {
    // ignore server error on logout
  }
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}

const authClient = { register, login, refresh, logout }
export default authClient