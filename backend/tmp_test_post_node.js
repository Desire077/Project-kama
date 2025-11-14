const http = require('http')

const data = JSON.stringify({ firstName: 'AutoTest', email: `autotest+${Date.now()}@example.com`, password: 'secret123' })

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`)
  let body = ''
  res.on('data', (chunk) => body += chunk)
  res.on('end', () => {
    console.log('BODY:', body)
    process.exit(0)
  })
})

req.on('error', (e) => {
  console.error('request error', e)
  process.exit(1)
})

req.write(data)
req.end()
