// scripts/checkUserRoles.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function checkUserRoles() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo for checking user roles');

  // Get all unique roles
  const roles = await User.distinct('role');
  console.log('Unique roles in database:', roles);
  
  // Count users by role
  for (const role of roles) {
    const count = await User.countDocuments({ role });
    console.log(`- ${role}: ${count} users`);
  }
  
  // Show all users with their roles
  const users = await User.find({}).select('email role firstName lastName');
  console.log('\\nAll users:');
  users.forEach(user => {
    console.log(`- ${user.email} (${user.role}) - ${user.firstName} ${user.lastName}`);
  });

  await mongoose.disconnect();
  console.log('User roles check finished');
}

checkUserRoles().catch(err => { 
  console.error(err); 
  process.exit(1); 
});