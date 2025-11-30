// controllers/airtelController.js
const airtelService = require('../services/airtelService');
const Payment = require('../models/Payment');
const User = require('../models/User');

// @desc    Initiate Airtel Money payment
// @route   POST /api/payments/airtel/init
// @access  Private
exports.initiatePayment = async (req, res) => {
  try {
    const { phone, amount, planId } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!phone || !amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Le numéro de téléphone et le montant sont requis' 
      });
    }
    
    // Validate phone number format for Gabon
    // Gabon numbers: 0X XX XX XX or +241 X XX XX XX
    const gabonPhoneRegex = /^(\+?241)?[0-9]{8,9}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    
    if (!gabonPhoneRegex.test(cleanPhone)) {
      return res.status(400).json({ 
        success: false,
        message: 'Format de numéro de téléphone invalide. Utilisez le format gabonais (ex: 074123456)' 
      });
    }
    
    // Verify that the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Define plan details
    const plans = {
      basic: {
        name: 'Formule Basique',
        price: 5000,
        duration: 30
      },
      premium: {
        name: 'Formule Premium',
        price: 15000,
        duration: 30
      }
    };
    
    const plan = plans[planId] || plans.premium;
    
    // Validate amount matches plan price (with some tolerance)
    if (parseFloat(amount) < plan.price) {
      return res.status(400).json({ 
        success: false,
        message: `Le montant doit être au moins ${plan.price} XAF pour ${plan.name}` 
      });
    }
    
    // Initiate payment
    const result = await airtelService.initiatePayment(
      cleanPhone, 
      amount, 
      userId,
      `Kama - ${plan.name}`
    );
    
    res.status(200).json({
      success: true,
      message: 'Paiement initié avec succès. Vérifiez votre téléphone pour confirmer.',
      data: {
        reference: result.reference,
        transactionId: result.transactionId,
        paymentId: result.paymentId,
        amount: amount,
        currency: 'XAF'
      }
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Échec de l\'initiation du paiement',
      error: error.message 
    });
  }
};

// @desc    Handle Airtel Money callback (without authentication)
// @route   POST /api/payments/airtel/callback
// @access  Public
exports.handleCallback = async (req, res) => {
  try {
    console.log('=== AIRTEL CALLBACK ENDPOINT HIT ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const callbackData = req.body;
    
    // Validate callback data
    if (!callbackData || !callbackData.transaction) {
      console.log('Invalid callback data received');
      return res.status(200).json({ 
        status: 'error',
        message: 'Invalid callback data'
      });
    }
    
    // Handle the callback
    await airtelService.handleCallback(callbackData);
    
    // Always return 200 to Airtel to acknowledge receipt
    res.status(200).json({ 
      status: 'success',
      message: 'Callback processed successfully'
    });
  } catch (error) {
    console.error('Error handling Airtel callback:', error);
    // Still return 200 to prevent Airtel from retrying
    res.status(200).json({ 
      status: 'received',
      message: 'Callback received with errors',
      error: error.message 
    });
  }
};

// @desc    Check payment status
// @route   GET /api/payments/airtel/status/:reference
// @access  Private
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;
    
    if (!reference) {
      return res.status(400).json({ 
        success: false,
        message: 'La référence est requise' 
      });
    }
    
    const status = await airtelService.checkPaymentStatus(reference);
    
    res.status(200).json({
      success: true,
      message: 'Statut du paiement récupéré avec succès',
      data: status
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Échec de la vérification du statut',
      error: error.message 
    });
  }
};

// @desc    Get user payment history
// @route   GET /api/payments/airtel/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ 
      user: req.user.id, 
      method: 'airtel' 
    })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      message: 'Historique des paiements récupéré avec succès',
      data: payments
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Échec de la récupération de l\'historique',
      error: error.message 
    });
  }
};

// @desc    Request refund
// @route   POST /api/payments/airtel/refund/:paymentId
// @access  Private (Admin only)
exports.requestRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Find the payment
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }
    
    if (payment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Seuls les paiements confirmés peuvent être remboursés'
      });
    }
    
    if (!payment.airtelMoneyId) {
      return res.status(400).json({
        success: false,
        message: 'ID Airtel Money manquant pour ce paiement'
      });
    }
    
    // Process refund
    const result = await airtelService.refundPayment(payment.airtelMoneyId);
    
    // Update payment status
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    await payment.save();
    
    res.status(200).json({
      success: true,
      message: 'Remboursement effectué avec succès',
      data: result
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Échec du remboursement',
      error: error.message
    });
  }
};
