const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js', 'Accept': 'application/vnd.github.v3+json' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const prs = await get('https://api.github.com/repos/SWP-Aivora/Frontend/pulls?state=open');
  if (prs && Array.isArray(prs)) {
    prs.forEach(pr => {
      console.log(`PR #${pr.number}: ${pr.title} (Head: ${pr.head.label})`);
    });
  } else {
    console.log('Response:', prs);
  }
}
run();
