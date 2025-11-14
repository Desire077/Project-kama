// controllers/propertyController.js
const Property = require('../models/Property');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary'); // Use the configured Cloudinary instance

// Helper function to check if user can create more properties
const canCreateMoreProperties = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return { canCreate: false, message: 'Utilisateur non trouvé' };
  
  // Check if user is premium
  const isPremium = user.isPremium || (user.subscription && user.subscription.active && 
    user.subscription.expiresAt && user.subscription.expiresAt > new Date());
  
  // Count user's active properties
  const propertyCount = await Property.countDocuments({ 
    owner: userId, 
    status: { $in: ['pending', 'approved', 'online'] } 
  });
  
  // Premium users can create unlimited properties, regular users only 1
  if (isPremium) {
    return { canCreate: true };
  } else {
    if (propertyCount >= 1) {
      return { canCreate: false, message: 'Les utilisateurs non premium ne peuvent créer qu\'une seule annonce. Veuillez passer à la version premium pour créer plus d\'annonces.' };
    }
    return { canCreate: true };
  }
}

/**
 * Créer une nouvelle propriété
 * POST /api/properties
 */
exports.createProperty = async (req, res) => {
  try {
    // Check if user can create more properties
    const checkResult = await canCreateMoreProperties(req.user.id);
    if (!checkResult.canCreate) {
      return res.status(403).json({ message: checkResult.message });
    }
    
    const {
      title,
      description,
      type,
      price,
      currency = 'XAF',
      surface,
      rooms,
      bathrooms,
      kitchens,
      livingRooms,
      terrace,
      pool,
      parking,
      address,
      availabilityDate
    } = req.body;

    // Validation des champs obligatoires
    if (!title || !type || !price || !surface || !address) {
      return res.status(400).json({ 
        message: 'Titre, type, prix, surface et adresse sont requis.' 
      });
    }

    // Créer la propriété
    const property = await Property.create({
      owner: req.user.id,
      title,
      description,
      type,
      price,
      currency,
      surface,
      rooms,
      bathrooms,
      kitchens,
      livingRooms,
      terrace,
      pool,
      parking,
      address,
      availabilityDate: availabilityDate ? new Date(availabilityDate) : null,
      status: 'approved', // Changed from 'pending' to 'approved' to remove validation step
      images: [] // Initialize with empty array
    });

    // Populate owner info
    await property.populate('owner', 'firstName lastName email whatsapp');
    
    console.log('Property created with ID:', property._id);
    console.log('Property images after creation:', property.images);

    res.status(201).json({
      message: 'Propriété créée avec succès',
      property
    });
  } catch (err) {
    console.error('Create property error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la propriété.' });
  }
};

/**
 * Récupérer toutes les propriétés avec filtres
 * GET /api/properties
 */
exports.getProperties = async (req, res) => {
  try {
    const {
      type,
      minPrice,
      maxPrice,
      city,
      rooms,
      surface,
      status = 'approved', // Keep this as 'approved' to match our new default
      page = 1,
      limit = 10
    } = req.query;

    // Track search patterns for logged in users
    if (req.user) {
      try {
        const searchQuery = [];
        if (type) searchQuery.push(`type:${type}`);
        if (minPrice) searchQuery.push(`minPrice:${minPrice}`);
        if (maxPrice) searchQuery.push(`maxPrice:${maxPrice}`);
        if (city) searchQuery.push(`city:${city}`);
        if (rooms) searchQuery.push(`rooms:${rooms}`);
        if (surface) searchQuery.push(`surface:${surface}`);
        
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user.id, {
          $push: {
            searchHistory: {
              query: searchQuery.join(', '),
              timestamp: new Date(),
              resultsCount: 0 // Will be updated after we get the count
            }
          }
        });
      } catch (trackError) {
        console.error('Error tracking search pattern:', trackError);
      }
    }

    // Construction du filtre
    const filter = { status };
    
    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    // Use exact match for city instead of partial match
    if (city) filter['address.city'] = city;
    if (rooms) filter.rooms = parseInt(rooms);
    if (surface) filter.surface = { $gte: parseInt(surface) };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const properties = await Property.find(filter)
      .populate('owner', 'firstName lastName email whatsapp')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    console.log('Found properties:', properties.length);
    if (properties.length > 0) {
      console.log('First property images:', properties[0].images);
      console.log('First property ID:', properties[0]._id);
      console.log('First property all data:', JSON.stringify(properties[0], null, 2));
    }

    const total = await Property.countDocuments(filter);

    // Update the search history with results count
    if (req.user) {
      try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (user && user.searchHistory.length > 0) {
          user.searchHistory[user.searchHistory.length - 1].resultsCount = total;
          await user.save();
        }
      } catch (updateError) {
        console.error('Error updating search history with results count:', updateError);
      }
    }

    res.json({
      properties,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (err) {
    console.error('Get properties error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des propriétés.' });
  }
};

