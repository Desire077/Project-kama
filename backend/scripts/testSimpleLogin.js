// Simple test script to verify login function
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to database
const connectDB = require('../config/db');
connectDB();

async function testSimpleLogin() {
  try {
    console.log('Testing simple login...');
    
    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find a seller user
    const seller = await User.findOne({ role: 'vendeur' });
    if (!seller) {
      console.log('No seller user found in database');
      return;
    }
    
    console.log('Found seller user:', seller.email);
    console.log('User ID:', seller._id);
    console.log('User role:', seller.role);
    
    console.log('\nSimple login test completed successfully!');
  } catch (error) {
    console.error('Simple login test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testSimpleLogin();