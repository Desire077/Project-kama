// models/Property.js
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  type: { type: String, enum: ['maison', 'appartement', 'terrain', 'vacances'], required: true },
  price: Number,
  currency: { type: String, default: 'XAF' }, // adapte si tu veux €
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
  }], // Cloudinary
  documents: [ { url: String, public_id: String } ], // justificatifs
  status: { type: String, enum: ['pending','approved','rejected','online','negotiation','sold','removed'], default: 'approved' },
  boostedUntil: Date,
  views: { type: Number, default: 0 },
  viewsToday: { type: Number, default: 0 },
  viewsTodayDate: { type: Date },
  // Track unique viewers by user ID
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favorites: { type: Number, default: 0 },
  // Track users who favorited this property
  favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Add reviews array
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
  // Reporting functionality
  reports: [{
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

// Ensure virtual fields are serialized
propertySchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    // Remove __v field
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Property', propertySchema);