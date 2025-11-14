const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Property = require('../models/Property');

const MONGO_URI = process.env.MONGO_URI;

async function main(){
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo for seeding');

  // Create test user
  const usersToCreate = [
    { role: 'client', firstName: 'Client', lastName: 'User', email: 'client@example.com', password: 'ClientPass123' },
    { role: 'vendeur', firstName: 'Vendeur', lastName: 'User', email: 'vendeur@example.com', password: 'VendeurPass123' },
    { role: 'admin', firstName: 'Admin', lastName: 'Me', email: 'admin@example.com', password: 'AdminPass123' },
    // Required admin user
    { role: 'admin', firstName: 'Japhet', lastName: 'Desire', email: 'votrepostulateur@gmail.com', password: 'Japhetdesire@2008' }
  ];

  for (const u of usersToCreate) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`User already exists: ${u.email} (id: ${existing._id})`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    const created = await User.create({ role: u.role, firstName: u.firstName, lastName: u.lastName, email: u.email, password: hashed });
    console.log(`Created user ${u.email} (id: ${created._id}) with password: ${u.password}`);
  }

  // Find an owner for properties (prefer vendeur, fallback to client)
  let owner = await User.findOne({ email: 'vendeur@example.com' });
  if (!owner) owner = await User.findOne({ email: 'client@example.com' });
  if (owner) {
    const existingP1 = await Property.findOne({ title: 'Maison cosy', owner: owner._id });
    const existingP2 = await Property.findOne({ title: 'Appartement moderne', owner: owner._id });
    let p1 = existingP1;
    let p2 = existingP2;
    if (!existingP1) {
      p1 = await Property.create({ owner: owner._id, title: 'Maison cosy', description: 'Belle maison', type: 'maison', price: 100000, surface: 120, address: { city: 'Douala', street: 'Rue A' }, status: 'online' });
      console.log('Created property', p1._id);
    } else {
      console.log('Property already exists', existingP1._id);
    }
    if (!existingP2) {
      p2 = await Property.create({ owner: owner._id, title: 'Appartement moderne', description: 'Appartement au centre', type: 'location', price: 500, surface: 60, address: { city: 'Yaounde', street: 'Rue B' }, status: 'online' });
      console.log('Created property', p2._id);
    } else {
      console.log('Property already exists', existingP2._id);
    }
  } else {
    console.log('No owner found to attach properties to. Skipping property creation.');
  }
  await mongoose.disconnect();
  console.log('Seeding finished');
}

main().catch(err=>{ console.error(err); process.exit(1); });
