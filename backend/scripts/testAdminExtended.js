// scripts/testAdminExtended.js
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Property = require('../models/Property');

const MONGO_URI = process.env.MONGO_URI;

async function testAdminExtended() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo for testing extended admin features');

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
    
    // Test finding all properties
    const allProperties = await Property.find({});
    console.log(`Found ${allProperties.length} total properties`);
    
    // Test finding reported properties
    const reportedProperties = await Property.find({ 'reports.0': { $exists: true } });
    console.log(`Found ${reportedProperties.length} reported properties`);
    
    // Test statistics
    const totalUsers = await User.countDocuments({});
    const totalProperties = await Property.countDocuments({});
    const pendingProperties = await Property.countDocuments({ status: 'pending' });
    
    console.log('\\nStatistics:');
    console.log('- Total Users:', totalUsers);
    console.log('- Total Properties:', totalProperties);
    console.log('- Pending Properties:', pendingProperties);
    
    // Test user roles distribution
    const userRoles = {
      user: await User.countDocuments({ role: 'user' }),
      seller: await User.countDocuments({ role: 'seller' }),
      admin: await User.countDocuments({ role: 'admin' })
    };
    
    console.log('- User Roles:', userRoles);
    
  } else {
    console.log('Admin user not found');
  }

  await mongoose.disconnect();
  console.log('Extended admin test finished');
}

testAdminExtended().catch(err => { 
  console.error(err); 
  process.exit(1); 
});