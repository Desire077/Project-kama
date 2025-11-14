// Test script to verify JWT token handling
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to database
const connectDB = require('../config/db');
connectDB();

async function testAuth() {
  try {
    console.log('Testing JWT token handling...');
    
    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find a seller user
    const seller = await User.findOne({ role: 'vendeur' });
    if (!seller) {
      console.log('No seller user found in database');
      return;
    }
    
    console.log('Found seller user:', seller.email);
    
    // Test JWT token generation
    console.log('\nTesting JWT token generation...');
    const token = jwt.sign(
      { id: seller._id.toString(), role: seller.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('Generated token:', token);
    
    // Test JWT token verification
    console.log('\nTesting JWT token verification...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Test refresh token generation
    console.log('\nTesting refresh token generation...');
    const refreshToken = jwt.sign(
      { id: seller._id.toString() },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('Generated refresh token:', refreshToken);
    
    // Test refresh token verification
    console.log('\nTesting refresh token verification...');
    const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log('Decoded refresh token:', decodedRefresh);
    
    console.log('\nJWT token handling test completed successfully!');
  } catch (error) {
    console.error('JWT token test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testAuth();