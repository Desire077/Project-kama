// Test script to verify property endpoints
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const jwt = require('jsonwebtoken');

// Connect to database
const connectDB = require('../config/db');
connectDB();

async function testPropertyEndpoints() {
  try {
    console.log('Testing property endpoints...');
    
    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find a seller user
    const seller = await User.findOne({ role: 'vendeur' });
    if (!seller) {
      console.log('No seller user found in database');
      return;
    }
    
    console.log('Found seller user:', seller.email);
    
    // Create a test property
    const property = await Property.create({
      owner: seller._id,
      title: 'Test Property for API Testing',
      description: 'Test property for debugging API endpoints',
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
    
    // Generate a token for the seller
    const token = jwt.sign(
      { id: seller._id.toString(), role: seller.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('Generated token for testing:', token);
    
    // Test the update endpoint
    console.log('\n--- Testing Update Endpoint ---');
    try {
      const updatedData = {
        title: 'Updated Test Property',
        price: 150000
      };
      
      // Simulate the update function
      const updatedProperty = await Property.findByIdAndUpdate(
        property._id,
        updatedData,
        { new: true, runValidators: true }
      ).populate('owner', 'firstName lastName email whatsapp');
      
      console.log('Update successful:', {
        title: updatedProperty.title,
        price: updatedProperty.price
      });
    } catch (updateError) {
      console.error('Update failed:', updateError.message);
    }
    
    // Test the delete endpoint
    console.log('\n--- Testing Delete Endpoint ---');
    try {
      await Property.findByIdAndDelete(property._id);
      console.log('Delete successful');
    } catch (deleteError) {
      console.error('Delete failed:', deleteError.message);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testPropertyEndpoints();