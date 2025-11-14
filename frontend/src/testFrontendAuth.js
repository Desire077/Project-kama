// Test script to verify frontend authentication
import api from './api';

// Test the API configuration
async function testFrontendAuth() {
  try {
    console.log('Testing frontend authentication...');
    
    // Check if token exists in localStorage
    const raw = localStorage.getItem('kama_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      console.log('Token found in localStorage:', parsed.token ? 'YES' : 'NO');
      if (parsed.token) {
        console.log('Token preview:', parsed.token.substring(0, 20) + '...');
      }
    } else {
      console.log('No token found in localStorage');
    }
    
    // Test a simple API call
    console.log('\nTesting API call to /api/properties...');
    try {
      const response = await api.get('/properties');
      console.log('API call successful:', response.status);
    } catch (error) {
      console.error('API call failed:', error.response?.status, error.response?.data);
    }
    
    console.log('\nFrontend authentication test completed!');
  } catch (error) {
    console.error('Frontend authentication test failed:', error);
  }
}

testFrontendAuth();