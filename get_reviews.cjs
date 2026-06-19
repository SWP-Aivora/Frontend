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
  try {
    const prs = await get('https://api.github.com/repos/SWP-Aivora/Frontend/pulls?state=open&head=SWP-Aivora:refactor-proposals-api-integration');
    if (!prs || prs.length === 0) {
      return console.log('No open PR found for this branch.');
    }
    const pr = prs[0];
    console.log(`Found PR #${pr.number}: ${pr.title}`);
    
    const reviews = await get(`https://api.github.com/repos/SWP-Aivora/Frontend/pulls/${pr.number}/reviews`);
    
    console.log('\n--- LATEST REVIEWS ---');
    if (reviews && reviews.length > 0) {
        const latestReview = reviews[reviews.length - 1];
        console.log(`[${latestReview.state}] ${latestReview.user.login}:\n${latestReview.body}`);
    } else {
        console.log('No reviews found.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
