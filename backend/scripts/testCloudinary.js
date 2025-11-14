// Test script to verify Cloudinary configuration
require('dotenv').config();
const cloudinary = require('../config/cloudinary');

async function testCloudinary() {
  try {
    console.log('Testing Cloudinary configuration...');
    
    // Log configuration details (without secrets)
    console.log('Cloudinary config:');
    console.log('- Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('- API key:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
    console.log('- API secret:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');
    
    // Test ping Cloudinary
    console.log('\nTesting Cloudinary connection...');
    const result = await cloudinary.api.ping();
    console.log('Cloudinary ping result:', result);
    
    console.log('\nCloudinary configuration test completed successfully!');
  } catch (error) {
    console.error('Cloudinary test failed:', error);
  }
}

testCloudinary();