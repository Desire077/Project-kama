const request = require('supertest');

// Mock nodemailer to avoid sending real emails. Must be set before the controller is required.
jest.mock('nodemailer');
const nodemailer = require('nodemailer');
const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'mocked-id' });
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

const app = require('../index');

describe('Email endpoints', () => {
  let token;

  beforeAll(async () => {
    // Register a user and get token
    const email = `emailtest+${Date.now()}@example.com`;
    const password = 'Password123!';
    const regRes = await request(app).post('/api/auth/register').send({
      firstName: 'Email',
      lastName: 'Tester',
      email,
      password
    });

    token = regRes.body.token || (await request(app).post('/api/auth/login').send({ email, password })).body.token;
  });

  test('POST /api/email/welcome should send welcome email (protected)', async () => {
    const res = await request(app)
      .post('/api/email/welcome')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'recipient@example.com', firstName: 'Recipient' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    // Ensure transporter was created and sendMail was called
    expect(nodemailer.createTransport).toHaveBeenCalled();
    const transport = nodemailer.createTransport.mock.results[0].value;
    expect(transport.sendMail).toHaveBeenCalled();
  });

  test('POST /api/email/inquiry should send inquiry email (protected)', async () => {
    const res = await request(app)
      .post('/api/email/inquiry')
      .set('Authorization', `Bearer ${token}`)
      .send({ propertyId: 'prop123', message: 'Je suis intéressé', contactInfo: '06........' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    const transport = nodemailer.createTransport.mock.results[0].value;
    expect(transport.sendMail).toHaveBeenCalled();
  });

  test('POST /api/email/reset-password should send reset email (public)', async () => {
    const res = await request(app)
      .post('/api/email/reset-password')
      .send({ email: 'recipient@example.com', resetToken: 'resettoken123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    const transport = nodemailer.createTransport.mock.results[0].value;
    expect(transport.sendMail).toHaveBeenCalled();
  });
});