/**
 * Récupérer une propriété par ID
 * GET /api/properties/:id
 */
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'firstName lastName email whatsapp createdAt _id');

    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }
      
    // Increment view count only if it's a unique view
    // If user is logged in, check if they've already viewed this property
    let shouldIncrementView = true;
      
    if (req.user) {
      // Check if user has already viewed this property
      if (property.viewedBy.includes(req.user.id)) {
        shouldIncrementView = false;
      } else {
        // Add user to viewedBy array
        property.viewedBy.push(req.user.id);
      }
    }
      
    if (shouldIncrementView) {
      property.views = (property.views || 0) + 1;
    }
      
    // Track views today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
      
    if (property.viewsTodayDate) {
      const lastViewDate = new Date(property.viewsTodayDate);
      lastViewDate.setHours(0, 0, 0, 0);
        
      if (lastViewDate.getTime() === today.getTime()) {
        // Same day, increment today's count only if it's a unique view
        if (shouldIncrementView) {
          property.viewsToday = (property.viewsToday || 0) + 1;
        }
      } else {
        // New day, reset today's count
        property.viewsToday = shouldIncrementView ? 1 : 0;
        property.viewsTodayDate = today;
      }
    } else {
      // First view, initialize
      property.viewsToday = shouldIncrementView ? 1 : 0;
      property.viewsTodayDate = today;
    }
      
    await property.save();
      
    console.log('Property found:', property._id);
    console.log('Property images:', property.images);
    console.log('Property owner:', property.owner);
    console.log('Property full data:', JSON.stringify(property, null, 2));

    res.json(property);
  } catch (err) {
    console.error('Get property by ID error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de la propriété.' });
  }
};

/**
 * Mettre à jour une propriété
 * PUT /api/properties/:id
 */
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    // Mettre à jour la propriété
    Object.keys(req.body).forEach(key => {
      property[key] = req.body[key];
    });

    const updatedProperty = await property.save();
    
    // Populate owner info
    await updatedProperty.populate('owner', 'firstName lastName email whatsapp createdAt _id');

    res.json({
      message: 'Propriété mise à jour avec succès',
      property: updatedProperty
    });
  } catch (err) {
    console.error('Update property error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour.' });
  }
};

/**
 * Supprimer une propriété
 * DELETE /api/properties/:id
 */
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({ message: 'Propriété supprimée avec succès' });
  } catch (err) {
    console.error('Delete property error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression.' });
  }
};

/**
 * Upload d'images pour une propriété
 * POST /api/properties/:id/images
 */
