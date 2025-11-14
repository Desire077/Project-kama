import api from './api';

export const propertyClient = {
  // Get all properties with filters
  getAll: async (params = {}) => {
    try {
      console.log('propertyClient.getAll called with params:', params);
      const response = await api.get('/api/properties', { params });
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.getAll error:', error);
      throw error;
    }
  },

  // Get property by ID
  getById: async (id) => {
    try {
      console.log('propertyClient.getById called with id:', id);
      const response = await api.get(`/api/properties/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.getById error:', error);
      throw error;
    }
  },

  // Get properties of current user
  getMyProperties: async () => {
    try {
      console.log('propertyClient.getMyProperties called');
      const response = await api.get('/api/properties/my-properties');
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.getMyProperties error:', error);
      // Enhanced error handling to provide more details
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      throw error;
    }
  },

  // Get properties by user ID
  getByUser: async (userId) => {
    try {
      // Validate user ID
      if (!userId || userId === 'undefined') {
        console.error('Invalid user ID provided to getByUser:', userId);
        throw new Error('ID utilisateur invalide');
      }
      
      console.log('propertyClient.getByUser called with userId:', userId);
      const response = await api.get(`/api/properties/user/${userId}`);
      console.log('Raw response from getByUser:', response);
      // Handle response - should be an array of properties
      const data = response.data || response;
      console.log('Processed data from getByUser:', data);
      // Ensure we always return an array
      const result = Array.isArray(data) ? data : (data ? [data] : []);
      console.log('Final result from getByUser:', result);
      return result;
    } catch (error) {
      console.error('propertyClient.getByUser error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      throw error;
    }
  },

  // Create a new property
  create: async (propertyData) => {
    try {
      console.log('propertyClient.create called with data:', propertyData);
      const response = await api.post('/api/properties', propertyData);
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.create error:', error);
      throw error;
    }
  },

  // Update a property
  update: async (id, propertyData) => {
    try {
      console.log('propertyClient.update called with id:', id, 'and data:', propertyData);
      const response = await api.put(`/api/properties/${id}`, propertyData);
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.update error:', error);
      throw error;
    }
  },

  // Delete a property
  delete: async (id) => {
    try {
      console.log('propertyClient.delete called with id:', id);
      const response = await api.delete(`/api/properties/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.delete error:', error);
      throw error;
    }
  },

  // Upload images for a property
  uploadImages: async (id, formData) => {
    try {
      console.log('propertyClient.uploadImages called with id:', id);
      const response = await api.post(`/api/properties/${id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.uploadImages error:', error);
      throw error;
    }
  },

  // Upload documents for a property
  uploadDocuments: async (id, formData) => {
    try {
      console.log('propertyClient.uploadDocuments called with id:', id);
      const response = await api.post(`/api/properties/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.uploadDocuments error:', error);
      throw error;
    }
  },

  // Remove an image from a property
  removeImage: async (propertyId, publicId) => {
    try {
      console.log('propertyClient.removeImage called with propertyId:', propertyId, 'and publicId:', publicId);
      const response = await api.delete(`/api/properties/${propertyId}/images/${publicId}`);
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.removeImage error:', error);
      throw error;
    }
  },

  // Get property reviews
  getPropertyReviews: async (id) => {
    try {
      console.log('propertyClient.getPropertyReviews called with id:', id);
      const response = await api.get(`/api/properties/${id}/reviews`);
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.getPropertyReviews error:', error);
      throw error;
    }
  },

  // Add a review to a property
  addReview: async (id, reviewData) => {
    try {
      console.log('propertyClient.addReview called with id:', id, 'and data:', reviewData);
      const response = await api.post(`/api/properties/${id}/reviews`, reviewData);
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.addReview error:', error);
      throw error;
    }
  },

  // Respond to a review
  respondToReview: async (propertyId, reviewId, responseText) => {
    try {
      console.log('propertyClient.respondToReview called with propertyId:', propertyId, 'reviewId:', reviewId);
      const response = await api.post(`/api/properties/${propertyId}/reviews/${reviewId}/responses`, { responseText });
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.respondToReview error:', error);
      throw error;
    }
  },

  // Get seller contact info
  getContact: async (id) => {
    try {
      console.log('propertyClient.getContact called with id:', id);
      const response = await api.get(`/api/properties/${id}/contact`);
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.getContact error:', error);
      throw error;
    }
  },

  // Report a property
  reportProperty: async (id, reportData) => {
    try {
      console.log('propertyClient.reportProperty called with id:', id, 'and data:', reportData);
      const response = await api.post(`/api/properties/${id}/report`, reportData);
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.reportProperty error:', error);
      throw error;
    }
  },

  // Report a comment
  reportComment: async (propertyId, commentId, reportData) => {
    try {
      console.log('propertyClient.reportComment called with propertyId:', propertyId, 'commentId:', commentId, 'and data:', reportData);
      const response = await api.post(`/api/properties/${propertyId}/comments/${commentId}/report`, reportData);
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.reportComment error:', error);
      throw error;
    }
  }
};

export default propertyClient;