const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Payment = require('../models/Payment')
const Property = require('../models/Property')
const User = require('../models/User')

// @desc    Create payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(500).json({ message: 'Service de paiement non configuré.' });
    }
    
    const { amount, currency = 'eur', propertyId } = req.body;
    
    // If this is for boosting a property, validate the property
    let property = null;
    if (propertyId) {
      property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Propriété non trouvée.' });
      }
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      metadata: {
        userId: req.user.id,
        userEmail: req.user.email,
        ...(propertyId && { propertyId })
      }
    });

    // Persist payment record (include property if provided)
    let createdPayment = null
    try{
      const paymentDoc = {
        user: req.user.id,
        stripePaymentIntentId: paymentIntent.id,
        amount,
        currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata || {}
      }
      if(propertyId) paymentDoc.property = propertyId
      createdPayment = await Payment.create(paymentDoc)
    }catch(e){
      console.error('Error saving payment record:', e.message)
    }

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentId: createdPayment ? createdPayment._id : null
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du paiement.' });
  }
};

// @desc    Create subscription for property boosting
// @route   POST /api/payments/create-subscription
// @access  Private
exports.createSubscription = async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(500).json({ message: 'Service de paiement non configuré.' });
    }
    
    const { priceId, propertyId } = req.body;
    
    const subscription = await stripe.subscriptions.create({
      customer: req.user.stripeCustomerId,
      items: [{ price: priceId }],
      metadata: {
        userId: req.user.id,
        propertyId
      }
    });

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'abonnement.' });
  }
};

// @desc    Handle webhook
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  // Check if Stripe is configured
  if (!stripe) {
    return res.status(500).json({ message: 'Service de paiement non configuré.' });
  }
  
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      // Update payment record
      try{
        const p = await Payment.findOneAndUpdate({ stripePaymentIntentId: paymentIntent.id }, { status: 'confirmed', rawEvent: event }, { new: true })
        // If metadata contains propertyId, set property online and boost it
        const propertyId = paymentIntent.metadata?.propertyId
        if(propertyId){
          // Set property to online status and boost it for 7 days
          const boostExpiry = new Date();
          boostExpiry.setDate(boostExpiry.getDate() + 7); // Boost for 7 days
          
          await Property.findByIdAndUpdate(propertyId, { 
            status: 'online',
            boostedUntil: boostExpiry
          })
        }
      }catch(e){
        console.error('Error updating payment on webhook:', e.message)
      }
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Invoice payment succeeded:', invoice.id);
      // Handle subscription payment
      try{
        // persist invoice info if needed
        await Payment.create({ stripeSubscriptionId: invoice.subscription, amount: invoice.total/100, currency: invoice.currency, status: 'confirmed', rawEvent: event })
      }catch(e){ console.error('Error saving invoice payment', e.message) }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
};

/**
 * @desc    Verify user access based on payment status
 * @route   GET /api/payments/verify-access
 * @access  Private
 */
exports.verifyAccess = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    // Check if user has active premium subscription
    const hasPremiumAccess = user.subscription && user.subscription.active && 
      user.subscription.expiresAt && user.subscription.expiresAt > new Date();
    
    res.json({
      isPremium: hasPremiumAccess,
      subscription: user.subscription || null
    });
  } catch (err) {
    console.error('Verify access error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la vérification des accès.' });
  }
};

/**
 * @desc    Upgrade user account to premium
 * @route   POST /api/payments/upgrade-account
 * @access  Private (will be called after successful payment)
 */
exports.upgradeAccount = async (req, res) => {
  try {
    const { plan, durationDays = 30 } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);
    
    // Update user subscription
    user.subscription = {
      active: true,
      plan: plan || 'premium',
      expiresAt,
      history: user.subscription?.history || []
    };
    
    await user.save();
    
    res.json({
      message: 'Compte mis à niveau avec succès',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscription: user.subscription
      }
    });
  } catch (err) {
    console.error('Upgrade account error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à niveau du compte.' });
  }
};

/**
 * @desc    Activate premium features for user
 * @route   POST /api/payments/activate-premium
 * @access  Private (will be called after successful payment)
 */
exports.activatePremium = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    // Check if user has premium access
    const hasPremiumAccess = user.subscription && user.subscription.active && 
      user.subscription.expiresAt && user.subscription.expiresAt > new Date();
    
    if (!hasPremiumAccess) {
      return res.status(403).json({ message: 'Accès premium requis.' });
    }
    
    // Activate premium features
    user.isPremium = true;
    await user.save();
    
    res.json({
      message: 'Fonctionnalités premium activées',
      isPremium: true
    });
  } catch (err) {
    console.error('Activate premium error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'activation des fonctionnalités premium.' });
  }
};