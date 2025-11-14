// Simple script to test Cloudinary connection
const cloudinary = require('cloudinary').v2;

// Configuration Cloudinary
cloudinary.config({
  cloud_name: 'dqybjcjrw',
  api_key: '376577455526943',
  api_secret: 'u2xe74fFgYePBXCGE8_mX7kDQJ4'
});

console.log('Cloudinary configured with:');
console.log('- Cloud name:', cloudinary.config().cloud_name);
console.log('- API key:', cloudinary.config().api_key);
// Note: Never log the API secret for security reasons

// Test the connection by listing resources
cloudinary.api.resources({ max_results: 10 }, (error, result) => {
  if (error) {
    console.error('Cloudinary connection error:', error);
  } else {
    console.log('Cloudinary connection successful!');
    console.log('Found', result.resources.length, 'resources');
    if (result.resources.length > 0) {
      console.log('First resource:', result.resources[0]);
    }
  }
});