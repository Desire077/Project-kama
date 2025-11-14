const request = require('supertest')
const app = require('../index')

describe('Auth refresh and logout', () => {
  let agent
  beforeAll(() => {
    agent = request.agent(app)
  })

  test('register sets refresh cookie and refresh endpoint returns new token', async () => {
    const email = `refresh+${Date.now()}@example.com`
    const password = 'Password123!'

    // Register (should set refresh cookie)
    const regRes = await agent.post('/api/auth/register').send({ firstName: 'Ref', lastName: 'Tester', email, password })
    expect(regRes.status).toBe(201)
    // Ensure Set-Cookie header present
    const setCookie = regRes.headers['set-cookie']
    expect(setCookie).toBeDefined()
    const hasRefresh = setCookie.some(c => c.startsWith('refreshToken='))
    expect(hasRefresh).toBe(true)

    // Call refresh using same agent (cookie persisted)
    const refreshRes = await agent.post('/api/auth/refresh').send()
    expect(refreshRes.status).toBe(200)
    expect(refreshRes.body).toHaveProperty('token')
    expect(refreshRes.body).toHaveProperty('user')
  })

  test('logout clears cookie and subsequent refresh fails', async () => {
    // Logout
    const out = await agent.post('/api/auth/logout').send()
    expect(out.status).toBe(200)

    // Now refresh should fail (no cookie / invalid)
    const refreshRes = await agent.post('/api/auth/refresh').send()
    expect([401, 500]).toContain(refreshRes.status)
  })
})