exports.uploadImages = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Aucune image fournie.' });
    }

    console.log('Files received:', req.files.length);
    
    const uploadPromises = req.files.map(file => {
      console.log('Uploading file:', file.originalname);
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'kama/properties' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Upload successful:', result.secure_url);
              resolve(result);
            }
          }
        ).end(file.buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);
    console.log('Upload results:', uploadResults.length);

    // Ajouter les images à la propriété
    const newImages = uploadResults.map(result => ({
      url: result.secure_url,
      public_id: result.public_id
    }));

    console.log('New images to add:', newImages);
    
    // Mettre à jour la propriété avec les nouvelles images
    property.images = [...property.images, ...newImages];
    const updatedProperty = await property.save();
    
    console.log('Property images after save:', updatedProperty.images);
    console.log('Property ID after save:', updatedProperty._id);
    console.log('Full property after save:', JSON.stringify(updatedProperty, null, 2));

    // Recharger la propriété pour s'assurer que les images sont correctement sauvegardées
    const savedProperty = await Property.findById(updatedProperty._id)
      .populate('owner', 'firstName lastName email whatsapp createdAt _id');
    
    console.log('Reloaded property with images:', savedProperty.images);

    res.json({
      message: 'Images uploadées avec succès',
      images: newImages,
      property: savedProperty
    });
  } catch (err) {
    console.error('Upload images error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'upload des images.' });
  }
};

/**
 * Récupérer les propriétés d'un utilisateur
 * GET /api/properties/my-properties
 */
exports.getMyProperties = async (req, res) => {
  try {
    // Log the user information for debugging
    console.log('User info in getMyProperties:', req.user);
    
    // Check if user is authenticated (since this route is now public, we need to check auth here)
    if (!req.user || !req.user.id) {
      console.log('User not authenticated or missing ID');
      return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }
    
    console.log('Searching properties for user ID:', req.user.id);
    const properties = await Property.find({ owner: req.user.id })
      .populate('owner', 'firstName lastName email whatsapp createdAt _id')
      .sort({ createdAt: -1 });
      
    // Add review count to each property
    const propertiesWithReviewCount = properties.map(property => {
      const propertyObj = property.toObject();
      propertyObj.reviewCount = property.reviews.length;
      return propertyObj;
    });
      
    console.log('My properties found:', propertiesWithReviewCount.length);
    if (propertiesWithReviewCount.length > 0) {
      console.log('First property images:', propertiesWithReviewCount[0].images);
    }

    res.json(propertiesWithReviewCount);
  } catch (err) {
    console.error('Get my properties error:', err);
    // Send more detailed error information for debugging
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération de vos propriétés.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Récupérer les propriétés d'un utilisateur spécifique
 * GET /api/properties/user/:userId
 */
exports.getPropertiesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Log request details for debugging
    console.log('getPropertiesByUser called with:', { userId, requestingUser: req.user });
    
    // Validate user ID
    if (!userId) {
      console.log('User ID is missing');
      return res.status(400).json({ message: 'ID utilisateur requis.' });
    }
    
    // Check if the requesting user is the same as the target user
    // If so, show all properties (including non-approved ones)
    // If not, show only approved properties
    const filter = { owner: userId };
    console.log('Initial filter:', filter);
    
    // Si l'utilisateur n'est pas connecté ou s'il ne consulte pas son propre profil,
    // ne montrer que les propriétés approuvées
    if (!req.user || req.user.id !== userId) {
      filter.status = 'approved';
      console.log('User is not owner, showing only approved properties');
    } else {
      console.log('User is owner, showing all properties');
    }
    // Sinon (si l'utilisateur consulte son propre profil), montrer toutes les propriétés
    
    console.log('Final filter:', filter);
    const properties = await Property.find(filter)
      .populate('owner', 'firstName lastName email whatsapp')
      .sort({ createdAt: -1 });
      
    console.log(`Properties found for user ${userId}:`, properties.length);
    console.log('Properties data:', properties.map(p => ({
      id: p._id,
      title: p.title,
      status: p.status,
      owner: p.owner._id
    })));

    // Return the same format as getMyProperties for consistency
    res.json(properties);
  } catch (err) {
    console.error('Get properties by user error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des propriétés.' });
  }
};

/**
 * Get property contact information
 * GET /api/properties/:id/contact
 */
exports.getPropertyContact = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'firstName lastName email whatsapp');
    
    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }
    
    res.json({
      owner: {
        id: property.owner._id,
        firstName: property.owner.firstName,
        lastName: property.owner.lastName,
        email: property.owner.email,
        whatsapp: property.owner.whatsapp
      }
    });
  } catch (err) {
    console.error('Get property contact error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des informations de contact.' });
  }
};

