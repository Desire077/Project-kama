// scripts/listUsers.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function listUsers() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo for listing users');

  // List all users
  const users = await User.find({});
  
  console.log(`Found ${users.length} users:`);
  users.forEach(user => {
    console.log('- ID:', user._id);
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  First Name:', user.firstName);
    console.log('  Last Name:', user.lastName);
    console.log('  ---');
  });

  await mongoose.disconnect();
  console.log('Listing finished');
}

listUsers().catch(err => { 
  console.error(err); 
  process.exit(1); 
});