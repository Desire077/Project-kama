const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kama';

// Property model
const propertySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  type: { type: String, enum: ['maison', 'appartement', 'terrain', 'vacances'], required: true },
  price: Number,
  currency: { type: String, default: 'XAF' },
  surface: Number,
  rooms: Number,
  bathrooms: Number,
  kitchens: Number,
  livingRooms: Number,
  terrace: Boolean,
  pool: Boolean,
  parking: Boolean,
  address: {
    country: String,
    city: String,
    district: String,
    street: String,
    postalCode: String
  },
  images: [{ 
    url: { type: String, required: true },
    public_id: { type: String, required: true }
  }],
  documents: [ { url: String, public_id: String } ],
  status: { type: String, enum: ['pending','approved','rejected','online','negotiation','sold','removed'], default: 'approved' },
  boostedUntil: Date,
  views: { type: Number, default: 0 },
  viewsToday: { type: Number, default: 0 },
  viewsTodayDate: { type: Date },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favorites: { type: Number, default: 0 },
  favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    responses: [{
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      responseText: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }]
  }],
  createdAt: { type: Date, default: Date.now },
  reports: [{
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

const Property = mongoose.model('Property', propertySchema);

async function checkProperties() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Find all properties
    const properties = await Property.find({}).populate('owner', 'firstName lastName email');
    
    console.log(`Found ${properties.length} properties:`);
    
    properties.forEach((property, index) => {
      console.log(`\n--- Property ${index + 1} ---`);
      console.log(`ID: ${property._id}`);
      console.log(`Title: ${property.title}`);
      console.log(`Status: ${property.status}`);
      console.log(`Owner: ${property.owner?.firstName} ${property.owner?.lastName} (${property.owner?.email})`);
      console.log(`Created At: ${property.createdAt}`);
      console.log(`Price: ${property.price} ${property.currency}`);
      console.log(`City: ${property.address?.city}`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nConnection closed');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
}

checkProperties();