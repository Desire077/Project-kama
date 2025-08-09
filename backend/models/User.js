// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['client','vendeur','admin'], default: 'client' },
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  whatsapp: String,
  dateOfBirth: Date,
  // pour intermédiaires : nom du propriétaire réel s'il y a lieu
  ownerName: String,
  documentsStatus: { type: String, enum: ['none','pending','validated','rejected'], default: 'none' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
