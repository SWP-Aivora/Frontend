const { GoogleGenAI } = require('@google/genai');
const github = require('@actions/github');
const core = require('@actions/core');

async function main() {
  try {
    // Get inputs
    const prNumber = core.getInput('pr-number');
    const repo = core.getInput('repo');
    const diffSummary = core.getInput('diff-summary');
    const fullDiff = core.getInput('full-diff');

    // Get environment variables
    const geminiApiKey = process.env.GEMINI_AI_KEY;
    const githubToken = process.env.GITHUB_TOKEN;

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    if (!githubToken) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }

    // Initialize Gemini AI
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey
    });

    // Prepare prompt for Gemini - concise review format with approval logic
    const prompt = `
You are an expert code reviewer and automation system. Review this pull request concisely and determine if it should be approved, need changes, or requires attention.

**PR Info:**
${diffSummary}

**Changes:**
\`\`\`diff
${fullDiff}
\`\`\`

Provide a review in this exact JSON format:
{
  "summary": "Brief 1-2 sentence overall assessment",
  "comments": [
    {
      "file": "filename.ts",
      "line": number,
      "severity": "error|warning|suggestion",
      "comment": "Specific, actionable feedback"
    }
  ],
  "priority": "high|medium|low",
  "verdict": "approve|request_changes|comment",
  "confidence": "high|medium|low",
  "blockingIssues": 0,
  "nonBlockingIssues": 0
}

Approval criteria:
- approve: No critical issues, minor optional changes only, follows best practices
- request_changes: Critical bugs, security issues, major architectural problems, or breaking changes
- comment: Optional suggestions, minor improvements, or non-blocking feedback

Track issues by severity:
- blockingIssues: count of "error" severity issues
- nonBlockingIssues: count of "warning" and "suggestion" issues

Be concise and direct. No more than 5-7 key findings total.
`;

    // Generate review using Gemini with retry logic
    console.log('Generating code review with Gemini AI...');
    let result;
    let responseText;
    let retryCount = 0;
    const maxRetries = 3;
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-8b'];

    while (retryCount < maxRetries) {
      try {
        const currentModel = models[retryCount % models.length];
        console.log(`Attempt ${retryCount + 1}: Using model ${currentModel}`);

        result = await ai.models.generateContent({
          model: currentModel,
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        });

        responseText = result.response.text();
        console.log('Successfully generated review');
        break;
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error.message);
        retryCount++;

        if (retryCount >= maxRetries) {
          throw new Error(`Failed after ${maxRetries} attempts. Last error: ${error.message}`);
        }

        // Wait longer between retries
        const waitTime = Math.pow(2, retryCount) * 1000; // 2, 4, 8 seconds
        console.log(`Waiting ${waitTime}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Parse the JSON response
    let reviewResult;
    try {
      // Extract JSON from response ( Gemini might add markdown formatting)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reviewResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from Gemini response');
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      // Fallback: create a simple review structure
      reviewResult = {
        summary: responseText,
        comments: []
      };
    }

    // Add GitHub-specific metadata
    reviewResult.metadata = {
      prNumber: prNumber,
      repo: repo,
      timestamp: new Date().toISOString(),
      model: result.model || 'gemini-3.5-flash',
      retries: retryCount
    };

    // Set outputs
    core.setOutput('review-result', JSON.stringify(reviewResult));
    process.env.REVIEW_RESULT = JSON.stringify(reviewResult);

    console.log('Code review completed successfully');
    console.log('Review summary:', reviewResult.summary);

  } catch (error) {
    console.error('Error in Gemini review action:', error);
    core.setFailed(error.message);
  }
}

main();