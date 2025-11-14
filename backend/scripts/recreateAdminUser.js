// scripts/recreateAdminUser.js
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function recreateAdminUser() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo for recreating admin user');

  // Delete existing user
  const deletedUser = await User.findOneAndDelete({ email: 'votrepostulateur@gmail.com' });
  
  if (deletedUser) {
    console.log('Deleted existing user:', deletedUser.email);
  }
  
  // Create the admin user with correct password
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
  
  // Test password verification
  const isPasswordValid = await bcrypt.compare('Japhetdesire@2008', newUser.password);
  console.log('- Password valid:', isPasswordValid);

  await mongoose.disconnect();
  console.log('Recreation finished');
}

recreateAdminUser().catch(err => { 
  console.error(err); 
  process.exit(1); 
});