// scripts/testAdminAPI.js
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Property = require('../models/Property');

const MONGO_URI = process.env.MONGO_URI;

async function testAdminAPI() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo for testing admin API');

  // Test admin login simulation
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
    
    console.log('- Generated token:', token);
    
    // Test finding pending properties
    const pendingProperties = await Property.find({ status: 'pending' });
    console.log(`Found ${pendingProperties.length} pending properties`);
    
    if (pendingProperties.length > 0) {
      console.log('First pending property:');
      console.log('- ID:', pendingProperties[0]._id);
      console.log('- Title:', pendingProperties[0].title);
      console.log('- Status:', pendingProperties[0].status);
    }
  } else {
    console.log('Admin user not found');
  }

  await mongoose.disconnect();
  console.log('API test finished');
}

testAdminAPI().catch(err => { 
  console.error(err); 
  process.exit(1); 
});