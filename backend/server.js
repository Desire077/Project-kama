// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// routes (on créera ces fichiers plus tard)
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// middlewares
app.use(cors({ origin: 'https://ton-front.com' }));
app.use(express.json({ limit: '10mb' }));

// connect DB
connectDB();

app.get('/', (req, res) => res.send('Project-kama API running'));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
