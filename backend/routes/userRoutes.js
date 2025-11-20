// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const Property = require('../models/Property');

/**
 * Récupérer le profil de l'utilisateur connecté
 * GET /api/users/profile
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil.' });
  }
});

/**
 * Mettre à jour le profil de l'utilisateur
 * PUT /api/users/profile
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, whatsapp, dateOfBirth } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, whatsapp, dateOfBirth },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profil mis à jour avec succès',
      user
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du profil.' });
  }
});

/**
 * Changer le mot de passe
 * PUT /api/users/change-password
 */
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mot de passe actuel et nouveau mot de passe requis.' });
    }

    const user = await User.findById(req.user.id);
    
    // Vérifier le mot de passe actuel
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect.' });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Erreur serveur lors du changement de mot de passe.' });
  }
});

/**
 * Supprimer le compte utilisateur
 * DELETE /api/users/account
 */
router.delete('/account', protect, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Mot de passe requis pour supprimer le compte.' });
    }

    const user = await User.findById(req.user.id);
    
    // Vérifier le mot de passe
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect.' });
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du compte.' });
  }
});

/**
 * Récupérer les statistiques de l'utilisateur
 * GET /api/users/stats
 */
router.get('/stats', protect, async (req, res) => {
  try {
    // Compter les propriétés de l'utilisateur
    const totalProperties = await Property.countDocuments({ owner: req.user.id });
    const onlineProperties = await Property.countDocuments({ 
      owner: req.user.id, 
      status: 'online' 
    });
    const pendingProperties = await Property.countDocuments({ 
      owner: req.user.id, 
      status: 'pending' 
    });
    
    // Compter les favoris de l'utilisateur
    const user = await User.findById(req.user.id);
    const favoriteCount = user.favorites.length;
    
    // Compter les vues (simulation - dans une vraie application, vous auriez un système de suivi des vues)
    const viewCount = totalProperties * 10; // Simulation : 10 vues par propriété
    
    res.json({
      totalProperties,
      onlineProperties,
      pendingProperties,
      favoriteCount,
      viewCount
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des statistiques.' });
  }
});

/**
 * Récupérer les propriétés de l'utilisateur
 * GET /api/users/properties
 */
router.get('/properties', protect, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error('Get user properties error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des propriétés.' });
  }
});

/**
 * Ajouter une propriété aux favoris
 * POST /api/users/favorites/:propertyId
 */
router.post('/favorites/:propertyId', protect, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user.favorites.includes(propertyId)) {
      user.favorites.push(propertyId);
      await user.save();
    }
    
    res.json({ message: 'Propriété ajoutée aux favoris.' });
  } catch (err) {
    console.error('Add to favorites error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout aux favoris.' });
  }
});

/**
 * Retirer une propriété des favoris
 * DELETE /api/users/favorites/:propertyId
 */
router.delete('/favorites/:propertyId', protect, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const user = await User.findById(req.user.id);
    
    user.favorites = user.favorites.filter(id => id.toString() !== propertyId);
    await user.save();
    
    res.json({ message: 'Propriété retirée des favoris.' });
  } catch (err) {
    console.error('Remove from favorites error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression des favoris.' });
  }
});

/**
 * Récupérer les favoris de l'utilisateur
 * GET /api/users/favorites
 */
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      populate: {
        path: 'owner',
        select: 'firstName lastName email whatsapp'
      }
    });
    
    // Filtrer les favoris qui n'existent plus
    const validFavorites = user.favorites.filter(fav => fav !== null);
    
    res.json(validFavorites);
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des favoris.' });
  }
});

/**
 * Récupérer les alertes de l'utilisateur
 * GET /api/users/alerts
 */
router.get('/alerts', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('alerts');
    res.json(user.alerts || []);
  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des alertes.' });
  }
});

/**
 * Créer une alerte pour l'utilisateur
 * POST /api/users/alerts
 */
router.post('/alerts', protect, async (req, res) => {
  try {
    const { title, type, minPrice, maxPrice, city, rooms } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Créer une nouvelle alerte
    const newAlert = {
      title,
      type,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      city,
      rooms: rooms ? Number(rooms) : undefined,
      createdAt: new Date()
    };
    
    // Ajouter l'alerte à l'utilisateur
    if (!user.alerts) user.alerts = [];
    user.alerts.push(newAlert);
    await user.save();
    
    res.status(201).json({ message: 'Alerte créée avec succès.', alert: newAlert });
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'alerte.' });
  }
});

/**
 * Récupérer les propriétés correspondantes aux alertes de l'utilisateur
 * GET /api/users/alerts/matching
 */
router.get('/alerts/matching', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('alerts');
    if (!user.alerts || user.alerts.length === 0) {
      return res.status(200).json([]);
    }
    
    // Build query conditions for each alert
    const orConditions = user.alerts.map(alert => {
      const condition = {};
      
      if (alert.type) {
        condition.type = alert.type;
      }
      
      if (alert.city) {
        condition['address.city'] = new RegExp(alert.city, 'i');
      }
      
      if (alert.minPrice || alert.maxPrice) {
        condition.price = {};
        if (alert.minPrice) {
          condition.price.$gte = Number(alert.minPrice);
        }
        if (alert.maxPrice) {
          condition.price.$lte = Number(alert.maxPrice);
        }
      }
      
      if (alert.rooms) {
        condition.rooms = { $gte: Number(alert.rooms) };
      }
      
      return condition;
    });
    
    // Find properties that match any of the alerts
    const matchingProperties = await Property.find({
      $or: orConditions,
      status: 'online'
    }).populate('owner', 'firstName lastName email whatsapp');
    
    res.status(200).json(matchingProperties);
  } catch (err) {
    console.error('Get matching properties for alerts error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des propriétés correspondantes.' });
  }
});

