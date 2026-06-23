const { GoogleGenAI } = require('@google/genai');
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

    // Prepare prompt for Gemini - focus on PR code changes
    const prompt = `
You are an expert code reviewer reviewing a REAL pull request. Analyze ONLY the code changes shown in the diff below. Do not mention the action script itself.

**PR Context:**
- Repository: ${repo}
- PR Number: ${prNumber}
- ${diffSummary}

**CODE CHANGES TO REVIEW:**
\`\`\`diff
${fullDiff}
\`\`\`

INSTRUCTIONS:
1. Review ONLY the code changes in the diff above
2. Ignore any references to GitHub Actions, workflow files, or review scripts
3. Focus on the actual application code being changed
4. Provide feedback that helps improve the actual business logic

REQUIREMENTS:
- Analyze TypeScript, React, API calls, error handling, and business logic
- Check for bugs, security issues, performance problems, or anti-patterns
- Suggest improvements for code quality and maintainability
- Focus on the application functionality, not the CI/CD setup

Provide review in this exact JSON format:
{
  "summary": "Brief 1-2 sentence assessment of the CODE CHANGES ONLY",
  "comments": [
    {
      "file": "src/Component.tsx",
      "line": 45,
      "severity": "error|warning|suggestion",
      "comment": "Specific feedback about the actual code change"
    }
  ],
  "priority": "high|medium|low",
  "verdict": "approve|request_changes|comment",
  "confidence": "high|medium|low",
  "blockingIssues": 0,
  "nonBlockingIssues": 0
}

CRITERIA:
- approve: No critical issues in the application code, minor optional changes only
- request_changes: Critical bugs, security vulnerabilities, major logic errors
- comment: Good improvements, suggestions, or non-blocking feedback

MAX 5-7 comments total. Focus on actual application code, not CI/CD.
`;

    // Generate review using Gemini with retry logic
    console.log('Generating code review with Gemini AI...');
    let result;
    let responseText;
    let retryCount = 0;
    const maxRetries = 3;
    const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-2.5-flash'];

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

        try {
          responseText = result.response?.text();
          if (!responseText) {
            throw new Error('Response text is undefined');
          }
          console.log('Successfully generated review');
          break;
        } catch (textError) {
          console.error('Error parsing response text:', textError.message);
          throw textError;
        }
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error.message);

        // Handle high demand (503) with exponential backoff
        if (error.message.includes('503') || error.message.includes('high demand')) {
          if (retryCount >= maxRetries) {
            throw new Error(`High demand on all models. Please try again later.`);
          }
          // Wait longer for high demand errors
          const waitTime = Math.pow(2, retryCount) * 5000; // 10, 20, 40 seconds
          console.log(`High demand detected. Waiting ${waitTime}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else if (retryCount >= maxRetries) {
          throw new Error(`Failed after ${maxRetries} attempts. Last error: ${error.message}`);
        } else {
          // Wait longer between retries
          const waitTime = Math.pow(2, retryCount) * 1000; // 2, 4, 8 seconds
          console.log(`Waiting ${waitTime}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        retryCount++;
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
    core.setOutput('review-result', JSON.stringify(reviewResult, null, 2));
    process.env.REVIEW_RESULT = JSON.stringify(reviewResult, null, 2);

    console.log('Code review completed successfully');
    console.log('Review summary:', reviewResult.summary);

  } catch (error) {
    console.error('Error in Gemini review action:', error);
    core.setFailed(error.message);
  }
}

main();