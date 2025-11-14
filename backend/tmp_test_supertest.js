const request = require('supertest')
const app = require('./index')

(async ()=>{
  try{
    const payload = { firstName: 'STest', email: `stest+${Date.now()}@example.com`, password: 'secret123' }
    const res = await request(app).post('/api/auth/register').send(payload).set('Accept','application/json')
    console.log('STATUS', res.status)
    console.log('BODY', res.body)
    process.exit(0)
  }catch(e){
    console.error('TEST ERROR', e && e.stack ? e.stack : e)
    process.exit(1)
  }
})()
