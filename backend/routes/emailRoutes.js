const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  sendWelcomeEmail,
  sendInquiryEmail,
  sendPasswordResetEmail
} = require('../controllers/emailController');

// Public routes
router.post('/reset-password', sendPasswordResetEmail);

// Protected routes
router.post('/welcome', protect, sendWelcomeEmail);
router.post('/inquiry', protect, sendInquiryEmail);

module.exports = router;
