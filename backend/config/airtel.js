// config/airtel.js
require('dotenv').config();

const env = process.env.AIRTEL_ENV || 'sandbox';

exports.airtelConfig = {
  // URLs
  baseUrl: env === 'production' 
    ? 'https://openapi.airtel.africa'
    : 'https://openapiuat.airtel.africa',
  
  // Credentials
  clientId: process.env.AIRTEL_CLIENT_ID,
  clientSecret: process.env.AIRTEL_CLIENT_SECRET,
  
  // Environment
  env: env,
  
  // Country and Currency for Gabon
  country: 'GA',
  currency: 'XAF',
  
  // Callback URL (for reference)
  callbackUrl: process.env.AIRTEL_CALLBACK_URL || 'https://api.kama-ga.cloud/api/payments/airtel/callback'
};

// Validate configuration on startup
const validateConfig = () => {
  const { clientId, clientSecret } = exports.airtelConfig;
  
  if (!clientId || !clientSecret) {
    console.warn('⚠️  AIRTEL WARNING: Missing AIRTEL_CLIENT_ID or AIRTEL_CLIENT_SECRET in environment variables');
    console.warn('   Airtel Money payments will not work until these are configured.');
  } else {
    console.log(`✅ Airtel Money configured for ${env.toUpperCase()} environment`);
  }
};

// Call validation
validateConfig();
