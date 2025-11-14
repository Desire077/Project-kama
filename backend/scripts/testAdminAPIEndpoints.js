// scripts/testAdminAPIEndpoints.js
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;
const BASE_URL = 'http://localhost:5000/api';

async function testAdminAPIEndpoints() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo for testing admin API endpoints');

  // Test admin user
  const adminUser = await User.findOne({ email: 'votrepostulateur@gmail.com', role: 'admin' });
  
  if (adminUser) {
    console.log('Admin user found:');
    console.log('- ID:', adminUser._id);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: adminUser._id, role: adminUser.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('- Generated token:', token.substring(0, 20) + '...');
    
    // Test the admin endpoints
    try {
      console.log('\\nTesting admin endpoints...');
      
      // Test GET /api/admin/properties
      console.log('\\n1. Testing GET /api/admin/properties');
      const propertiesResponse = await axios.get(`${BASE_URL}/admin/properties`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('   Status:', propertiesResponse.status);
      console.log('   Data count:', propertiesResponse.data.count);
      
      // Test GET /api/admin/users/list
      console.log('\\n2. Testing GET /api/admin/users/list');
      const usersResponse = await axios.get(`${BASE_URL}/admin/users/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('   Status:', usersResponse.status);
      console.log('   Data count:', usersResponse.data.count);
      
      // Test GET /api/admin/listings/pending
      console.log('\\n3. Testing GET /api/admin/listings/pending');
      const pendingResponse = await axios.get(`${BASE_URL}/admin/listings/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('   Status:', pendingResponse.status);
      console.log('   Data count:', pendingResponse.data.count);
      
      // Test GET /api/admin/statistics
      console.log('\\n4. Testing GET /api/admin/statistics');
      const statsResponse = await axios.get(`${BASE_URL}/admin/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('   Status:', statsResponse.status);
      console.log('   Overview:', statsResponse.data.overview);
      
      console.log('\\n✅ All admin endpoints are working correctly!');
      
    } catch (error) {
      console.error('\\n❌ Error testing admin endpoints:');
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      } else {
        console.error('   Message:', error.message);
      }
    }
    
  } else {
    console.log('Admin user not found');
  }

  await mongoose.disconnect();
  console.log('\\nAdmin API endpoints test finished');
}

testAdminAPIEndpoints().catch(err => { 
  console.error(err); 
  process.exit(1); 
});