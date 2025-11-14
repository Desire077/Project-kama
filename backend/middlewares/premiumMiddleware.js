// middlewares/premiumMiddleware.js
const User = require('../models/User');

/**
 * Check if user has premium access
 * - Vérifie si l'utilisateur a un abonnement premium actif
 * - Attache les informations de premium à req.user
 */
const checkPremiumAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Check if user has premium access
    const hasPremiumAccess = user.isPremium || (user.subscription && user.subscription.active && 
      user.subscription.expiresAt && user.subscription.expiresAt > new Date());

    // Attach premium status to request
    req.user.isPremium = hasPremiumAccess;
    req.user.subscription = user.subscription;

    next();
  } catch (err) {
    console.error('Premium access check error:', err);
    return res.status(500).json({ message: 'Erreur serveur lors de la vérification des accès premium.' });
  }
};

/**
 * Require premium access middleware
 * - Vérifie que l'utilisateur a un abonnement premium actif
 * - Renvoie une erreur 403 si l'utilisateur n'a pas d'accès premium
 */
const requirePremium = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Check if user has premium access
    const hasPremiumAccess = user.isPremium || (user.subscription && user.subscription.active && 
      user.subscription.expiresAt && user.subscription.expiresAt > new Date());

    if (!hasPremiumAccess) {
      return res.status(403).json({ 
        message: 'Accès premium requis. Veuillez passer à la version premium pour accéder à cette fonctionnalité.' 
      });
    }

    // Attach premium status to request
    req.user.isPremium = hasPremiumAccess;
    req.user.subscription = user.subscription;

    next();
  } catch (err) {
    console.error('Premium requirement check error:', err);
    return res.status(500).json({ message: 'Erreur serveur lors de la vérification des accès premium.' });
  }
};

/**
 * Check property boost eligibility
 * - Vérifie si l'utilisateur peut booster une propriété
 */
const canBoostProperty = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Check if user has premium access
    const hasPremiumAccess = user.isPremium || (user.subscription && user.subscription.active && 
      user.subscription.expiresAt && user.subscription.expiresAt > new Date());

    if (!hasPremiumAccess) {
      return res.status(403).json({ 
        message: 'La fonctionnalité de boost est réservée aux utilisateurs premium.' 
      });
    }

    next();
  } catch (err) {
    console.error('Boost eligibility check error:', err);
    return res.status(500).json({ message: 'Erreur serveur lors de la vérification de l\'éligibilité au boost.' });
  }
};

module.exports = { checkPremiumAccess, requirePremium, canBoostProperty };