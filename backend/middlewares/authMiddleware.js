// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect middleware
 * - Récupère le token depuis l'en-tête Authorization: Bearer <token>
 * - Vérifie / décode le token
 * - Attache req.user = { id, role, email } pour utilisation ultérieure
 */
const protect = async (req, res, next) => {
  let token;
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'Pas de token, accès refusé.' });
    } 

    console.log('Token received:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // decoded contient { id, role, iat, exp } selon ce qu'on a signé
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('User not found for decoded token id:', decoded.id);
      return res.status(401).json({ message: 'Token invalide (utilisateur introuvable).' });
    }

    // Check if user is banned
    if (user.isBanned) {
      console.log('Banned user attempted to access:', user._id);
      return res.status(403).json({ message: 'Compte banni. Accès refusé.' });
    }

    // On attache des données utiles au req
    req.user = { id: user._id.toString(), role: user.role, email: user.email };
    console.log('User attached to request:', req.user);

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

/**
 * authorize(...roles) middleware
 * Ex : authorize('admin','vendeur')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Non authentifié.' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Accès interdit.' });
  next();
};

module.exports = { protect, authorize };
