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
    await mongoose.connection.once('open', async () => {
      console.log('Connected to MongoDB');
      
      // Find all properties
      const properties = await Property.find({}).limit(5);
      console.log(`Found ${properties.length} properties`);
      
      properties.forEach(prop => {
        console.log(`\nProperty: ${prop.title}`);
        console.log(`ID: ${prop._id}`);
        console.log(`Images count: ${prop.images.length}`);
        console.log(`Images:`, prop.images);
      });
      
      mongoose.connection.close();
    });
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

testImages();