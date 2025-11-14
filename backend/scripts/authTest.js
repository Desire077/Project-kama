const http = require('http');

function request(path, method='GET', data=null, headers={}){
  return new Promise((resolve,reject)=>{
    const opts = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers
    };

    const req = http.request(opts, res => {
      let body = '';
      res.on('data', c=> body += c);
      res.on('end', ()=> resolve({ status: res.statusCode, body }));
    });
    req.on('error', e=> reject(e));
    if(data) req.write(JSON.stringify(data));
    req.end();
  });
}

(async ()=>{
  try{
    const email = `authtest+${Date.now()}@example.com`;
    const reg = await request('/api/auth/register', 'POST', { firstName: 'Auth', lastName: 'Test', email, password: 'Password123' }, { 'Content-Type':'application/json' });
    console.log('register', reg.status, reg.body.slice(0,200));
    const login = await request('/api/auth/login', 'POST', { email, password: 'Password123' }, { 'Content-Type':'application/json' });
    console.log('login', login.status, login.body.slice(0,200));
    const json = JSON.parse(login.body);
    const me = await request('/api/auth/me', 'GET', null, { 'Authorization': `Bearer ${json.token}` });
    console.log('me', me.status, me.body.slice(0,200));
  }catch(err){ console.error('err', err.message) }
})();
