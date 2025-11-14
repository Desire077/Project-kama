// services/airtelService.js
const axios = require('axios');
const { airtelConfig } = require('../config/airtel');
const Payment = require('../models/Payment');
const User = require('../models/User');

class AirtelService {
  constructor() {
    this.baseUrl = airtelConfig.baseUrl;
    this.clientId = airtelConfig.clientId;
    this.clientSecret = airtelConfig.clientSecret;
  }

  // Generate Airtel OAuth token
  async generateToken() {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/oauth2/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Error generating Airtel token:', error.response?.data || error.message);
      throw new Error('Failed to generate Airtel token');
    }
  }

  // Initiate payment transaction
  async initiatePayment(phone, amount, userId, description = 'Kama Premium Subscription') {
    try {
      const token = await this.generateToken();
      
      // Generate unique reference
      const reference = `KAMA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await axios.post(`${this.baseUrl}/merchant/v1/payments/`, {
        reference,
        subscriber: {
          country: 'GA',
          currency: 'XAF',
          msisdn: phone
        },
        transaction: {
          amount: parseFloat(amount),
          country: 'GA',
          currency: 'XAF',
          description
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Create payment record in database
      const payment = await Payment.create({
        user: userId,
        method: 'airtel',
        amount: parseFloat(amount),
        currency: 'XAF',
        reference,
        status: 'pending',
        metadata: {
          phone,
          transactionId: response.data?.data?.transaction?.id
        }
      });

      return {
        success: true,
        reference,
        paymentId: payment._id,
        data: response.data
      };
    } catch (error) {
      console.error('Error initiating Airtel payment:', error.response?.data || error.message);
      throw new Error('Failed to initiate Airtel payment');
    }
  }

  // Verify payment status
  async verifyPayment(reference) {
    try {
      const token = await this.generateToken();
      
      const response = await axios.get(`${this.baseUrl}/standard/v1/transactions/${reference}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error verifying Airtel payment:', error.response?.data || error.message);
      throw new Error('Failed to verify Airtel payment');
    }
  }

  // Handle payment callback from Airtel
  async handleCallback(callbackData) {
    try {
      console.log('Airtel callback received:', callbackData);
      
      // Extract relevant data
      const { reference, status, transaction } = callbackData;
      
      if (!reference) {
        throw new Error('Missing reference in callback data');
      }
      
      // Find payment record
      const payment = await Payment.findOne({ reference });
      
      if (!payment) {
        throw new Error(`Payment not found for reference: ${reference}`);
      }
      
      // Update payment status
      payment.status = status === 'TS' ? 'confirmed' : status === 'TF' ? 'failed' : 'pending';
      payment.confirmedAt = new Date();
      payment.rawEvent = callbackData;
      
      await payment.save();
      
      // If payment is successful, update user subscription
      if (status === 'TS') {
        await this.activatePremiumSubscription(payment.user, payment.amount);
      }
      
      return { success: true, payment };
    } catch (error) {
      console.error('Error handling Airtel callback:', error.message);
      throw error;
    }
  }

  // Activate premium subscription for user
  async activatePremiumSubscription(userId, amount) {
    try {
      // Calculate expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      // Update user subscription
      const user = await User.findByIdAndUpdate(userId, {
        'subscription.active': true,
        'subscription.plan': 'premium',
        'subscription.expiresAt': expiresAt,
        $push: {
          'subscription.history': {
            paymentId: null, // Will be set after saving
            amount: parseFloat(amount),
            date: new Date(),
            method: 'airtel',
            status: 'success'
          }
        }
      }, { new: true });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Add the payment ID to the subscription history
      if (user.subscription.history.length > 0) {
        const lastHistoryItem = user.subscription.history[user.subscription.history.length - 1];
        const payment = await Payment.findOne({ user: userId, reference: { $exists: true } }).sort({ createdAt: -1 });
        if (payment) {
          lastHistoryItem.paymentId = payment._id;
          await user.save();
        }
      }
      
      console.log(`Premium subscription activated for user ${userId}`);
      return user;
    } catch (error) {
      console.error('Error activating premium subscription:', error.message);
      throw error;
    }
  }

  // Check payment status
  async checkPaymentStatus(reference) {
    try {
      const payment = await Payment.findOne({ reference });
      
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      return {
        status: payment.status,
        reference: payment.reference,
        amount: payment.amount,
        createdAt: payment.createdAt
      };
    } catch (error) {
      console.error('Error checking payment status:', error.message);
      throw error;
    }
  }
}

module.exports = new AirtelService();