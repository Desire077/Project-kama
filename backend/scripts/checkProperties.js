// backend/scripts/checkProperties.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Property = require('../models/Property');

async function checkProperties() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
    
    // Get all properties
    const properties = await Property.find({}).populate('owner', 'firstName lastName email _id');
    
    console.log(`Found ${properties.length} properties:`);
    
    properties.forEach((property, index) => {
      console.log(`\n--- Property ${index + 1} ---`);
      console.log('ID:', property._id);
      console.log('Title:', property.title);
      console.log('Owner ID (property.owner):', property.owner._id);
      console.log('Owner type:', typeof property.owner._id);
      console.log('Owner object:', property.owner);
      console.log('Images count:', property.images ? property.images.length : 0);
      if (property.images && property.images.length > 0) {
        console.log('First image:', property.images[0]);
      }
    });
    
    console.log('\n--- End of properties ---');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

checkProperties();