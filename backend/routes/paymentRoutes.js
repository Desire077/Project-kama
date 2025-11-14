const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createPaymentIntent,
  createSubscription,
  handleWebhook,
  verifyAccess,
  upgradeAccount,
  activatePremium
} = require('../controllers/paymentController');
const manualPayments = require('../controllers/manualPaymentController');
const { authorize } = require('../middlewares/authMiddleware');

// Protected routes
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/create-subscription', protect, createSubscription);

// New payment verification and upgrade routes
router.get('/verify-access', protect, verifyAccess);
router.post('/upgrade-account', protect, upgradeAccount);
router.post('/activate-premium', protect, activatePremium);

// Manual / airtel money flow
router.post('/manual/initiate', protect, manualPayments.initiate);
router.post('/manual/submit', protect, manualPayments.submit);
router.post('/manual/confirm', protect, authorize('admin'), manualPayments.confirm);
router.get('/manual/list', protect, authorize('admin'), manualPayments.list);

module.exports = router;
