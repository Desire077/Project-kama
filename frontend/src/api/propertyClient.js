import api from './api';

export const propertyClient = {
  // Get all properties with filters
  getAll: async (params = {}) => {
    try {
      // Ensure arrays are properly serialized for query params
      const serializedParams = { ...params };
      if (Array.isArray(serializedParams.type)) {
        // Axios will serialize arrays correctly, but we ensure it's an array
        serializedParams.type = serializedParams.type;
      }
      const response = await api.get('/api/properties', { 
        params: serializedParams,
        paramsSerializer: {
          indexes: null // Use bracket notation: type[]=value1&type[]=value2
        }
      });
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.getAll error:', error);
      throw error;
    }
  },

  // Get property by ID
  getById: async (id) => {
    try {
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
      const response = await api.get('/api/properties/my-properties');
      // Handle response format { properties: [...] }
      return response.data?.properties || response.data || response;
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
      const response = await api.get(`/api/properties/user/${userId}`);
      // Handle response - should be an array of properties
      const data = response.data || response;
      // Ensure we always return an array
      let result = [];
      if (Array.isArray(data)) {
        result = data;
      } else if (data && data.properties) {
        result = Array.isArray(data.properties) ? data.properties : [data.properties];
      } else if (data) {
        result = [data];
      }
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
      const response = await api.post(`/api/properties/${propertyId}/comments/${commentId}/report`, reportData);
      return response.data || response;
    } catch (error) {
      console.error('propertyClient.reportComment error:', error);
      throw error;
    }
  }
};

export default propertyClient;