/**
 * Supprimer une image d'une propriété
 * DELETE /api/properties/:id/images/:publicId
 */
exports.removeImage = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    const { publicId } = req.params;
    
    // Find the image in the property by public_id
    const imageIndex = property.images.findIndex(img => img.public_id === publicId);
    
    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image non trouvée.' });
    }

    // Get the image to delete
    const imageToDelete = property.images[imageIndex];
    
    // Remove the image from Cloudinary
    if (imageToDelete.public_id) {
      try {
        await cloudinary.uploader.destroy(imageToDelete.public_id);
        console.log('Image removed from Cloudinary:', imageToDelete.public_id);
      } catch (cloudinaryErr) {
        console.error('Error removing image from Cloudinary:', cloudinaryErr);
        // Continue with the operation even if Cloudinary deletion fails
      }
    }
    
    // Remove the image from the property
    property.images.splice(imageIndex, 1);
    await property.save();

    res.json({
      message: 'Image supprimée avec succès',
      property
    });
  } catch (err) {
    console.error('Remove image error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'image.' });
  }
};

/**
 * Add a review to a property
 * POST /api/properties/:id/reviews
 */
exports.addReview = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }
    
    // Only non-owners can add reviews
    if (property.owner.toString() === req.user.id) {
      return res.status(403).json({ message: 'Les propriétaires ne peuvent pas commenter leurs propres annonces.' });
    }
    
    const { rating, comment } = req.body;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'La note doit être comprise entre 1 et 5.' });
    }
    
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Le commentaire est requis.' });
    }
    
    // Check if user already reviewed this property
    const existingReview = property.reviews.find(review => review.user.toString() === req.user.id);
    if (existingReview) {
      return res.status(400).json({ message: 'Vous avez déjà laissé un avis sur cette annonce.' });
    }
    
    // Add review
    property.reviews.push({
      user: req.user.id,
      rating,
      comment: comment.trim(),
      createdAt: new Date()
    });
    
    await property.save();
    
    // Populate the new review with user info
    await property.populate({
      path: 'reviews.user',
      select: 'firstName lastName'
    });
    
    const newReview = property.reviews[property.reviews.length - 1];
    
    res.status(201).json({
      message: 'Avis ajouté avec succès',
      review: newReview
    });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout de l\'avis.' });
  }
};

/**
 * Respond to a review
 * POST /api/properties/:id/reviews/:reviewId/responses
 */
exports.respondToReview = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }
    
    // Only owner can respond to reviews
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }
    
    const { reviewId } = req.params;
    const { responseText } = req.body;
    
    // Validate input
    if (!responseText || responseText.trim().length === 0) {
      return res.status(400).json({ message: 'La réponse est requise.' });
    }
    
    // Find the review
    const review = property.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Avis non trouvé.' });
    }
    
    // Check if owner already responded to this review
    if (review.responses && review.responses.length > 0) {
      return res.status(400).json({ message: 'Vous avez déjà répondu à cet avis.' });
    }
    
    // Add response
    review.responses = review.responses || [];
    review.responses.push({
      owner: req.user.id,
      responseText: responseText.trim(),
      createdAt: new Date()
    });
    
    await property.save();
    
    // Populate the response with owner info
    await property.populate({
      path: 'reviews.responses.owner',
      select: 'firstName lastName'
    });
    
    const updatedReview = property.reviews.id(reviewId);
    
    res.json({
      message: 'Réponse ajoutée avec succès',
      review: updatedReview
    });
  } catch (err) {
    console.error('Respond to review error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout de la réponse.' });
  }
};

/**
 * Get property reviews
 * GET /api/properties/:id/reviews
 */
exports.getPropertyReviews = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate({
        path: 'reviews.user',
        select: 'firstName lastName'
      })
      .populate({
        path: 'reviews.responses.owner',
        select: 'firstName lastName'
      });
    
    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }
    
    res.json({
      reviews: property.reviews
    });
  } catch (err) {
    console.error('Get property reviews error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des avis.' });
  }
};

