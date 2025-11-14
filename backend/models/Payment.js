const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  // For Stripe flows (optional)
  stripePaymentIntentId: String,
  stripeSubscriptionId: String,
  // Manual / mobile money fields
  method: { type: String, enum: ['stripe','airtel','manual'], default: 'manual' },
  amount: Number,
  currency: String,
  recipientPhone: String, // admin / merchant phone
  senderPhone: String, // phone used by payer
  transactionRef: String, // optional tx reference provided by payer/operator
  reference: String, // our generated payment reference code
  status: { type: String, enum: ['pending','submitted','confirmed','failed','cancelled'], default: 'pending' },
  metadata: Object,
  rawEvent: Object,
  submittedAt: Date,
  confirmedAt: Date,
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
