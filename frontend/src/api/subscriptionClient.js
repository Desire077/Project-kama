// api/subscriptionClient.js
import api from './api';

// Create a subscription payment session
export const createSubscriptionSession = async (data) => {
  try {
    const response = await api.post('/subscriptions/create-session', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la création de la session de paiement');
  }
};

// Get user's subscription status
export const getUserSubscription = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data.user.subscription;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des informations d\'abonnement');
  }
};

// Admin: Get all payments
export const getPayments = async (params = {}) => {
  try {
    const response = await api.get('/admin/payments', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des paiements');
  }
};

// Admin: Update user subscription
export const updateUserSubscription = async (userId, data) => {
  try {
    const response = await api.put(`/admin/users/${userId}/subscription`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'abonnement');
  }
};

export default {
  createSubscriptionSession,
  getUserSubscription,
  getPayments,
  updateUserSubscription
};