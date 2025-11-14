import api from './api';

export const userClient = {
  // Get user favorites
  getFavorites: () => {
    return api.get('/api/users/favorites');
  },

  // Add property to favorites
  addToFavorites: (propertyId) => {
    return api.post(`/api/users/favorites/${propertyId}`);
  },

  // Remove property from favorites
  removeFromFavorites: (propertyId) => {
    return api.delete(`/api/users/favorites/${propertyId}`);
  },

  // Get user profile
  getProfile: () => {
    return api.get('/api/users/profile');
  },

  // Update user profile
  updateProfile: (userData) => {
    return api.put('/api/users/profile', userData);
  },
  
  // Change user password
  changePassword: (passwordData) => {
    return api.put('/api/users/change-password', passwordData);
  },
  
  // Get user stats
  getStats: () => {
    return api.get('/api/users/stats');
  },
  
  // Get user alerts
  getAlerts: () => {
    return api.get('/api/users/alerts');
  },
  
  // Create user alert
  createAlert: (alertData) => {
    return api.post('/api/users/alerts', alertData);
  },
  
  // Delete user alert
  deleteAlert: (alertId) => {
    return api.delete(`/api/users/alerts/${alertId}`);
  },
  
  // Get matching properties for user alerts
  getMatchingPropertiesForAlerts: () => {
    return api.get('/api/users/alerts/matching');
  },

  
  // Get user by ID
  getById: (userId) => {
    // Validate user ID
    if (!userId || userId === 'undefined') {
      console.error('Invalid user ID provided to getById:', userId);
      return Promise.reject(new Error('ID utilisateur invalide'));
    }
    return api.get(`/api/users/${userId}`);
  },
  
  // Add comment to user
  addUserComment: (userId, commentData) => {
    return api.post(`/api/users/${userId}/comments`, commentData);
  },
  
  // Respond to user comment
  respondToUserComment: (userId, commentId, responseText) => {
    return api.post(`/api/users/${userId}/comments/${commentId}/responses`, { responseText });
  },
  
  // Get user comments
  getUserComments: (userId) => {
    // Validate user ID
    if (!userId || userId === 'undefined') {
      console.error('Invalid user ID provided to getUserComments:', userId);
      return Promise.reject(new Error('ID utilisateur invalide'));
    }
    return api.get(`/api/users/${userId}/comments`);
  },
  
  // Update profile picture
  updateProfilePicture: (userId, formData) => {
    return api.put(`/api/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Delete profile picture
  deleteProfilePicture: (userId) => {
    return api.delete(`/api/users/${userId}/avatar`);
  },
  
  // Get user subscription
  getSubscription: () => {
    return api.get('/api/users/subscription');
  },
  
  // Refresh user subscription status
  refreshSubscription: () => {
    return api.post('/api/users/subscription/refresh');
  }
};

export default userClient;