// middlewares/adminMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * isAdmin middleware
 * - Vérifie le token JWT
 * - Vérifie que le rôle est 'admin'
 * - Attache req.user pour utilisation ultérieure
 */
const isAdmin = async (req, res, next) => {
  let token;
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Pas de token, accès refusé.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token invalide (utilisateur introuvable).' });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ message: 'Compte banni. Accès refusé.' });
    }

    // Vérifier que l'utilisateur est un admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès interdit. Droits administrateur requis.' });
    }

    // Attacher les données utilisateur à la requête
    req.user = { id: user._id.toString(), role: user.role, email: user.email };
    
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

module.exports = { isAdmin };