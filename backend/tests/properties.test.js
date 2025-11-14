const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const Property = require('../models/Property');

describe('Properties integration', () => {
  let propId;

  beforeAll(async () => {
    // ensure DB connected
    await new Promise(resolve => setTimeout(resolve, 500));
    // take one property from DB
    const p = await Property.findOne();
    if (p) propId = p._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('GET /api/properties returns list', async () => {
    const res = await request(app).get('/api/properties');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('properties');
    expect(Array.isArray(res.body.properties)).toBe(true);
  });

  test('GET /api/properties/:id returns property', async () => {
    if (!propId) return console.warn('No property found to test detail');
    const res = await request(app).get(`/api/properties/${propId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body._id).toBe(propId);
  });
});
