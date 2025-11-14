import api from './api'

export const fetchAdminProperties = ({ status = 'pending', page = 1, limit = 20 } = {}) => {
  return api.get('/api/admin/properties', { params: { status, page, limit } })
}

export const validateProperty = (id, status, reason) => api.put(`/api/admin/properties/${id}/validate`, { status, reason })

export default { fetchAdminProperties, validateProperty }
