// backend/scripts/verifyCloudinary.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const cloudinary = require('../config/cloudinary');

async function verifyCloudinary() {
  console.log('Verifying Cloudinary configuration...');
  
  try {
    // Test Cloudinary connection
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
    });
    
    // Create a simple buffer with some data to simulate an image
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    
    console.log('Uploading test image from buffer...');
    
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'kama_test',
        public_id: 'test_image_' + Date.now(),
        overwrite: true,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('Upload error:', error);
          return;
        }
        
        console.log('Upload successful:', result.secure_url);
        
        // Test deleting the image
        console.log('Deleting test image...');
        cloudinary.uploader.destroy(result.public_id, (deleteError, deleteResult) => {
          if (deleteError) {
            console.error('Delete error:', deleteError);
            return;
          }
          
          console.log('Delete result:', deleteResult);
          console.log('✅ Cloudinary integration verified successfully!');
        });
      }
    );
    
    result.end(buffer);
  } catch (error) {
    console.error('❌ Error verifying Cloudinary:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

verifyCloudinary();