// backend/scripts/testImageEndpoints.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test the image handling endpoints
async function testImageEndpoints() {
  const baseURL = 'http://localhost:5000/api';
  console.log('Testing image handling endpoints...');
  
  try {
    // First, let's try to get properties to see if the API is working
    console.log('Fetching properties...');
    const propertiesResponse = await axios.get(`${baseURL}/properties`);
    console.log('Properties fetched successfully:', propertiesResponse.data.properties.length);
    
    // Test a public endpoint
    if (propertiesResponse.data.properties.length > 0) {
      const propertyId = propertiesResponse.data.properties[0]._id;
      console.log('Testing property detail endpoint for property:', propertyId);
      
      // This should work without authentication for public properties
      const propertyResponse = await axios.get(`${baseURL}/properties/${propertyId}`);
      console.log('Property detail fetched successfully');
      console.log('Property images:', propertyResponse.data.images);
    }
    
    console.log('✅ Basic API endpoints are working');
  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testImageEndpoints();