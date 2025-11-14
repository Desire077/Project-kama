// scripts/testAirtelPayment.js
require('dotenv').config();
const mongoose = require('mongoose');
const airtelService = require('../services/airtelService');

// Connect to database
const connectDB = require('../config/db');
connectDB();

/**
 * Test Airtel Money payment functionality
 */
const testAirtelPayment = async () => {
  try {
    console.log('Testing Airtel Money payment system...');
    
    // Test token generation
    console.log('1. Testing token generation...');
    const token = await airtelService.generateToken();
    console.log('✓ Token generated successfully');
    console.log('Token:', token.substring(0, 20) + '...');
    
    // Note: For actual payment testing, you would need:
    // 1. A valid Gabon phone number with Airtel Money
    // 2. Sufficient funds on that account
    // 3. Proper Airtel API credentials in .env file
    
    console.log('\nNote: To test actual payments, you need:');
    console.log('- Valid Airtel API credentials in .env file');
    console.log('- A real Gabon phone number with Airtel Money');
    console.log('- Sufficient funds for testing');
    
    console.log('\nAirtel Money test completed!');
  } catch (error) {
    console.error('Error testing Airtel Money:', error.message);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Run the test if this script is executed directly
if (require.main === module) {
  testAirtelPayment();
}

module.exports = testAirtelPayment;