/**
 * Supprimer une alerte de l'utilisateur
 * DELETE /api/users/alerts/:alertId
 */
router.delete('/alerts/:alertId', protect, async (req, res) => {
  try {
    const { alertId } = req.params;
    const user = await User.findById(req.user.id);
    
    // Supprimer l'alerte de l'utilisateur
    user.alerts = user.alerts.filter(alert => alert._id.toString() !== alertId);
    await user.save();
    
    res.json({ message: 'Alerte supprimée avec succès.' });
  } catch (err) {
    console.error('Delete alert error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'alerte.' });
  }
});

/**
 * Récupérer l'abonnement de l'utilisateur
 * GET /api/users/subscription
 */
router.get('/subscription', protect, async (req, res) => {
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
});

/**
 * Rafraîchir le statut d'abonnement de l'utilisateur
 * POST /api/users/subscription/refresh
 */
router.post('/subscription/refresh', protect, async (req, res) => {
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
});

/**
 * Vérifier le statut premium de l'utilisateur
 * GET /api/users/premium-status
 */
router.get('/premium-status', protect, async (req, res) => {
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
});

/**
 * Récupérer un utilisateur par ID
 * GET /api/users/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate user ID
    if (!id) {
      return res.status(400).json({ message: 'ID utilisateur requis.' });
    }
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'utilisateur.' });
  }
});

/**
 * Ajouter un commentaire à un utilisateur
 * POST /api/users/:id/comments
 */
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'La note doit être comprise entre 1 et 5.' });
    }
    
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Le commentaire est requis.' });
    }
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    // Prevent users from commenting on themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas commenter votre propre profil.' });
    }
    
    // Check if user already commented on this user
    const existingComment = user.comments.find(c => c.user.toString() === req.user.id);
    if (existingComment) {
      return res.status(400).json({ message: 'Vous avez déjà laissé un commentaire sur ce profil.' });
    }
    
    // Add comment
    user.comments = user.comments || [];
    user.comments.push({
      user: req.user.id,
      rating,
      comment: comment.trim(),
      createdAt: new Date()
    });
    
    await user.save();
    
    // Populate the new comment with user info
    await user.populate({
      path: 'comments.user',
      select: 'firstName lastName'
    });
    
    const newComment = user.comments[user.comments.length - 1];
    
    res.status(201).json({
      message: 'Commentaire ajouté avec succès',
      comment: newComment
    });
  } catch (err) {
    console.error('Add user comment error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du commentaire.' });
  }
});

/**
 * Récupérer les commentaires d'un utilisateur
 * GET /api/users/:id/comments
 */
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id).populate({
      path: 'comments.user',
      select: 'firstName lastName'
    }).populate({
      path: 'comments.responses.owner',
      select: 'firstName lastName'
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    res.json(user.comments || []);
  } catch (err) {
    console.error('Get user comments error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des commentaires.' });
  }
});

/**
 * Répondre à un commentaire d'un utilisateur
 * POST /api/users/:id/comments/:commentId/responses
 */
router.post('/:id/comments/:commentId/responses', protect, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { responseText } = req.body;
    
    // Validate input
    if (!responseText || responseText.trim().length === 0) {
      return res.status(400).json({ message: 'La réponse est requise.' });
    }
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    // Find the comment
    const comment = user.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé.' });
    }
    
    // Check if the current user is the owner of the profile
    if (id !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }
    
    // Check if comment already has a response
    if (comment.responses && comment.responses.length > 0) {
      return res.status(400).json({ message: 'Ce commentaire a déjà une réponse.' });
    }
    
    // Add response
    comment.responses = comment.responses || [];
    comment.responses.push({
      owner: req.user.id,
      responseText: responseText.trim(),
      createdAt: new Date()
    });
    
    await user.save();
    
    // Populate the response with owner info
    await user.populate({
      path: 'comments.responses.owner',
      select: 'firstName lastName'
    });
    
    const updatedComment = user.comments.id(commentId);
    
    res.json({
      message: 'Réponse ajoutée avec succès',
      comment: updatedComment
    });
  } catch (err) {
    console.error('Respond to user comment error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout de la réponse.' });
  }
});

/**
 * Mettre à jour la photo de profil de l'utilisateur
 * PUT /api/users/:id/avatar
 */
router.put('/:id/avatar', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists and is authorized
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    // Check if the current user is the owner of the profile or is admin
    if (id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier téléchargé.' });
    }
    
    // Here you would typically upload to a service like Cloudinary
    // For now, we'll just store the file path
    user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await user.save();
    
    res.json({
      message: 'Photo de profil mise à jour avec succès',
      avatarUrl: user.avatarUrl
    });
  } catch (err) {
    console.error('Update profile picture error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la photo de profil.' });
  }
});

/**
 * Supprimer la photo de profil de l'utilisateur
 * DELETE /api/users/:id/avatar
 */
router.delete('/:id/avatar', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists and is authorized
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    // Check if the current user is the owner of the profile or is admin
    if (id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }
    
    // Remove avatar URL
    user.avatarUrl = null;
    await user.save();
    
    res.json({
      message: 'Photo de profil supprimée avec succès'
    });
  } catch (err) {
    console.error('Delete profile picture error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de la photo de profil.' });
  }
});

module.exports = router;