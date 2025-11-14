// backend/scripts/createTestProperty.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Create a test property with images
async function createTestProperty() {
  const baseURL = 'http://localhost:5000/api';
  console.log('Creating test property with images...');
  
  try {
    // First, let's register a test user
    console.log('Registering test user...');
    const registerResponse = await axios.post(`${baseURL}/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      role: 'vendeur',
      whatsapp: '+241000000000'
    });
    
    console.log('User registered successfully');
    const token = registerResponse.data.token;
    
    // Create a property
    console.log('Creating property...');
    const propertyResponse = await axios.post(`${baseURL}/properties`, {
      title: 'Test Property with Images',
      description: 'This is a test property to verify image handling',
      type: 'maison',
      price: 100000,
      surface: 100,
      rooms: 2,
      bathrooms: 1,
      address: {
        city: 'Test City',
        country: 'Test Country'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Property created successfully:', propertyResponse.data.property._id);
    const propertyId = propertyResponse.data.property._id;
    
    console.log('✅ Test property created successfully!');
    console.log('Next steps: Test image upload for this property');
    
  } catch (error) {
    console.error('❌ Error creating test property:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

createTestProperty();