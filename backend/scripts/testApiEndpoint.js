// Test script to verify the API endpoint
require('dotenv').config();
const axios = require('axios');

async function testApiEndpoint() {
  try {
    console.log('Testing API endpoint...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZTU4NDI5MWIzNzQwNzM1Yzk1Zjc3YSIsInJvbGUiOiJ2ZW5kZXVyIiwiaWF0IjoxNzYwMTcxNDEzLCJleHAiOjE3NjA3NzYyMTN9.87qbm3037Fh4we7gzNzR7MM1ecoKNQM33uqybCkW6BI';
    
    const response = await axios.get('http://localhost:5000/api/properties/my-properties', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('API test error:', error.response ? error.response.data : error.message);
  }
}

testApiEndpoint();