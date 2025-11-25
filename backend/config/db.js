// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Supprimer les options obsolètes (Mongoose 8 les ignore mais évitons les warnings)
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('MongoDB connected');

    // Gérer les reconnexions automatiques
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
