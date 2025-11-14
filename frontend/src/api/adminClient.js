import api from './api'

export const fetchManualPayments = ({ status, page = 1, limit = 50 } = {}) => {
  const params = { status, page, limit }
  return api.get('/api/payments/manual/list', { params })
}

export const confirmManualPayment = (paymentId, confirm = true) => {
  return api.post('/api/payments/manual/confirm', { paymentId, confirm })
}

export default { fetchManualPayments, confirmManualPayment }
