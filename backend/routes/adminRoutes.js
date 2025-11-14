// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { isAdmin } = require('../middlewares/adminMiddleware');

// Import controllers
const {
  getPendingListings,
  approveListing,
  rejectListing,
  getAllUsers,
  getAllProperties,
  deleteProperty,
  banUser,
  unbanUser,
  deleteUser,
  getReportedProperties,
  getReportedComments,
  getStatistics
} = require('../controllers/adminController');

// Simple rate limiter for admin endpoints
const adminLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: 'Trop de requêtes, réessayez plus tard.' 
});

// Validation result middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// All admin routes require authentication and admin role
router.use(adminLimiter);
router.use(isAdmin);

// GET /api/admin/listings/pending - Lister toutes les annonces en attente
router.get('/listings/pending', getPendingListings);

// PUT /api/admin/listings/approve/:id - Valider une annonce
router.put('/listings/approve/:id', 
  body('notificationMessage').optional().isString(),
  validate,
  approveListing
);

// PUT /api/admin/listings/reject/:id - Rejeter une annonce
router.put('/listings/reject/:id', 
  body('reason').optional().isString(),
  validate,
  rejectListing
);

// GET /api/admin/users/list - Liste des utilisateurs
router.get('/users/list', getAllUsers);

// GET /api/admin/properties - Liste de toutes les propriétés
router.get('/properties', getAllProperties);

// DELETE /api/admin/properties/:id - Supprimer une propriété
router.delete('/properties/:id', deleteProperty);

// PUT /api/admin/users/:id/ban - Bannir un utilisateur
router.put('/users/:id/ban', banUser);

// PUT /api/admin/users/:id/unban - Débannir un utilisateur
router.put('/users/:id/unban', unbanUser);

// DELETE /api/admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', deleteUser);

// GET /api/admin/reports/properties - Liste des propriétés signalées
router.get('/reports/properties', getReportedProperties);

// GET /api/admin/reports/comments - Liste des commentaires signalés
router.get('/reports/comments', getReportedComments);

// GET /api/admin/statistics - Statistiques de la plateforme
router.get('/statistics', getStatistics);

// PUT /api/admin/properties/:id/validate - Valider/rejeter une propriété
router.put('/properties/:id/validate', 
  body('status').isString().isIn(['pending', 'approved', 'rejected', 'online']),
  body('reason').optional().isString(),
  validate,
  async (req, res) => {
    const { status, reason } = req.body;
    if (status === 'approved' || status === 'online') {
      return approveListing(req, res);
    } else {
      req.body.reason = reason;
      return rejectListing(req, res);
    }
  }
);

module.exports = router;