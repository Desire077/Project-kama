// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Génère un token JWT (payload minimal).
 * - id : _id de Mongo
 * - role : role utilisateur (client|vendeur|admin)
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' } // valable 24h ; adapter si besoin
  );
};

/**
 * Register
 * Body attendu : { firstName, lastName, email, password, role?, whatsapp?, dateOfBirth?, ownerName? }
 */
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'client', whatsapp, dateOfBirth, ownerName } = req.body;

    // validations de base (à renforcer avec express-validator / zod)
    if (!firstName || !email || !password) {
      return res.status(400).json({ message: 'Prénom, email et mot de passe sont requis.' });
    }

    // Normaliser l'email puis vérifier s'il existe déjà
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ message: 'Adresse e-mail déjà utilisée.' });

    // Hash du mot de passe (bcrypt, saltRounds = 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Création de l'utilisateur
    const user = await User.create({
      role,
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,
      whatsapp,
      dateOfBirth,
      ownerName
    });

    // Générer token JWT
    const token = generateToken(user);

    // Ne jamais renvoyer le mot de passe
    const safeUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      documentsStatus: user.documentsStatus
    };

    return res.status(201).json({ token, user: safeUser });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.' });
  }
};

/**
 * Login
 * Body attendu : { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe obligatoires.' });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'Utilisateur non trouvé.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect.' });

    const token = generateToken(user);

    const safeUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      documentsStatus: user.documentsStatus
    };

    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
  }
};

/**
 * getMe - route protégée pour récupérer les infos du user connecté
 * (token fourni dans Authorization: Bearer <token>)
 */
exports.getMe = async (req, res) => {
  try {
    // req.user est attaché par le middleware protect (middleware/authMiddleware.js)
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    return res.json(user);
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};
