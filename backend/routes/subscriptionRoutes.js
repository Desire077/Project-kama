const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createSubscriptionSession,
  handleSubscriptionWebhook
} = require('../controllers/subscriptionController');

// Create a subscription payment session
router.post('/create-session', protect, createSubscriptionSession);

// Handle webhook for subscription payments
router.post('/webhook', handleSubscriptionWebhook);

module.exports = router;