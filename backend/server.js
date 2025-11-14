// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');
const cron = require('node-cron');
const checkExpiredSubscriptions = require('./scripts/checkExpiredSubscriptions');

// Routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
// const subscriptionRoutes = require('./routes/subscriptionRoutes'); // Commented out due to missing controller
const emailRoutes = require('./routes/emailRoutes');
const airtelRoutes = require('./routes/airtelRoutes');

const app = express();

// Middlewares
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Schedule cron job to check for expired subscriptions daily at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running daily subscription check cron job');
  checkExpiredSubscriptions();
});

// API routes
app.get('/api', (req, res) => res.json({ message: 'Kama API running' }));

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
// app.use('/api/subscriptions', subscriptionRoutes); // Commented out due to missing controller
app.use('/api/email', emailRoutes);
app.use('/api/payments/airtel', airtelRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Route API non trouvée' });
});

// Serve frontend build files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  
  // Serve static files
  app.use(express.static(frontendPath));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error handling middleware
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));