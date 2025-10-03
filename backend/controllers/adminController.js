const User = require('../models/User');
const Property = require('../models/Property');

exports.getDashboardStats = async (req, res) => {
	try {
		const [usersCount, propertiesCount, pendingDocsCount] = await Promise.all([
			User.countDocuments({}),
			Property.countDocuments({}),
			User.countDocuments({ documentsStatus: 'pending' }),
		]);
		return res.json({ usersCount, propertiesCount, pendingDocsCount });
	} catch (err) {
		console.error('getDashboardStats error:', err);
		return res.status(500).json({ message: 'Erreur serveur.' });
	}
};

exports.listPendingDocuments = async (req, res) => {
	try {
		const users = await User.find({ documentsStatus: 'pending' }).select('-password');
		return res.json(users);
	} catch (err) {
		console.error('listPendingDocuments error:', err);
		return res.status(500).json({ message: 'Erreur serveur.' });
	}
};

exports.updateUserDocumentStatus = async (req, res) => {
	try {
		const { userId } = req.params;
		const { status } = req.body; // 'validated' | 'rejected'
		if (!['validated', 'rejected', 'pending', 'none'].includes(status)) {
			return res.status(400).json({ message: 'Statut invalide.' });
		}
		const user = await User.findByIdAndUpdate(
			userId,
			{ documentsStatus: status },
			{ new: true }
		).select('-password');
		if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
		return res.json(user);
	} catch (err) {
		console.error('updateUserDocumentStatus error:', err);
		return res.status(500).json({ message: 'Erreur serveur.' });
	}
};
