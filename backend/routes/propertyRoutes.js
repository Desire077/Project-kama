// routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  uploadImages,
  uploadDocuments,
  getMyProperties,
  getPropertiesByUser,
  getPropertyContact,
  removeImage,
  addReview,
  respondToReview,
  getPropertyReviews,
  boostProperty,
  reportProperty,
  reportComment,
  deleteComment
} = require('../controllers/propertyController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/fileUpload');
const { canBoostProperty } = require('../middlewares/premiumMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');

// Routes publiques
router.get('/', getProperties);
router.get('/user/:userId', getPropertiesByUser);
// Place the protected specific route BEFORE parameterized ':id' to avoid shadowing
router.get('/my-properties', protect, getMyProperties);
router.get('/:id/reviews', getPropertyReviews); // Add this new route
router.get('/:id/contact', getPropertyContact); // This should be public for contacting sellers
router.get('/:id', protect, getPropertyById); // Consultation d'une offre réservée aux utilisateurs authentifiés

// Routes protégées
router.use(protect); // Toutes les routes suivantes nécessitent une authentification

// IMPORTANT: Order matters! Specific routes must come before parameterized routes
// (Route déplacée en public : consultation des offres est publique)
router.post('/', createProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);
router.post('/:id/images', upload.array('images', 10), uploadImages);
router.post('/:id/documents', upload.array('documents', 5), uploadDocuments);
router.delete('/:id/images/:publicId', removeImage);
// Add new review routes
router.post('/:id/reviews', addReview);
router.post('/:id/reviews/:reviewId/responses', respondToReview);

// Boost property route (premium feature)
router.put('/:id/boost', canBoostProperty, boostProperty);

// Report property route
router.post('/:id/report', reportProperty);

// Report comment route
router.post('/:propertyId/comments/:commentId/report', reportComment);

// Delete comment route (admin only)
router.delete('/:propertyId/comments/:commentId', isAdmin, deleteComment);

module.exports = router;