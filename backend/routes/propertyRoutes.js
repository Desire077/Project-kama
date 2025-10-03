const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
	createProperty,
	getProperties,
	getPropertyById,
	updateProperty,
	deleteProperty,
} = require('../controllers/propertyController');

const router = express.Router();

// Public: list and get by id
router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Protected: create/update/delete
router.post('/', protect, authorize('vendeur', 'admin'), createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);

module.exports = router;
