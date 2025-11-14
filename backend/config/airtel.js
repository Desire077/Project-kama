// config/airtel.js
require('dotenv').config();

exports.airtelConfig = {
  baseUrl: process.env.AIRTEL_BASE_URL || 'https://openapi.airtel.africa',
  clientId: process.env.AIRTEL_CLIENT_ID,
  clientSecret: process.env.AIRTEL_CLIENT_SECRET,
  env: process.env.AIRTEL_ENV || 'sandbox' // 'sandbox' or 'production'
};