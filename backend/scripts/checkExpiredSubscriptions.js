// scripts/checkExpiredSubscriptions.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to database
const connectDB = require('../config/db');
connectDB();

/**
 * Cron job to check for expired subscriptions and deactivate them
 */
const checkExpiredSubscriptions = async () => {
  try {
    console.log('Checking for expired subscriptions...');
    
    // Find users with active subscriptions that have expired
    const now = new Date();
    const expiredUsers = await User.find({
      'subscription.active': true,
      'subscription.expiresAt': { $lt: now }
    });
    
    console.log(`Found ${expiredUsers.length} users with expired subscriptions`);
    
    // Deactivate subscriptions for expired users
    for (const user of expiredUsers) {
      user.subscription.active = false;
      await user.save();
      console.log(`Deactivated subscription for user ${user.email}`);
    }
    
    console.log('Finished checking expired subscriptions');
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Run the cron job if this script is executed directly
if (require.main === module) {
  checkExpiredSubscriptions();
}

module.exports = checkExpiredSubscriptions;