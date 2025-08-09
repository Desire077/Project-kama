// models/Property.js
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  type: { type: String, enum: ['maison','terrain','location','vacances'], required: true },
  price: Number,
  currency: { type: String, default: 'XAF' }, // adapte si tu veux €
  surface: Number,
  rooms: Number,
  bathrooms: Number,
  kitchens: Number,
  livingRooms: Number,
  terrace: Boolean,
  pool: Boolean,
  address: {
    country: String,
    city: String,
    district: String,
    street: String,
    postalCode: String
  },
  images: [ { url: String, public_id: String } ], // Cloudinary
  documents: [ { url: String, public_id: String } ], // justificatifs
  status: { type: String, enum: ['pending','online','negotiation','sold','removed'], default: 'pending' },
  boostedUntil: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', propertySchema);
