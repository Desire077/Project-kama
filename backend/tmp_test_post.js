const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

(async ()=>{
  try{
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'TmpTest', email: 'tmp+test@example.com', password: 'secret123' })
    });
    console.log('status', res.status);
    const text = await res.text();
    console.log('body', text);
  }catch(e){
    console.error('request error', e);
  }
})();
