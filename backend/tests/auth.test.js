const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

describe('Auth integration', () => {
  afterAll(async () => {
    // close mongoose connection
    await mongoose.disconnect();
  });

  test('register, login and get me', async () => {
    const email = `testint+${Date.now()}@example.com`;
    const password = 'Password123';

    // Register
    const regRes = await request(app).post('/api/auth/register').send({ firstName: 'Int', lastName: 'Test', email, password });
    expect([201,200]).toContain(regRes.status);
    expect(regRes.body).toHaveProperty('token');

    // Login
    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');

    const token = loginRes.body.token;

    // Me
    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body).toHaveProperty('email', email.toLowerCase());
  }, 20000);
});
