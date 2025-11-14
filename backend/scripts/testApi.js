const http = require('http');

http.get('http://localhost:5000/api/properties', res => {
  console.log('status', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2).slice(0, 2000));
    } catch (e) {
      console.log('response text (not json):', data.slice(0, 2000));
    }
  });
}).on('error', err => {
  console.error('error', err.message);
});
