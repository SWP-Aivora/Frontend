const https = require('https');

https.get('https://api.github.com/repos/SWP-Aivora/Frontend/actions/runs?branch=refactor-proposals-api-integration', {
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const runs = JSON.parse(data).workflow_runs;
    if (!runs || runs.length === 0) return console.log('No runs found');
    runs.slice(0, 3).forEach(r => console.log('Run:', r.id, '| Status:', r.status, '| Conclusion:', r.conclusion, '| Updated At:', r.updated_at));
  });
});
