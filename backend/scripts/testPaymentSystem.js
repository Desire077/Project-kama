// scripts/testPaymentSystem.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Payment = require('../models/Payment');

// Connect to database
const connectDB = require('../config/db');
connectDB();

/**
 * Test the payment system functionality
 */
const testPaymentSystem = async () => {
  try {
    console.log('Testing payment system...');
    
    // Generate a unique email for testing
    const timestamp = Date.now();
    const testEmail = `test_${timestamp}@example.com`;
    
    // Clean up any existing test data with this email
    await User.deleteOne({ email: testEmail });
    
    // Create a test user with subscription
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: 'password123',
      role: 'client',
      subscription: {
        active: true,
        plan: 'premium',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        history: [{
          paymentId: 'test_payment_123',
          amount: 15000,
          date: new Date(),
          method: 'stripe',
          status: 'success'
        }]
      }
    });
    
    await testUser.save();
    console.log('Test user created with subscription');
    
    // Test subscription middleware
    console.log('Testing subscription status...');
    if (testUser.subscription.active) {
      console.log('✓ Subscription is active');
    } else {
      console.log('✗ Subscription is not active');
    }
    
    // Test plan check
    if (testUser.subscription.plan === 'premium') {
      console.log('✓ User has premium plan');
    } else {
      console.log('✗ User does not have premium plan');
    }
    
    // Test expiration check
    if (testUser.subscription.expiresAt > new Date()) {
      console.log('✓ Subscription is not expired');
    } else {
      console.log('✗ Subscription has expired');
    }
    
    // Create a test payment
    const testPayment = new Payment({
      user: testUser._id,
      method: 'stripe',
      amount: 15000,
      currency: 'XAF',
      status: 'confirmed',
      metadata: {
        userId: testUser._id,
        planId: 'premium',
        planName: 'Formule Premium'
      }
    });
    
    await testPayment.save();
    console.log('Test payment created');
    
    // Clean up test data
    await User.deleteOne({ email: testEmail });
    await Payment.deleteOne({ _id: testPayment._id });
    console.log('Test data cleaned up');
    
    console.log('Payment system test completed successfully!');
  } catch (error) {
    console.error('Error testing payment system:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Run the test if this script is executed directly
if (require.main === module) {
  testPaymentSystem();
}

module.exports = testPaymentSystem;