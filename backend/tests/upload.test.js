jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: (opts, cb) => {
        // Return a writable-like object with end(buffer)
        return {
          end: (buffer) => {
            // Simulate async upload callback
            cb(null, { secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/test.jpg', public_id: 'mocked_public_id' });
          }
        };
      }
    }
  }
}));

const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

describe('Upload images integration', () => {
  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('POST /api/properties/:id/images uploads images (mocked Cloudinary)', async () => {
    // Register user
    const email = `uploadtest+${Date.now()}@example.com`;
    const password = 'Password123';
    const reg = await request(app).post('/api/auth/register').send({ firstName: 'Up', lastName: 'Test', email, password });
    expect([201,200]).toContain(reg.status);
    const token = reg.body.token || (await request(app).post('/api/auth/login').send({ email, password })).body.token;

    // Create property
    const createRes = await request(app).post('/api/properties')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To upload', type: 'maison', price: 10, surface: 20, address: { city: 'X', street: 'Y' } });
    expect([201,200]).toContain(createRes.status);
    const propId = createRes.body.property ? createRes.body.property._id : createRes.body._id;

    // Prepare a tiny PNG buffer (1x1)
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
    const imgBuf = Buffer.from(base64, 'base64');

    // Upload
    const uploadRes = await request(app)
      .post(`/api/properties/${propId}/images`)
      .set('Authorization', `Bearer ${token}`)
      .attach('images', imgBuf, 'test.png');

    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body).toHaveProperty('images');
    expect(Array.isArray(uploadRes.body.images)).toBe(true);
    expect(uploadRes.body.images[0]).toHaveProperty('url');
  }, 20000);
});
