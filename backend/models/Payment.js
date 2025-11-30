const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  
  // For Stripe flows (optional)
  stripePaymentIntentId: String,
  stripeSubscriptionId: String,
  
  // Payment method
  method: { 
    type: String, 
    enum: ['stripe', 'airtel', 'manual'], 
    default: 'manual' 
  },
  
  // Amount and currency
  amount: Number,
  currency: { type: String, default: 'XAF' },
  
  // Phone numbers
  recipientPhone: String,
  senderPhone: String,
  
  // References
  transactionRef: String,
  reference: String,
  transactionId: String,
  
  // Airtel specific fields
  airtelMoneyId: String,
  statusMessage: String,
  rawCallback: Object,
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'submitted', 'confirmed', 'failed', 'cancelled', 'expired', 'ambiguous', 'refunded'], 
    default: 'pending' 
  },
  
  // Metadata
  metadata: Object,
  rawEvent: Object,
  
  // Timestamps
  submittedAt: Date,
  confirmedAt: Date,
  refundedAt: Date,
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Index for faster lookups
paymentSchema.index({ reference: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
