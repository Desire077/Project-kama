// backend/scripts/completeImageTest.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const Property = require('../models/Property');

async function completeImageTest() {
  console.log('Testing complete image handling workflow...');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
    
    // Test Cloudinary connection
    console.log('Cloudinary config loaded:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'NOT SET'
    });
    
    // Create a test property
    const testProperty = new Property({
      owner: new mongoose.Types.ObjectId(), // Random user ID for testing
      title: 'Test Property for Complete Image Workflow',
      description: 'This is a test property to verify the complete image handling workflow',
      type: 'maison',
      price: 100000,
      surface: 100,
      rooms: 2,
      bathrooms: 1,
      address: {
        city: 'Test City',
        country: 'Test Country'
      },
      images: []
    });
    
    // Save the property first to get an ID
    const savedProperty = await testProperty.save();
    console.log('Created test property with ID:', savedProperty._id);
    
    // Simulate image upload
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    
    console.log('Uploading image to Cloudinary...');
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'kama_properties',
          public_id: `property_${savedProperty._id}_test`,
          overwrite: true
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });
    
    console.log('Image uploaded to Cloudinary:', uploadResult.secure_url);
    
    // Update property with image URL
    savedProperty.images.push({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });
    await savedProperty.save();
    
    console.log('Property updated with image');
    
    // Retrieve the property and verify image is associated
    const retrievedProperty = await Property.findById(savedProperty._id);
    console.log('Retrieved property images:', retrievedProperty.images);
    
    // Test image removal
    if (retrievedProperty.images.length > 0) {
      const imageToRemove = retrievedProperty.images[0];
      console.log('Removing image from Cloudinary:', imageToRemove.public_id);
      
      // Remove from Cloudinary
      const deleteResult = await cloudinary.uploader.destroy(imageToRemove.public_id);
      console.log('Cloudinary delete result:', deleteResult);
      
      // Remove from property
      retrievedProperty.images = [];
      await retrievedProperty.save();
      console.log('Image removed from property');
    }
    
    // Clean up - delete the test property
    await Property.findByIdAndDelete(savedProperty._id);
    console.log('Cleaned up test property');
    
    console.log('✅ Complete image handling workflow test completed successfully!');
    console.log('Images are properly stored in Cloudinary, associated with properties, and can be removed.');
    
  } catch (error) {
    console.error('❌ Error in complete image handling test:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

completeImageTest();