/**
 * Upload de documents pour une propriété
 * POST /api/properties/:id/documents
 */
exports.uploadDocuments = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Aucun document fourni.' });
    }

    console.log('Document files received:', req.files.length);
    
    const uploadPromises = req.files.map(file => {
      console.log('Uploading document file:', file.originalname);
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'raw', folder: 'kama/documents' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary document upload error:', error);
              reject(error);
            } else {
              console.log('Document upload successful:', result.secure_url);
              resolve(result);
            }
          }
        ).end(file.buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);
    console.log('Document upload results:', uploadResults.length);

    // Ajouter les documents à la propriété
    const newDocuments = uploadResults.map(result => ({
      url: result.secure_url,
      public_id: result.public_id
    }));

    console.log('New documents to add:', newDocuments);
    
    // Mettre à jour la propriété avec les nouveaux documents
    property.documents = [...property.documents, ...newDocuments];
    const updatedProperty = await property.save();
    
    console.log('Property documents after save:', updatedProperty.documents);

    // Recharger la propriété pour s'assurer que les documents sont correctement sauvegardées
    const savedProperty = await Property.findById(updatedProperty._id)
      .populate('owner', 'firstName lastName email whatsapp createdAt _id');
    
    console.log('Reloaded property with documents:', savedProperty.documents);

    res.json({
      message: 'Documents uploadés avec succès',
      documents: newDocuments,
      property: savedProperty
    });
  } catch (err) {
    console.error('Upload documents error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'upload des documents.' });
  }
};

/**
 * Boost a property
 * PUT /api/properties/:id/boost
 */
exports.boostProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    // Vérifier que l'utilisateur a un accès premium
    if (!req.user.isPremium) {
      return res.status(403).json({ message: 'La fonctionnalité de boost est réservée aux utilisateurs premium.' });
    }

    // Set boost expiration (7 days from now)
    const boostExpiry = new Date();
    boostExpiry.setDate(boostExpiry.getDate() + 7);

    property.boostedUntil = boostExpiry;
    await property.save();

    res.json({
      message: 'Propriété boostée avec succès',
      property
    });
  } catch (err) {
    console.error('Boost property error:', err);
    res.status(500).json({ message: 'Erreur serveur lors du boost de la propriété.' });
  }
};

/**
 * Report a property
 * POST /api/properties/:id/report
 */
exports.reportProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'La raison du signalement est requise.' });
    }

    // Add report to property
    property.reports = property.reports || [];
    property.reports.push({
      reportedBy: req.user.id,
      reason,
      createdAt: new Date()
    });

    await property.save();

    res.json({
      message: 'Propriété signalée avec succès'
    });
  } catch (err) {
    console.error('Report property error:', err);
    res.status(500).json({ message: 'Erreur serveur lors du signalement de la propriété.' });
  }
};

/**
 * Report a comment
 * POST /api/properties/:propertyId/comments/:commentId/report
 */
exports.reportComment = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    const comment = property.reviews.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé.' });
    }

    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'La raison du signalement est requise.' });
    }

    // Add report to comment
    comment.reports = comment.reports || [];
    comment.reports.push({
      reportedBy: req.user.id,
      reason,
      createdAt: new Date()
    });

    await property.save();

    res.json({
      message: 'Commentaire signalé avec succès'
    });
  } catch (err) {
    console.error('Report comment error:', err);
    res.status(500).json({ message: 'Erreur serveur lors du signalement du commentaire.' });
  }
};

/**
 * Delete a comment
 * DELETE /api/properties/:propertyId/comments/:commentId
 */
exports.deleteComment = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Propriété non trouvée.' });
    }

    const comment = property.reviews.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé.' });
    }

    // Remove the comment
    comment.remove();
    await property.save();

    res.json({
      message: 'Commentaire supprimé avec succès'
    });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du commentaire.' });
  }
};