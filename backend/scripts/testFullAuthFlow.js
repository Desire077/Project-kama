// Test script to verify the full authentication flow
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { login } = require('../controllers/authController');

// Connect to database
const connectDB = require('../config/db');
connectDB();

// Mock request and response objects for testing
async function testFullAuthFlow() {
  try {
    console.log('Testing full authentication flow...');
    
    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find a seller user
    const seller = await User.findOne({ role: 'vendeur' });
    if (!seller) {
      console.log('No seller user found in database');
      return;
    }
    
    console.log('Found seller user:', seller.email);
    
    // Test login functionality
    const req = {
      body: {
        email: seller.email,
        password: 'VendeurPass123' // Correct password from seed script
      }
    };
    
    let tokenReceived = null;
    const res = {
      json: function(data) {
        console.log('Login response data:', data);
        if (data && data.token) {
          tokenReceived = data.token;
          console.log('Token received:', tokenReceived);
        }
        return this;
      },
      status: function(code) {
        console.log('Response status:', code);
        return this;
      },
      cookie: function(name, value, options) {
        console.log('Cookie set:', name, value, options);
        return this;
      }
    };
    
    console.log('Attempting login...');
    await login(req, res);
    
    if (tokenReceived) {
      // Test protected route with the token
      console.log('\nTesting protected route access...');
      
      // Mock request with authorization header
      const protectedReq = {
        headers: {
          authorization: `Bearer ${tokenReceived}`
        }
      };
      
      let userAttached = null;
      const protectedRes = {
        json: function(data) {
          console.log('Protected route response data:', data);
          return this;
        },
        status: function(code) {
          console.log('Protected route response status:', code);
          return this;
        }
      };
      
      // Import and test the protect middleware
      const { protect } = require('../middlewares/authMiddleware');
      
      console.log('Calling protect middleware...');
      // We need to simulate the middleware chain
      const next = function() {
        console.log('Middleware passed successfully');
        userAttached = protectedReq.user;
        console.log('User attached to request:', userAttached);
      };
      
      await protect(protectedReq, protectedRes, next);
      
      if (userAttached) {
        console.log('\nFull authentication flow test completed successfully!');
      }
    }
    
  } catch (error) {
    console.error('Full authentication flow test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testFullAuthFlow();