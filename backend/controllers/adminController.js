// controllers/adminController.js
const Property = require('../models/Property');
const User = require('../models/User');
const nodemailer = require('nodemailer');

/**
 * @desc    Get all pending listings
 * @route   GET /api/admin/listings/pending
 * @access  Private (Admin only)
 */
exports.getPendingListings = async (req, res) => {
  try {
    const properties = await Property.find({ status: 'pending' })
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      properties,
      count: properties.length
    });
  } catch (err) {
    console.error('Get pending listings error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des annonces en attente.' });
  }
};

/**
 * @desc    Approve a listing
 * @route   PUT /api/admin/listings/approve/:id
 * @access  Private (Admin only)
 */
exports.approveListing = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'firstName lastName email');

    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    if (property.status !== 'pending') {
      return res.status(400).json({ message: 'Cette propriété n\'est pas en attente de validation.' });
    }

    // Update property status
    property.status = 'approved';
    await property.save();

    // Send notification email to owner
    await sendNotificationEmail(
      property.owner.email,
      'Votre annonce a été approuvée',
      `Bonjour ${property.owner.firstName},

Votre annonce "${property.title}" a été approuvée et est maintenant visible publiquement.

Cordialement,
L'équipe Project-Kama`
    );

    res.json({
      message: 'Propriété approuvée avec succès',
      property
    });
  } catch (err) {
    console.error('Approve listing error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'approbation de la propriété.' });
  }
};

/**
 * @desc    Reject a listing
 * @route   PUT /api/admin/listings/reject/:id
 * @access  Private (Admin only)
 */
exports.rejectListing = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'firstName lastName email');

    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    if (property.status !== 'pending') {
      return res.status(400).json({ message: 'Cette propriété n\'est pas en attente de validation.' });
    }

    const { reason } = req.body;

    // Update property status
    property.status = 'rejected';
    await property.save();

    // Send notification email to owner
    const rejectionMessage = reason 
      ? `Votre annonce "${property.title}" a été rejetée pour la raison suivante : ${reason}.`
      : `Votre annonce "${property.title}" a été rejetée.`;
      
    await sendNotificationEmail(
      property.owner.email,
      'Votre annonce a été rejetée',
      `Bonjour ${property.owner.firstName},

${rejectionMessage}

Cordialement,
L'équipe Project-Kama`
    );

    res.json({
      message: 'Propriété rejetée avec succès',
      property
    });
  } catch (err) {
    console.error('Reject listing error:', err);
    res.status(500).json({ message: 'Erreur serveur lors du rejet de la propriété.' });
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users/list
 * @access  Private (Admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    res.json({
      users,
      count: users.length
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs.' });
  }
};

/**
 * @desc    Get all properties (all statuses)
 * @route   GET /api/admin/properties/list
 * @access  Private (Admin only)
 */
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({})
      .populate('owner', 'firstName lastName email whatsapp')
      .sort({ createdAt: -1 });

    res.json({
      properties,
      count: properties.length
    });
  } catch (err) {
    console.error('Get all properties error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des propriétés.' });
  }
};

/**
 * @desc    Delete a property
 * @route   DELETE /api/admin/properties/:id
 * @access  Private (Admin only)
 */
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    // Delete the property
    await Property.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Propriété supprimée avec succès'
    });
  } catch (err) {
    console.error('Delete property error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de la propriété.' });
  }
};

/**
 * @desc    Ban a user
 * @route   PUT /api/admin/users/:id/ban
 * @access  Private (Admin only)
 */
exports.banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Ban the user
    user.isBanned = true;
    await user.save();

    res.json({
      message: 'Utilisateur banni avec succès',
      user
    });
  } catch (err) {
    console.error('Ban user error:', err);
    res.status(500).json({ message: 'Erreur serveur lors du bannissement de l\'utilisateur.' });
  }
};

/**
 * @desc    Unban a user
 * @route   PUT /api/admin/users/:id/unban
 * @access  Private (Admin only)
 */
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Unban the user
    user.isBanned = false;
    await user.save();

    res.json({
      message: 'Utilisateur débanni avec succès',
      user
    });
  } catch (err) {
    console.error('Unban user error:', err);
    res.status(500).json({ message: 'Erreur serveur lors du débannissement de l\'utilisateur.' });
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'utilisateur.' });
  }
};

/**
 * @desc    Get all reported properties
 * @route   GET /api/admin/reports/properties
 * @access  Private (Admin only)
 */
exports.getReportedProperties = async (req, res) => {
  try {
    // Find properties with reports
    const properties = await Property.find({ 'reports.0': { $exists: true } })
      .populate('owner', 'firstName lastName email')
      .populate('reports.reportedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      properties,
      count: properties.length
    });
  } catch (err) {
    console.error('Get reported properties error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des propriétés signalées.' });
  }
};

/**
 * @desc    Get all reported comments
 * @route   GET /api/admin/reports/comments
 * @access  Private (Admin only)
 */
exports.getReportedComments = async (req, res) => {
  try {
    // Find properties with reported comments
    const properties = await Property.find({ 'reviews.reports.0': { $exists: true } })
      .populate('owner', 'firstName lastName email')
      .populate('reviews.user', 'firstName lastName email')
      .populate('reviews.reports.reportedBy', 'firstName lastName email');

    // Extract comments with reports
    const reportedComments = [];
    properties.forEach(property => {
      property.reviews.forEach(review => {
        if (review.reports && review.reports.length > 0) {
          reportedComments.push({
            property: {
              id: property._id,
              title: property.title
            },
            comment: {
              id: review._id,
              text: review.comment,
              user: review.user,
              reports: review.reports
            }
          });
        }
      });
    });

    res.json({
      comments: reportedComments,
      count: reportedComments.length
    });
  } catch (err) {
    console.error('Get reported comments error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des commentaires signalés.' });
  }
};

