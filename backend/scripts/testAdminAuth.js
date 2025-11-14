// scripts/testAdminAuth.js
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function testAdminAuth() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo for testing');

  // Test finding the admin user
  const adminUser = await User.findOne({ email: 'votrepostulateur@gmail.com', role: 'admin' });
  
  if (adminUser) {
    console.log('Admin user found:');
    console.log('- ID:', adminUser._id);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    
    // Test password verification
    const isPasswordValid = await bcrypt.compare('Japhetdesire@2008', adminUser.password);
    console.log('- Password valid:', isPasswordValid);
  } else {
    console.log('Admin user not found');
  }

  await mongoose.disconnect();
  console.log('Test finished');
}

testAdminAuth().catch(err => { 
  console.error(err); 
  process.exit(1); 
});