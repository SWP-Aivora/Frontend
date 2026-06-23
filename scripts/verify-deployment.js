// scripts/verify-deployment.js
const { Octokit } = require('@octokit/rest');

async function verifyDeployment() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  const repo = 'SWP-Aivora/Frontend';
  const prNumber = 31; // Update with actual PR number

  try {
    // Get PR details
    const { data: pr } = await octokit.rest.pulls.get({
      owner: 'SWP-Aivora',
      repo: 'Frontend',
      pull_number: prNumber
    });

    console.log('PR State:', pr.state);
    console.log('PR Title:', pr.title);

    // Get review comments
    const { data: comments } = await octokit.rest.pulls.listComments({
      owner: 'SWP-Aivora',
      repo: 'Frontend',
      pull_number: prNumber
    });

    console.log('Total Comments:', comments.length);

    // Get workflow runs
    const { data: runs } = await octokit.rest.actions.listWorkflowRuns({
      owner: 'SWP-Aivora',
      repo: 'Frontend',
      workflow_id: 'gemini-review.yml',
      per_page: 5
    });

    console.log('Recent Workflow Runs:', runs.total_count);

    // Analyze results
    const hasComments = comments.length > 0;
    const hasRecentRun = runs.total_count > 0;

    console.log('\n=== Verification Results ===');
    console.log('✅ Comments Posted:', hasComments);
    console.log('✅ Workflow Executed:', hasRecentRun);

    if (hasComments) {
      console.log('\nReview Comments:');
      comments.forEach(comment => {
        console.log(`- ${comment.path}:${comment.line} - ${comment.body.substring(0, 100)}...`);
      });
    }

  } catch (error) {
    console.error('Verification failed:', error.message);
  }
}

verifyDeployment();