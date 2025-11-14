const mongoose = require('mongoose');
const Property = require('./backend/models/Property');

// MongoDB connection
mongoose.connect('mongodb+srv://einsteinjordan77_db_user:PCvjQPttevGkuzfP@cluster0.jlf2jpj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Test function to check properties with images
async function testImages() {
  try {
    console.log('Connecting to database...');
    
    // Wait for connection
    const db = mongoose.connection;
    await new Promise((resolve, reject) => {
      db.once('open', resolve);
      db.once('error', reject);
    });
    
    console.log('Connected to MongoDB');
    
    // Find all properties
    const properties = await Property.find({}).limit(10);
    console.log(`Found ${properties.length} properties`);
    
    properties.forEach((prop, index) => {
      console.log(`\nProperty ${index + 1}: ${prop.title}`);
      console.log(`ID: ${prop._id}`);
      console.log(`Images count: ${prop.images.length}`);
      console.log(`Images:`, prop.images);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

testImages();