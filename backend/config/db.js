// config/db.js
const mongoose = require('mongoose');

// Options de connexion robustes pour éviter les déconnexions
const mongooseOptions = {
  // Temps max pour sélectionner un serveur MongoDB (30 secondes)
  serverSelectionTimeoutMS: 30000,
  // Fréquence des heartbeats pour maintenir la connexion active (10 secondes)
  heartbeatFrequencyMS: 10000,
  // Timeout pour les opérations socket (45 secondes)
  socketTimeoutMS: 45000,
  // Taille du pool de connexions
  maxPoolSize: 10,
  minPoolSize: 2,
  // Timeout max pour les connexions inactives (30 minutes)
  maxIdleTimeMS: 1800000,
  // Garder les connexions vivantes
  family: 4, // Utiliser IPv4
};

let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    isConnected = true;
    reconnectAttempts = 0;
    console.log('✅ MongoDB connected successfully');

    // Gérer la déconnexion
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
      // Tenter une reconnexion automatique
      handleReconnection();
    });

    // Gérer les erreurs de connexion
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
    });

    // Confirmer la reconnexion
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
      isConnected = true;
      reconnectAttempts = 0;
    });

    // Connexion ouverte
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connection established');
      isConnected = true;
    });

  } catch (err) {
    console.error('❌ MongoDB initial connection error:', err.message);
    isConnected = false;
    // Essayer de se reconnecter
    handleReconnection();
  }
};

// Fonction de reconnexion avec backoff exponentiel
const handleReconnection = async () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('❌ Max reconnection attempts reached. Exiting...');
    process.exit(1);
  }

  reconnectAttempts++;
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Max 30 secondes
  
  console.log(`🔄 Attempting to reconnect to MongoDB (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay/1000}s...`);
  
  setTimeout(async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
      console.log('✅ MongoDB reconnected after disconnection');
      isConnected = true;
      reconnectAttempts = 0;
    } catch (err) {
      console.error('❌ Reconnection failed:', err.message);
      handleReconnection();
    }
  }, delay);
};

// Fonction utilitaire pour vérifier l'état de la connexion
const checkConnection = () => {
  return mongoose.connection.readyState === 1;
};

// Exporter les fonctions
module.exports = connectDB;
module.exports.checkConnection = checkConnection;
