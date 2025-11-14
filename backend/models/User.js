// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['client', 'vendeur', 'admin'], default: 'client' },
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  whatsapp: String,
  dateOfBirth: Date,
  // pour intermédiaires : nom du propriétaire réel s'il y a lieu
  ownerName: String,
  documentsStatus: { type: String, enum: ['none','pending','validated','rejected'], default: 'none' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  alerts: [{
    title: String,
    type: { type: String, enum: ['maison', 'appartement', 'terrain', 'vacances'] },
    minPrice: Number,
    maxPrice: Number,
    city: String,
    rooms: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  // Search patterns tracking
  searchHistory: [{
    query: String,
    timestamp: { type: Date, default: Date.now },
    resultsCount: Number
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now },
    responses: [{
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      responseText: String,
      createdAt: { type: Date, default: Date.now }
    }],
    // Reporting functionality for comments
    reports: [{
      reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      createdAt: { type: Date, default: Date.now }
    }]
  }],
  avatarUrl: { type: String },
  refreshToken: { type: String },
  stripeCustomerId: { type: String },
  createdAt: { type: Date, default: Date.now },
  isBanned: { type: Boolean, default: false },
  // Subscription structure for payment management
  isPremium: { type: Boolean, default: false },
  subscription: {
    active: { type: Boolean, default: false },
    plan: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    history: [{
      paymentId: String,
      amount: Number,
      date: Date,
      method: String,
      status: String
    }]
  }
});

module.exports = mongoose.model('User', userSchema);