/**
 * @desc    Get platform statistics
 * @route   GET /api/admin/statistics
 * @access  Private (Admin only)
 */
exports.getStatistics = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments({});
    const totalProperties = await Property.countDocuments({});
    const pendingProperties = await Property.countDocuments({ status: 'pending' });
    const approvedProperties = await Property.countDocuments({ status: 'approved' });
    const rejectedProperties = await Property.countDocuments({ status: 'rejected' });
    
    // Get user roles distribution
    const userRoles = {
      client: await User.countDocuments({ role: 'client' }),
      seller: await User.countDocuments({ role: 'vendeur' }),
      admin: await User.countDocuments({ role: 'admin' })
    };
    
    // Get property types distribution
    const propertyTypes = {
      maison: await Property.countDocuments({ type: 'maison' }),
      appartement: await Property.countDocuments({ type: 'appartement' }),
      terrain: await Property.countDocuments({ type: 'terrain' }),
      vacances: await Property.countDocuments({ type: 'vacances' }),
      location: await Property.countDocuments({ type: 'location' })
    };
    
    // Get most viewed property
    const mostViewedProperty = await Property.findOne({})
      .sort({ views: -1 })
      .populate('owner', 'firstName lastName email whatsapp');
    
    // Get properties in negotiation
    const negotiationProperties = await Property.countDocuments({ status: 'negotiation' });
    
    // Get banned users
    const bannedUsers = await User.countDocuments({ isBanned: true });
    
    // Get all properties grouped by city
    const propertiesByCity = await Property.aggregate([
      { $match: { 'address.city': { $exists: true, $ne: null } } },
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get top sellers (users with most properties)
    const topSellers = await Property.aggregate([
      { $group: { _id: '$owner', propertyCount: { $sum: 1 } } },
      { $sort: { propertyCount: -1 } },
      { $limit: 10 },
      { 
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'ownerInfo'
        }
      },
      { $unwind: '$ownerInfo' },
      { 
        $project: {
          _id: 1,
          propertyCount: 1,
          'ownerInfo.firstName': 1,
          'ownerInfo.lastName': 1,
          'ownerInfo.email': 1,
          'ownerInfo.whatsapp': 1
        }
      }
    ]);
    
    // Get most expensive property
    const mostExpensiveProperty = await Property.findOne({ price: { $exists: true } })
      .sort({ price: -1 })
      .populate('owner', 'firstName lastName email whatsapp');
    
    // Get all property statuses
    const propertyStatuses = {
      pending: await Property.countDocuments({ status: 'pending' }),
      approved: await Property.countDocuments({ status: 'approved' }),
      rejected: await Property.countDocuments({ status: 'rejected' }),
      online: await Property.countDocuments({ status: 'online' }),
      negotiation: await Property.countDocuments({ status: 'negotiation' }),
      sold: await Property.countDocuments({ status: 'sold' }),
      removed: await Property.countDocuments({ status: 'removed' })
    };
    
    // Log the propertyStatuses to debug
    console.log('Property statuses:', propertyStatuses);
    
    // Get recent search patterns (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSearches = await User.aggregate([
      { $unwind: '$searchHistory' },
      { $match: { 'searchHistory.timestamp': { $gte: thirtyDaysAgo } } },
      { $sort: { 'searchHistory.timestamp': -1 } },
      { $limit: 100 },
      {
        $project: {
          'searchHistory.query': 1,
          'searchHistory.timestamp': 1,
          'searchHistory.resultsCount': 1,
          firstName: 1,
          lastName: 1,
          email: 1
        }
      }
    ]);
    
    // Get popular search terms
    const popularSearchTerms = await User.aggregate([
      { $unwind: '$searchHistory' },
      { $match: { 'searchHistory.timestamp': { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$searchHistory.query',
          count: { $sum: 1 },
          avgResults: { $avg: '$searchHistory.resultsCount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    const statisticsData = {
      overview: {
        totalUsers,
        totalProperties,
        pendingProperties,
        approvedProperties,
        rejectedProperties,
        negotiationProperties,
        bannedUsers
      },
      userRoles,
      propertyTypes,
      propertyStatuses,
      mostViewedProperty: mostViewedProperty ? {
        id: mostViewedProperty._id,
        title: mostViewedProperty.title,
        views: mostViewedProperty.views,
        price: mostViewedProperty.price,
        city: mostViewedProperty.address?.city,
        owner: mostViewedProperty.owner
      } : null,
      mostExpensiveProperty: mostExpensiveProperty ? {
        id: mostExpensiveProperty._id,
        title: mostExpensiveProperty.title,
        price: mostExpensiveProperty.price,
        city: mostExpensiveProperty.address?.city,
        owner: mostExpensiveProperty.owner
      } : null,
      topSellers,
      propertiesByCity,
      recentSearches,
      popularSearchTerms
    };
    
    // Log the full statistics data to debug
    console.log('Full statistics data:', JSON.stringify(statisticsData, null, 2));
    
    res.json(statisticsData);
  } catch (err) {
    console.error('Get statistics error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des statistiques.' });
  }
};

/**
 * Send notification email
 */
const sendNotificationEmail = async (to, subject, message) => {
  try {
    // Only send emails in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('Email notification (dev mode):', { to, subject, message });
      return;
    }

    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message
    });
  } catch (err) {
    console.error('Email notification error:', err);
  }
};
