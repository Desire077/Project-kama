// routes/airtelRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  initiatePayment,
  handleCallback,
  checkPaymentStatus,
  getPaymentHistory
} = require('../controllers/airtelController');

// Protected routes (require authentication)
router.post('/init', protect, initiatePayment);
router.get('/status/:reference', protect, checkPaymentStatus);
router.get('/history', protect, getPaymentHistory);

// Public callback route (no authentication required)
router.post('/callback', handleCallback);

module.exports = router;