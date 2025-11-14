// Test script to verify property CRUD operations
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const jwt = require('jsonwebtoken');

// Connect to database
const connectDB = require('../config/db');
connectDB();

async function testPropertyCRUD() {
  try {
    console.log('Testing property CRUD operations...');
    
    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find a seller user
    const seller = await User.findOne({ role: 'vendeur' });
    if (!seller) {
      console.log('No seller user found in database');
      return;
    }
    
    console.log('Found seller user:', seller.email);
    
    // Generate a token for the seller
    const token = jwt.sign(
      { id: seller._id.toString(), role: seller.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('Generated token for testing:', token.substring(0, 20) + '...');
    
    // Create a test property
    console.log('\n--- Testing Create Operation ---');
    const newPropertyData = {
      owner: seller._id,
      title: 'Test Property for CRUD Testing',
      description: 'Test property for debugging CRUD operations',
      type: 'maison',
      price: 100000,
      surface: 100,
      address: {
        city: 'Test City',
        district: 'Test District'
      },
      status: 'online'
    };
    
    const createdProperty = await Property.create(newPropertyData);
    console.log('Created property with ID:', createdProperty._id);
    
    // Test the update operation
    console.log('\n--- Testing Update Operation ---');
    try {
      const updatedData = {
        title: 'Updated Test Property',
        price: 150000,
        description: 'This property has been updated'
      };
      
      // Simulate the update function
      const updatedProperty = await Property.findByIdAndUpdate(
        createdProperty._id,
        updatedData,
        { new: true, runValidators: true }
      ).populate('owner', 'firstName lastName email whatsapp');
      
      console.log('Update successful:', {
        title: updatedProperty.title,
        price: updatedProperty.price,
        description: updatedProperty.description
      });
    } catch (updateError) {
      console.error('Update failed:', updateError.message);
    }
    
    // Test the delete operation
    console.log('\n--- Testing Delete Operation ---');
    try {
      const deletedProperty = await Property.findByIdAndDelete(createdProperty._id);
      console.log('Delete successful:', deletedProperty ? 'Property deleted' : 'Property not found');
    } catch (deleteError) {
      console.error('Delete failed:', deleteError.message);
    }
    
    console.log('\nProperty CRUD operations test completed successfully!');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testPropertyCRUD();