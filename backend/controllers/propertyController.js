const Property = require('../models/Property');

// Create property (owner = req.user.id)
exports.createProperty = async (req, res) => {
	try {
		const propertyData = { ...req.body, owner: req.user.id };
		const property = await Property.create(propertyData);
		return res.status(201).json(property);
	} catch (err) {
		console.error('createProperty error:', err);
		return res.status(500).json({ message: 'Erreur serveur.' });
	}
};

// List properties (basic filters)
exports.getProperties = async (req, res) => {
	try {
		const { type, city, status } = req.query;
		const query = {};
		if (type) query.type = type;
		if (status) query.status = status;
		if (city) query['address.city'] = city;
		const properties = await Property.find(query).sort({ createdAt: -1 });
		return res.json(properties);
	} catch (err) {
		console.error('getProperties error:', err);
		return res.status(500).json({ message: 'Erreur serveur.' });
	}
};

// Get one property
exports.getPropertyById = async (req, res) => {
	try {
		const property = await Property.findById(req.params.id).populate('owner', '-password');
		if (!property) return res.status(404).json({ message: 'Bien introuvable.' });
		return res.json(property);
	} catch (err) {
		console.error('getPropertyById error:', err);
		return res.status(500).json({ message: 'Erreur serveur.' });
	}
};

// Update property (only owner or admin)
exports.updateProperty = async (req, res) => {
	try {
		const property = await Property.findById(req.params.id);
		if (!property) return res.status(404).json({ message: 'Bien introuvable.' });
		const isOwner = property.owner.toString() === req.user.id;
		const isAdmin = req.user.role === 'admin';
		if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Accès interdit.' });
		Object.assign(property, req.body);
		await property.save();
		return res.json(property);
	} catch (err) {
		console.error('updateProperty error:', err);
		return res.status(500).json({ message: 'Erreur serveur.' });
	}
};

// Delete property (only owner or admin)
exports.deleteProperty = async (req, res) => {
	try {
		const property = await Property.findById(req.params.id);
		if (!property) return res.status(404).json({ message: 'Bien introuvable.' });
		const isOwner = property.owner.toString() === req.user.id;
		const isAdmin = req.user.role === 'admin';
		if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Accès interdit.' });
		await property.deleteOne();
		return res.json({ message: 'Bien supprimé.' });
	} catch (err) {
		console.error('deleteProperty error:', err);
		return res.status(500).json({ message: 'Erreur serveur.' });
	}
};
