import api from './api'

export async function initiateManualPayment(payload){
  const res = await api.post('/payments/manual/initiate', payload)
  return res.data
}

export async function submitManualPayment(payload){
  const res = await api.post('/payments/manual/submit', payload)
  return res.data
}

export async function confirmManualPayment(payload){
  const res = await api.post('/payments/manual/confirm', payload)
  return res.data
}

export default { initiateManualPayment, submitManualPayment, confirmManualPayment }
