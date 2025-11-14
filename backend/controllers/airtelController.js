// controllers/airtelController.js
const airtelService = require('../services/airtelService');
const Payment = require('../models/Payment');
const User = require('../models/User');

// @desc    Initiate Airtel Money payment
// @route   POST /api/payments/airtel/init
// @access  Private
exports.initiatePayment = async (req, res) => {
  try {
    const { phone, amount, userId, planId } = req.body;
    
    // Validate input
    if (!phone || !amount || !userId) {
      return res.status(400).json({ 
        message: 'Phone, amount and userId are required' 
      });
    }
    
    // Validate phone number format for Gabon (+241 or 241)
    const gabonPhoneRegex = /^(\+241|241)?(0?[2-7]\d{6})$/;
    if (!gabonPhoneRegex.test(phone)) {
      return res.status(400).json({ 
        message: 'Invalid Gabon phone number format' 
      });
    }
    
    // Normalize phone number to +241 format
    let normalizedPhone = phone;
    if (phone.startsWith('241')) {
      normalizedPhone = `+${phone}`;
    } else if (phone.startsWith('0')) {
      normalizedPhone = `+241${phone.substring(1)}`;
    } else if (!phone.startsWith('+241')) {
      normalizedPhone = `+241${phone}`;
    }
    
    // Verify that the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Define plan details
    const plans = {
      basic: {
        name: 'Formule Basique',
        price: 5000, // 5000 XAF
        duration: 30 // days
      },
      premium: {
        name: 'Formule Premium',
        price: 15000, // 15000 XAF
        duration: 30 // days
      }
    };
    
    const plan = plans[planId] || plans.premium;
    
    // Validate amount matches plan price
    if (parseFloat(amount) !== plan.price) {
      return res.status(400).json({ 
        message: `Amount must be ${plan.price} XAF for ${plan.name}` 
      });
    }
    
    // Initiate payment
    const result = await airtelService.initiatePayment(
      normalizedPhone, 
      amount, 
      userId,
      `Kama ${plan.name} Subscription`
    );
    
    res.status(200).json({
      message: 'Payment initiated successfully',
      reference: result.reference,
      paymentId: result.paymentId
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ 
      message: 'Failed to initiate payment',
      error: error.message 
    });
  }
};

// @desc    Handle Airtel Money callback
// @route   POST /api/payments/airtel/callback
// @access  Public
exports.handleCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    
    // Log the callback for debugging
    console.log('Airtel callback received:', JSON.stringify(callbackData, null, 2));
    
    // Handle the callback
    await airtelService.handleCallback(callbackData);
    
    // Always return 200 to Airtel to acknowledge receipt
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error handling Airtel callback:', error);
    // Still return 200 to prevent Airtel from retrying
    res.status(200).json({ status: 'error', message: error.message });
  }
};

// @desc    Check payment status
// @route   GET /api/payments/airtel/status/:reference
// @access  Private
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;
    
    if (!reference) {
      return res.status(400).json({ message: 'Reference is required' });
    }
    
    const status = await airtelService.checkPaymentStatus(reference);
    
    res.status(200).json({
      message: 'Payment status retrieved successfully',
      status
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ 
      message: 'Failed to check payment status',
      error: error.message 
    });
  }
};

// @desc    Get user payment history
// @route   GET /api/payments/airtel/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id, method: 'airtel' })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json({
      message: 'Payment history retrieved successfully',
      payments
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({ 
      message: 'Failed to get payment history',
      error: error.message 
    });
  }
};