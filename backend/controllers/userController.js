// controllers/userController.js
const User = require('../models/User');
const Property = require('../models/Property');

/**
 * Get user profile
 * GET /api/users/profile
 */
exports.getProfile = async (req, res) => {
  try {
    // req.user is attached by auth middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil.' });
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, whatsapp, dateOfBirth } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, whatsapp, dateOfBirth },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json({ message: 'Profil mis à jour avec succès', user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du profil.' });
  }
};

/**
 * Change user password
 * PUT /api/users/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect.' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Erreur serveur lors du changement de mot de passe.' });
  }
};

/**
 * Get user favorites
 * GET /api/users/favorites
 */
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des favoris.' });
  }
};

/**
 * Add property to favorites
 * POST /api/users/favorites/:propertyId
 */
exports.addToFavorites = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    // Add to favorites if not already there
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favorites: propertyId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json({ message: 'Propriété ajoutée aux favoris' });
  } catch (err) {
    console.error('Add to favorites error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout aux favoris.' });
  }
};

/**
 * Remove property from favorites
 * DELETE /api/users/favorites/:propertyId
 */
exports.removeFromFavorites = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: propertyId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json({ message: 'Propriété retirée des favoris' });
  } catch (err) {
    console.error('Remove from favorites error:', err);
    res.status(500).json({ message: 'Erreur serveur lors du retrait des favoris.' });
  }
};

/**
 * Get user stats
 * GET /api/users/stats
 */
exports.getStats = async (req, res) => {
  try {
    const [propertiesCount, favoritesCount] = await Promise.all([
      Property.countDocuments({ owner: req.user.id }),
      User.findById(req.user.id).then(user => user.favorites.length)
    ]);

    res.json({
      properties: propertiesCount,
      favorites: favoritesCount
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des statistiques.' });
  }
};

/**
 * Get user alerts
 * GET /api/users/alerts
 */
exports.getAlerts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.json({ alerts: user.alerts });
  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des alertes.' });
  }
};

/**
 * Create user alert
 * POST /api/users/alerts
 */
exports.createAlert = async (req, res) => {
  try {
    const alertData = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { alerts: { ...alertData, createdAt: new Date() } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Return the newly created alert
    const newAlert = user.alerts[user.alerts.length - 1];
    res.status(201).json({ alert: newAlert });
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'alerte.' });
  }
};

/**
 * Delete user alert
 * DELETE /api/users/alerts/:alertId
 */
exports.deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { alerts: { _id: alertId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json({ message: 'Alerte supprimée avec succès' });
  } catch (err) {
    console.error('Delete alert error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'alerte.' });
  }
};

/**
 * Get matching properties for user alerts
 * GET /api/users/alerts/matching
 */
exports.getMatchingPropertiesForAlerts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // For each alert, find matching properties
    const matchingResults = [];
    
    for (const alert of user.alerts) {
      const filter = {
        status: 'online',
        type: alert.type,
        price: { $gte: alert.minPrice, $lte: alert.maxPrice }
      };
      
      if (alert.city) {
        filter.city = new RegExp(alert.city, 'i');
      }
      
      if (alert.rooms) {
        filter.rooms = { $gte: alert.rooms };
      }
      
      const properties = await Property.find(filter).limit(5);
      matchingResults.push({
        alertId: alert._id,
        alertTitle: alert.title,
        properties
      });
    }

    res.json({ matches: matchingResults });
  } catch (err) {
    console.error('Get matching properties error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la recherche de propriétés correspondantes.' });
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'utilisateur.' });
  }
};

/**
 * Add comment to user
 * POST /api/users/:id/comments
 */
exports.addUserComment = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.params.id;
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'La note doit être comprise entre 1 et 5.' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    // Add comment
    user.comments.push({
      user: req.user.id,
      rating,
      comment,
      createdAt: new Date()
    });
    
    await user.save();
    
    // Return the newly created comment
    const newComment = user.comments[user.comments.length - 1];
    res.status(201).json({ comment: newComment });
  } catch (err) {
    console.error('Add user comment error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du commentaire.' });
  }
};

/**
 * Respond to user comment
 * POST /api/users/:id/comments/:commentId/responses
 */
exports.respondToUserComment = async (req, res) => {
  try {
    const { responseText } = req.body;
    const { id: userId, commentId } = req.params;
    
    // Find user and comment
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    const comment = user.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé.' });
    }
    
    // Add response
    comment.responses.push({
      owner: req.user.id,
      responseText,
      createdAt: new Date()
    });
    
    await user.save();
    
    res.json({ message: 'Réponse ajoutée avec succès' });
  } catch (err) {
    console.error('Respond to user comment error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout de la réponse.' });
  }
};

/**
 * Get user comments
 * GET /api/users/:id/comments
 */
exports.getUserComments = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('comments');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    // Populate user references in comments
    await user.populate('comments.user', 'firstName lastName avatarUrl');
    
    res.json({ comments: user.comments });
  } catch (err) {
    console.error('Get user comments error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des commentaires.' });
  }
};

/**
 * Update profile picture
 * PUT /api/users/:id/avatar
 */
exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni.' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatarUrl: req.file.path },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json({ message: 'Photo de profil mise à jour avec succès', user });
  } catch (err) {
    console.error('Update profile picture error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la photo de profil.' });
  }
};

/**
 * Delete profile picture
 * DELETE /api/users/:id/avatar
 */
exports.deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatarUrl: null },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json({ message: 'Photo de profil supprimée avec succès', user });
  } catch (err) {
    console.error('Delete profile picture error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de la photo de profil.' });
  }
};

/**
 * Get user subscription
 * GET /api/users/subscription
 */
exports.getSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('subscription');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.json({ subscription: user.subscription });
  } catch (err) {
    console.error('Get subscription error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'abonnement.' });
  }
};

/**
 * Refresh user subscription status
 * POST /api/users/subscription/refresh
 */
exports.refreshSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    // Check if subscription has expired
    if (user.subscription.expiresAt && new Date(user.subscription.expiresAt) < new Date()) {
      user.subscription.active = false;
      await user.save();
    }
    
    res.json({ subscription: user.subscription });
  } catch (err) {
    console.error('Refresh subscription error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'abonnement.' });
  }
};

/**
 * Check if user has premium access
 * GET /api/users/premium-status
 */
exports.getPremiumStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    const isPremium = user.subscription && 
                     user.subscription.active && 
                     user.subscription.expiresAt && 
                     new Date(user.subscription.expiresAt) > new Date();
    
    res.json({ 
      isPremium,
      subscription: user.subscription,
      expiresAt: user.subscription?.expiresAt
    });
  } catch (err) {
    console.error('Get premium status error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la vérification du statut premium.' });
  }
};
