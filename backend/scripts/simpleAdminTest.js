// scripts/simpleAdminTest.js
const https = require('https');
const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function simpleAdminTest() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo for simple admin test');

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
    
    console.log('\\nTo test the admin endpoints manually, use these curl commands:');
    console.log('');
    console.log('1. Test GET /api/admin/properties:');
    console.log(`   curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/admin/properties`);
    console.log('');
    console.log('2. Test GET /api/admin/users/list:');
    console.log(`   curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/admin/users/list`);
    console.log('');
    console.log('3. Test GET /api/admin/listings/pending:');
    console.log(`   curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/admin/listings/pending`);
    console.log('');
    console.log('4. Test GET /api/admin/statistics:');
    console.log(`   curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/admin/statistics`);
    
  } else {
    console.log('Admin user not found');
  }

  await mongoose.disconnect();
  console.log('\\nSimple admin test finished');
}

simpleAdminTest().catch(err => { 
  console.error(err); 
  process.exit(1); 
});