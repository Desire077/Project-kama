// api/airtelClient.js
import api from './api';

// Initiate Airtel Money payment
export const initiateAirtelPayment = async (data) => {
  try {
    const response = await api.post('/payments/airtel/init', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'initialisation du paiement Airtel Money');
  }
};

// Check payment status
export const checkAirtelPaymentStatus = async (reference) => {
  try {
    const response = await api.get(`/payments/airtel/status/${reference}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la vérification du statut du paiement');
  }
};

// Get payment history
export const getAirtelPaymentHistory = async () => {
  try {
    const response = await api.get('/payments/airtel/history');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'historique des paiements');
  }
};

export default {
  initiateAirtelPayment,
  checkAirtelPaymentStatus,
  getAirtelPaymentHistory
};