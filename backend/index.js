// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');
const connectDB = require('./config/db');
const paymentController = require('./controllers/paymentController');

// Routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('.//routes/propertyRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const emailRoutes = require('./routes/emailRoutes');

const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + req.params.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers image sont autorisés'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middlewares
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS sécurisé : n'autoriser qu'une origine explicite
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
// Stripe webhook needs the raw body — mount the webhook route BEFORE the JSON body parser
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Connect to database
connectDB();

// API routes
app.get('/api', (req, res) => res.json({ message: 'Kama API running' }));
// Simple healthcheck endpoint for monitoring / uptime checks
app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
  })
);
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
// Add upload middleware to user routes for avatar uploads
app.use('/api/users', (req, res, next) => {
  // Only apply upload middleware to avatar routes
  if (req.path.endsWith('/avatar') && (req.method === 'PUT' || req.method === 'POST')) {
    upload.single('avatar')(req, res, next);
  } else {
    next();
  }
}, userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/email', emailRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Route API non trouvée' });
});

// Serve frontend static files from project root (one level above backend) ONLY in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..');
  app.use(express.static(frontendPath));

  // Root -> serve the main page (kama.html exists in project root)
  app.get('/', (req, res) => res.sendFile(path.join(frontendPath, 'kama.html')));

  // Fallback: if request is not API and not a static file, serve kama.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'Route non trouvée' });

    // let express.static handle existing files; otherwise return main page
    res.sendFile(path.join(frontendPath, req.path), function (err) {
      if (err) {
        res.sendFile(path.join(frontendPath, 'kama.html'));
      }
    });
  });
}

// Error handler
app.use(errorHandler);

// Debug route - returns basic info to help troubleshooting (only in non-production)
app.get('/api/debug', (req, res) => {
	if (process.env.NODE_ENV === 'production') return res.status(404).end();
	return res.json({ ok: true, env: process.env.NODE_ENV || 'development', frontend: FRONTEND_URL });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;