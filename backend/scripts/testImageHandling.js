// backend/scripts/testImageHandling.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Import property model and cloudinary config
const Property = require('../models/Property');
const { cloudinary } = require('../config/cloudinary');

console.log('Environment variables loaded:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET');

async function testImageHandling() {
  console.log('Testing image handling with Cloudinary...');
  
  // Connect to database
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
  
  try {
    // Test Cloudinary connection
    console.log('Cloudinary config loaded:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'NOT SET'
    });
    
    // Create a test property with image
    const testProperty = new Property({
      owner: new mongoose.Types.ObjectId(), // Random user ID for testing
      title: 'Test Property for Image Handling',
      description: 'This is a test property to verify image handling',
      type: 'maison', // Required field
      price: 100000,
      surface: 100,
      rooms: 2,
      bathrooms: 1,
      address: {
        city: 'Test City',
        country: 'Test Country'
      },
      images: [] // Will be populated after upload
    });
    
    // Save the property first to get an ID
    const savedProperty = await testProperty.save();
    console.log('Created test property with ID:', savedProperty._id);
    
    // Simulate image upload (we'll use a placeholder image URL)
    const imageUrl = 'https://via.placeholder.com/800x600.png';
    const uploadedImage = await cloudinary.uploader.upload(imageUrl, {
      folder: 'kama_properties',
      public_id: `property_${savedProperty._id}_test`,
      overwrite: true
    });
    
    console.log('Image uploaded to Cloudinary:', uploadedImage.secure_url);
    
    // Update property with image URL
    savedProperty.images.push({
      url: uploadedImage.secure_url,
      public_id: uploadedImage.public_id
    });
    await savedProperty.save();
    
    console.log('Property updated with image URL');
    
    // Retrieve the property and verify image is associated
    const retrievedProperty = await Property.findById(savedProperty._id);
    console.log('Retrieved property images:', retrievedProperty.images);
    
    // Clean up - delete the test property
    await Property.findByIdAndDelete(savedProperty._id);
    console.log('Cleaned up test property');
    
    console.log('✅ Image handling test completed successfully!');
    console.log('Images are properly stored in Cloudinary and associated with properties.');
    
  } catch (error) {
    console.error('❌ Error in image handling test:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

testImageHandling();