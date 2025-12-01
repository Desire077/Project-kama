// middlewares/checkDbConnection.js
const mongoose = require('mongoose');

/**
 * Middleware pour vérifier que la connexion MongoDB est active
 * Si la connexion est perdue, tente de se reconnecter
 */
const checkDbConnection = async (req, res, next) => {
  const state = mongoose.connection.readyState;
  
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (state === 1) {
    // Connexion OK
    return next();
  }

  if (state === 2) {
    // En cours de connexion, attendre un peu
    console.log('⏳ MongoDB is connecting, waiting...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (mongoose.connection.readyState === 1) {
      return next();
    }
  }

  // Connexion perdue ou non établie
  console.log('⚠️ MongoDB connection lost, attempting to reconnect...');
  
  try {
    // Tenter de se reconnecter
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    
    console.log('✅ MongoDB reconnected in middleware');
    return next();
  } catch (err) {
    console.error('❌ MongoDB reconnection failed in middleware:', err.message);
    return res.status(503).json({ 
      message: 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.',
      error: 'DATABASE_CONNECTION_ERROR'
    });
  }
};

module.exports = checkDbConnection;

