const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
	getDashboardStats,
	listPendingDocuments,
	updateUserDocumentStatus,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/documents/pending', listPendingDocuments);
router.patch('/documents/:userId/status', updateUserDocumentStatus);

module.exports = router;
