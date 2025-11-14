const axios = require('axios');

// Test the profile API endpoints
async function testProfileAPI() {
  try {
    console.log('Testing profile API endpoints...');
    
    // First, let's login to get a token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login response:', loginResponse.data);
    
    const token = loginResponse.data.token;
    console.log('Token:', token);
    
    // Test getting user profile
    const profileResponse = await axios.get('http://localhost:5000/api/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Profile response:', profileResponse.data);
    
    // Test getting user properties
    const propertiesResponse = await axios.get(`http://localhost:5000/api/properties/user/${profileResponse.data._id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Properties response:', propertiesResponse.data);
    
  } catch (error) {
    console.error('Error testing profile API:', error.response?.data || error.message);
  }
}

testProfileAPI();