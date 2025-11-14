// scripts/checkUserPassword.js
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function checkUserPassword() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo for checking user password');

  // Test finding the admin user
  const adminUser = await User.findOne({ email: 'votrepostulateur@gmail.com', role: 'admin' });
  
  if (adminUser) {
    console.log('Admin user found:');
    console.log('- ID:', adminUser._id);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    
    // Test password verification with different possible passwords
    const possiblePasswords = [
      'Japhetdesire@2008',
      'japhetdesire@2008',
      'JaphetDesire@2008',
      'Japhetdesire2008',
      'japhetdesire2008'
    ];
    
    for (const password of possiblePasswords) {
      const isPasswordValid = await bcrypt.compare(password, adminUser.password);
      console.log(`- Password "${password}" valid:`, isPasswordValid);
    }
  } else {
    console.log('Admin user not found');
  }

  await mongoose.disconnect();
  console.log('Check finished');
}

checkUserPassword().catch(err => { 
  console.error(err); 
  process.exit(1); 
});