// routes/airtelRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const {
  initiatePayment,
  handleCallback,
  checkPaymentStatus,
  getPaymentHistory,
  requestRefund
} = require('../controllers/airtelController');

// Protected routes (require authentication)
router.post('/init', protect, initiatePayment);
router.get('/status/:reference', protect, checkPaymentStatus);
router.get('/history', protect, getPaymentHistory);

// Admin only routes
router.post('/refund/:paymentId', protect, adminOnly, requestRefund);

// Public callback routes (no authentication required)
// GET for Airtel verification/health check
router.get('/callback', (req, res) => {
  console.log('Callback endpoint health check');
  res.status(200).json({ 
    status: 'active',
    message: 'Airtel Money callback endpoint is ready',
    timestamp: new Date().toISOString(),
    endpoint: '/api/payments/airtel/callback'
  });
});

// POST for actual callback data from Airtel
router.post('/callback', handleCallback);

module.exports = router;
