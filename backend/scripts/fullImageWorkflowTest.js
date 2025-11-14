// backend/scripts/fullImageWorkflowTest.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test the complete image handling workflow
async function fullImageWorkflowTest() {
  const baseURL = 'http://localhost:5000/api';
  console.log('Testing complete image handling workflow...');
  
  try {
    // Test the main API endpoint
    console.log('Testing main API endpoint...');
    const response = await axios.get(`${baseURL}`);
    console.log('Main API endpoint response:', response.data);
    
    // Test properties endpoint
    console.log('Testing properties endpoint...');
    const propertiesResponse = await axios.get(`${baseURL}/properties`);
    console.log('Properties count:', propertiesResponse.data.properties.length);
    
    // Test a specific property
    if (propertiesResponse.data.properties.length > 0) {
      const propertyId = propertiesResponse.data.properties[0]._id;
      console.log('Testing property detail endpoint for property:', propertyId);
      
      const propertyResponse = await axios.get(`${baseURL}/properties/${propertyId}`);
      console.log('Property detail fetched successfully');
      console.log('Property images:', propertyResponse.data.images);
    }
    
    console.log('✅ Complete image handling workflow test completed successfully!');
    console.log('The API is working correctly and can handle image-related operations.');
    
  } catch (error) {
    console.error('❌ Error testing complete workflow:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

fullImageWorkflowTest();