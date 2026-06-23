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

    // Generate review using Gemini
    console.log('Generating code review with Gemini AI...');
    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });

    const responseText = result.response.text();

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
      model: 'gemini-3.5-flash'
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