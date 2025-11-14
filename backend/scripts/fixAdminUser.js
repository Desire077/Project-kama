// scripts/fixAdminUser.js
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function fixAdminUser() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo for fixing admin user');

  // Find and update the admin user
  const adminUser = await User.findOne({ email: 'votrepostulateur@gmail.com' });
  
  if (adminUser) {
    console.log('Found user:');
    console.log('- ID:', adminUser._id);
    console.log('- Email:', adminUser.email);
    console.log('- Current Role:', adminUser.role);
    
    // Update role to admin
    adminUser.role = 'admin';
    await adminUser.save();
    
    console.log('Updated user role to admin');
  } else {
    console.log('Admin user not found');
    
    // Create the admin user if not exists
    const hashedPassword = await bcrypt.hash('Japhetdesire@2008', 10);
    const newUser = await User.create({
      role: 'admin',
      firstName: 'Japhet',
      lastName: 'Desire',
      email: 'votrepostulateur@gmail.com',
      password: hashedPassword
    });
    
    console.log('Created new admin user:');
    console.log('- ID:', newUser._id);
    console.log('- Email:', newUser.email);
    console.log('- Role:', newUser.role);
  }

  await mongoose.disconnect();
  console.log('Fix finished');
}

fixAdminUser().catch(err => { 
  console.error(err); 
  process.exit(1); 
});