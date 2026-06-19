const https = require('https');

https.get('https://api.github.com/repos/SWP-Aivora/Frontend/actions/runs?branch=refactor-proposals-api-integration', {
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const runs = JSON.parse(data).workflow_runs;
    if (!runs || runs.length === 0) return console.log('No runs found');
    const run = runs[0];
    console.log('Latest Run conclusion:', run.conclusion);
    console.log('Latest Run jobs_url:', run.jobs_url);
    
    https.get(run.jobs_url, { headers: { 'User-Agent': 'Node.js' } }, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        const jobs = JSON.parse(data2).jobs;
        const failedJob = jobs.find(j => j.conclusion === 'failure');
        if (failedJob) {
          console.log('Failed Job Name:', failedJob.name);
          console.log('Failed Job ID:', failedJob.id);
          
          https.get(`https://api.github.com/repos/SWP-Aivora/Frontend/actions/jobs/${failedJob.id}/logs`, { headers: { 'User-Agent': 'Node.js' } }, (res3) => {
             // Since it redirects to download, we need to handle redirect
             if (res3.statusCode === 302) {
               https.get(res3.headers.location, (res4) => {
                  let logData = '';
                  res4.on('data', chunk => logData += chunk);
                  res4.on('end', () => {
                    console.log('==== LOG ====');
                    console.log(logData.substring(logData.length - 2000));
                  });
               });
             } else {
               let logData = '';
               res3.on('data', chunk => logData += chunk);
               res3.on('end', () => {
                 console.log('==== LOG ====');
                 console.log(logData.substring(logData.length - 2000));
               });
             }
          });
        } else {
          console.log('No failed job found. (Maybe success or running)');
          jobs.forEach(j => console.log(j.name, j.status, j.conclusion));
        }
      });
    });
  });
});
