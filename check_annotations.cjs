const https = require('https');

https.get('https://api.github.com/repos/SWP-Aivora/Frontend/commits/refactor-proposals-api-integration/check-runs', {
  headers: { 'User-Agent': 'Node.js', 'Accept': 'application/vnd.github.v3+json' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (!json.check_runs) return console.log(data);
    json.check_runs.forEach(r => {
      console.log('Check:', r.name, '| Conclusion:', r.conclusion);
      if (r.output && r.output.annotations_count > 0) {
        console.log('Annotations URL:', r.output.annotations_url);
        https.get(r.output.annotations_url, { headers: { 'User-Agent': 'Node.js', 'Accept': 'application/vnd.github.v3+json' } }, (res2) => {
          let data2 = '';
          res2.on('data', chunk => data2 += chunk);
          res2.on('end', () => {
            console.log('Annotations:', data2);
          });
        });
      }
    });
  });
});
