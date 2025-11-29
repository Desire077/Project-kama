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

// Public callback routes (no authentication required)
// GET for Airtel verification/health check
router.get('/callback', (req, res) => {
  res.status(200).json({ 
    status: 'active',
    message: 'Airtel Money callback endpoint is ready',
    timestamp: new Date().toISOString()
  });
});

// POST for actual callback data
router.post('/callback', handleCallback);

module.exports = router;