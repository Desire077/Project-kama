// Test script to verify property access functionality
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');

// Connect to database
const connectDB = require('../config/db');
connectDB();

// Mock request and response objects for testing
async function testPropertyAccess() {
  try {
    console.log('Testing property access functionality...');
    
    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find a seller user
    const seller = await User.findOne({ role: 'vendeur' });
    if (!seller) {
      console.log('No seller user found in database');
      return;
    }
    
    console.log('Found seller user:', seller.email);
    
    // Create a mock property for this seller
    const property = await Property.create({
      owner: seller._id,
      title: 'Test Property',
      description: 'Test property for debugging',
      type: 'maison',
      price: 100000,
      surface: 100,
      address: {
        city: 'Test City',
        district: 'Test District'
      },
      status: 'online'
    });
    
    console.log('Created test property with ID:', property._id);
    
    // Test the getMyProperties function
    const req = {
      user: {
        id: seller._id.toString(),
        role: seller.role,
        email: seller.email
      }
    };
    
    const res = {
      json: function(data) {
        console.log('Response data:', data);
        console.log('Number of properties found:', Array.isArray(data) ? data.length : 'Not an array');
        return this;
      },
      status: function(code) {
        console.log('Response status:', code);
        return this;
      }
    };
    
    // Import and test the getMyProperties function
    const { getMyProperties } = require('../controllers/propertyController');
    console.log('Calling getMyProperties...');
    await getMyProperties(req, res);
    
    // Clean up test property
    await Property.findByIdAndDelete(property._id);
    console.log('Cleaned up test property');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testPropertyAccess();