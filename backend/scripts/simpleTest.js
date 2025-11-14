// backend/scripts/simpleTest.js
const axios = require('axios');

// Simple test to verify API is working
async function simpleTest() {
  const baseURL = 'http://localhost:5000/api';
  console.log('Testing API connectivity...');
  
  try {
    // Test the main API endpoint
    console.log('Testing main API endpoint...');
    const response = await axios.get(`${baseURL}`);
    console.log('Main API endpoint response:', response.data);
    
    // Test properties endpoint
    console.log('Testing properties endpoint...');
    const propertiesResponse = await axios.get(`${baseURL}/properties`);
    console.log('Properties count:', propertiesResponse.data.properties.length);
    
    console.log('✅ API is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

simpleTest();