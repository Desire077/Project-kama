const axios = require('axios');

async function run(){
  try{
    const base = process.env.API_BASE || 'http://localhost:5000';
    // login vendor
    const loginRes = await axios.post(base + '/api/auth/login', { email: 'vendeur@example.com', password: 'VendeurPass123' }, { withCredentials: true });
    console.log('Login success, token length:', loginRes.data.token ? loginRes.data.token.length : 0);
    const token = loginRes.data.token;
    const res = await axios.get(base + '/api/properties/my-properties', { headers: { Authorization: `Bearer ${token}` } });
    console.log('My properties count:', res.data.length || res.data.properties?.length || res.data.length);
    console.log('Sample:', res.data[0] || res.data.properties?.[0]);
  }catch(e){
    console.error('Error', e.response ? e.response.data : e.message);
  }
}

run();
