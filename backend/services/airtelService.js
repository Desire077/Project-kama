// services/airtelService.js
const axios = require('axios');
const crypto = require('crypto');
const { airtelConfig } = require('../config/airtel');
const Payment = require('../models/Payment');
const User = require('../models/User');

class AirtelService {
  constructor() {
    // Use sandbox URL for testing, production URL for live
    this.baseUrl = airtelConfig.env === 'production' 
      ? 'https://openapi.airtel.africa'
      : 'https://openapiuat.airtel.africa';
    this.clientId = airtelConfig.clientId;
    this.clientSecret = airtelConfig.clientSecret;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Generate Airtel OAuth token
  async generateToken() {
    try {
      // Check if we have a valid cached token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      console.log('Generating new Airtel token...');
      console.log('Base URL:', this.baseUrl);
      
      const response = await axios.post(
        `${this.baseUrl}/auth/oauth2/token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Token expires in 1 hour, refresh 5 minutes before
      this.tokenExpiry = Date.now() + (55 * 60 * 1000);
      
      console.log('Airtel token generated successfully');
      return this.accessToken;
    } catch (error) {
      console.error('Error generating Airtel token:', error.response?.data || error.message);
      throw new Error('Failed to generate Airtel token: ' + (error.response?.data?.message || error.message));
    }
  }

  // Initiate payment transaction (USSD Push) - API v2
  async initiatePayment(phone, amount, userId, description = 'Kama Premium Subscription') {
    try {
      const token = await this.generateToken();
      
      // Generate unique reference and transaction ID
      const reference = `KAMA_${Date.now()}`;
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Remove country code from phone if present
      // Airtel says: "N'envoyez pas de code pays dans le msisdn"
      let cleanPhone = phone.replace(/^\+?241/, '').replace(/^0/, '');
      
      console.log('Initiating Airtel payment...');
      console.log('Phone:', cleanPhone);
      console.log('Amount:', amount);
      console.log('Reference:', reference);
      
      const requestBody = {
        reference: reference,
        subscriber: {
          country: 'GA',  // Gabon
          currency: 'XAF',
          msisdn: cleanPhone
        },
        transaction: {
          amount: parseFloat(amount),
          country: 'GA',
          currency: 'XAF',
          id: transactionId
        }
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(
        `${this.baseUrl}/merchant/v2/payments/`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'X-Country': 'GA',
            'X-Currency': 'XAF'
          }
        }
      );

      console.log('Airtel response:', JSON.stringify(response.data, null, 2));

      // Check if request was successful
      if (!response.data.status?.success && response.data.status?.code !== '200') {
        throw new Error(response.data.status?.message || 'Payment initiation failed');
      }

      // Create payment record in database
      const payment = await Payment.create({
        user: userId,
        method: 'airtel',
        amount: parseFloat(amount),
        currency: 'XAF',
        reference: reference,
        transactionId: transactionId,
        status: 'pending',
        metadata: {
          phone: cleanPhone,
          description: description,
          airtelResponse: response.data
        }
      });

      return {
        success: true,
        reference: reference,
        transactionId: transactionId,
        paymentId: payment._id,
        message: 'Payment initiated. Please check your phone to confirm.',
        data: response.data
      };
    } catch (error) {
      console.error('Error initiating Airtel payment:', error.response?.data || error.message);
      throw new Error('Failed to initiate Airtel payment: ' + (error.response?.data?.status?.message || error.message));
    }
  }

  // Check transaction status - API v1
  async checkTransactionStatus(transactionId) {
    try {
      const token = await this.generateToken();
      
      console.log('Checking transaction status for:', transactionId);

      const response = await axios.get(
        `${this.baseUrl}/standard/v1/payments/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*',
            'X-Country': 'GA',
            'X-Currency': 'XAF'
          }
        }
      );

      console.log('Transaction status response:', JSON.stringify(response.data, null, 2));

      return response.data;
    } catch (error) {
      console.error('Error checking transaction status:', error.response?.data || error.message);
      throw new Error('Failed to check transaction status');
    }
  }

  // Handle payment callback from Airtel
  async handleCallback(callbackData) {
    try {
      console.log('=== AIRTEL CALLBACK RECEIVED ===');
      console.log(JSON.stringify(callbackData, null, 2));
      
      // Extract transaction data from callback
      // Format: { transaction: { id, message, status_code, airtel_money_id }, hash? }
      const transaction = callbackData.transaction;
      
      if (!transaction) {
        console.error('Invalid callback: missing transaction data');
        throw new Error('Invalid callback data: missing transaction');
      }

      const { id: transactionId, status_code, airtel_money_id, message } = transaction;
      
      console.log('Transaction ID:', transactionId);
      console.log('Status Code:', status_code);
      console.log('Airtel Money ID:', airtel_money_id);
      
      // Find payment record by transactionId or reference
      let payment = await Payment.findOne({ 
        $or: [
          { transactionId: transactionId },
          { reference: transactionId }
        ]
      });
      
      if (!payment) {
        console.error(`Payment not found for transaction: ${transactionId}`);
        // Still return success to Airtel to prevent retries
        return { success: false, message: 'Payment not found' };
      }
      
      // Map Airtel status codes to our status
      // TS = Transaction Success, TF = Transaction Failed
      let newStatus;
      switch (status_code) {
        case 'TS':
          newStatus = 'confirmed';
          break;
        case 'TF':
          newStatus = 'failed';
          break;
        case 'TA':
          newStatus = 'ambiguous';
          break;
        case 'TIP':
          newStatus = 'pending';
          break;
        case 'TE':
          newStatus = 'expired';
          break;
        default:
          newStatus = 'pending';
      }
      
      // Update payment record
      payment.status = newStatus;
      payment.airtelMoneyId = airtel_money_id;
      payment.statusMessage = message;
      payment.confirmedAt = newStatus === 'confirmed' ? new Date() : null;
      payment.rawCallback = callbackData;
      
      await payment.save();
      
      console.log(`Payment ${payment._id} updated to status: ${newStatus}`);
      
      // If payment is successful, activate premium subscription
      if (newStatus === 'confirmed') {
        await this.activatePremiumSubscription(payment.user, payment.amount, payment._id);
      }
      
      return { success: true, payment };
    } catch (error) {
      console.error('Error handling Airtel callback:', error.message);
      throw error;
    }
  }

  // Activate premium subscription for user
  async activatePremiumSubscription(userId, amount, paymentId) {
    try {
      // Calculate expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      // Update user subscription
      const user = await User.findByIdAndUpdate(userId, {
        isPremium: true,
        'subscription.active': true,
        'subscription.plan': 'premium',
        'subscription.expiresAt': expiresAt,
        $push: {
          'subscription.history': {
            paymentId: paymentId,
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
      
      console.log(`✅ Premium subscription activated for user ${userId} until ${expiresAt}`);
      return user;
    } catch (error) {
      console.error('Error activating premium subscription:', error.message);
      throw error;
    }
  }

  // Refund payment - API v2
  async refundPayment(airtelMoneyId) {
    try {
      const token = await this.generateToken();
      
      console.log('Initiating refund for:', airtelMoneyId);

      const response = await axios.post(
        `${this.baseUrl}/standard/v2/payments/refund`,
        {
          transaction: {
            airtel_money_id: airtelMoneyId
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'X-Country': 'GA',
            'X-Currency': 'XAF'
          }
        }
      );

      console.log('Refund response:', JSON.stringify(response.data, null, 2));

      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error.response?.data || error.message);
      throw new Error('Failed to process refund');
    }
  }

  // Check payment status from database
  async checkPaymentStatus(reference) {
    try {
      const payment = await Payment.findOne({ 
        $or: [
          { reference: reference },
          { transactionId: reference }
        ]
      });
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Also check with Airtel if payment is still pending
      if (payment.status === 'pending' && payment.transactionId) {
        try {
          const airtelStatus = await this.checkTransactionStatus(payment.transactionId);
          
          // Update local status if Airtel has an update
          if (airtelStatus.data?.transaction?.status) {
            const status = airtelStatus.data.transaction.status;
            if (status === 'TS') {
              payment.status = 'confirmed';
              payment.airtelMoneyId = airtelStatus.data.transaction.airtel_money_id;
              await payment.save();
              
              // Activate subscription
              await this.activatePremiumSubscription(payment.user, payment.amount, payment._id);
            } else if (status === 'TF') {
              payment.status = 'failed';
              await payment.save();
            }
          }
        } catch (err) {
          console.error('Error checking Airtel status:', err.message);
        }
      }
      
      return {
        status: payment.status,
        reference: payment.reference,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        confirmedAt: payment.confirmedAt
      };
    } catch (error) {
      console.error('Error checking payment status:', error.message);
      throw error;
    }
  }
}

module.exports = new AirtelService();
