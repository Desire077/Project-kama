// scripts/testAdminRoutes.js
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function testAdminRoutes() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo for testing admin routes');

  // Test admin user
  const adminUser = await User.findOne({ email: 'votrepostulateur@gmail.com', role: 'admin' });
  
  if (adminUser) {
    console.log('Admin user found:');
    console.log('- ID:', adminUser._id);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: adminUser._id, role: adminUser.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('- Generated token:', token.substring(0, 20) + '...');
    
    console.log('\\nAdmin endpoints available:');
    console.log('- GET /api/admin/listings/pending');
    console.log('- PUT /api/admin/listings/approve/:id');
    console.log('- PUT /api/admin/listings/reject/:id');
    console.log('- GET /api/admin/users/list');
    console.log('- GET /api/admin/properties');
    console.log('- DELETE /api/admin/properties/:id');
    console.log('- PUT /api/admin/users/:id/ban');
    console.log('- PUT /api/admin/users/:id/unban');
    console.log('- DELETE /api/admin/users/:id');
    console.log('- GET /api/admin/reports/properties');
    console.log('- GET /api/admin/reports/comments');
    console.log('- GET /api/admin/statistics');
    console.log('- PUT /api/admin/properties/:id/validate');
    
  } else {
    console.log('Admin user not found');
  }

  await mongoose.disconnect();
  console.log('Admin routes test finished');
}

testAdminRoutes().catch(err => { 
  console.error(err); 
  process.exit(1); 
});