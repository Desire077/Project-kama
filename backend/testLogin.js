const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Try to find a user
    const user = await User.findOne({ email: 'seeduser+1759791753561@example.com' }).select('+password');
    if (user) {
      console.log('Found user:', {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      });

      // Test different passwords
      const testPasswords = ['testpassword', 'password123', '12345678'];
      
      for (const password of testPasswords) {
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password '${password}' comparison result:`, isMatch);
        
        if (isMatch) {
          // Generate token like the login function does
          const token = generateToken(user._id, user.role);
          console.log('Generated token:', token);
          break;
        }
      }
    } else {
      console.log('User not found');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();