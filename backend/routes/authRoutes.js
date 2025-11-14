// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { register, login, getMe, adminLogin } = require('../controllers/authController');
const { refresh, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Simple rate limiter for auth endpoints
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: 'Trop de requêtes, réessayez plus tard.' });

// Validation result middleware
const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	next();
};

// POST /api/auth/register
router.post(
	'/register',
	authLimiter,
	body('firstName').notEmpty().withMessage('Prénom requis'),
	body('email').isEmail().withMessage('Email invalide'),
	body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court'),
	validate,
	register
);

// POST /api/auth/login
router.post(
	'/login',
	authLimiter,
	body('email').isEmail().withMessage('Email invalide'),
	body('password').notEmpty().withMessage('Mot de passe requis'),
	validate,
	login
);

// GET /api/auth/me (protégé)
router.get('/me', protect, getMe);

// POST /api/auth/refresh - exchange refresh token cookie for new access token
router.post('/refresh', refresh);

// POST /api/auth/admin/login
router.post(
  '/admin/login',
  authLimiter,
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
  validate,
  adminLogin
);

// POST /api/auth/logout - clear refresh token
router.post('/logout', logout);

module.exports = router;
