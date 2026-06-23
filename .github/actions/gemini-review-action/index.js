const { GoogleGenAI } = require('@google/genai');
const core = require('@actions/core');

// Helper function to create fallback review from text response
function createFallbackReview(responseText) {
  const lines = responseText.split('\n');
  const comments = [];
  let summary = 'AI review completed. See comments below.';

  // Extract comments from text format
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().includes('error') ||
        line.toLowerCase().includes('warning') ||
        line.toLowerCase().includes('suggestion') ||
        line.toLowerCase().includes('issue') ||
        line.toLowerCase().includes('problem')) {

      const severity = line.toLowerCase().includes('error') ? 'error' :
                       line.toLowerCase().includes('warning') ? 'warning' : 'suggestion';

      // Extract file and line if available
      const fileMatch = line.match(/([^:]+):(\d+)/);
      const file = fileMatch ? fileMatch[1] : 'unknown';
      const lineNum = fileMatch ? parseInt(fileMatch[2]) : 1;

      comments.push({
        file: file,
        line: lineNum,
        severity: severity,
        comment: line
      });
    }
  }

  return {
    summary: summary,
    comments: comments,
    priority: 'medium',
    verdict: 'comment',
    confidence: 'medium',
    blockingIssues: comments.filter(c => c.severity === 'error').length,
    nonBlockingIssues: comments.filter(c => c.severity === 'warning' || c.severity === 'suggestion').length
  };
}

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

    // Parse the JSON response with enhanced fallback strategies
    let reviewResult;
    console.log('=== Gemini Review Debug Info ===');
    console.log('Response text length:', responseText?.length || 0);
    console.log('Response preview:', responseText?.substring(0, 200) + '...');

    try {
      // Strategy 1: Direct JSON parsing
      reviewResult = JSON.parse(responseText);
      console.log('Direct JSON parsing successful');
    } catch (e1) {
      console.log('Direct JSON parse failed, trying extraction...');
      try {
        // Strategy 2: Extract JSON from markdown
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          reviewResult = JSON.parse(jsonMatch[0]);
          console.log('JSON extraction successful');
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e2) {
        console.log('JSON extraction failed, creating fallback response...');
        // Strategy 3: Create structured response from text
        reviewResult = createFallbackReview(responseText);
        console.log('Fallback response created');
      }
    }

    // Validate and normalize review result
    if (!reviewResult) {
      throw new Error('Failed to create valid review result');
    }

    // Ensure required fields exist
    if (!reviewResult.summary) {
      reviewResult.summary = 'AI review completed. Analysis available in comments.';
    }

    if (!reviewResult.comments) {
      reviewResult.comments = [];
    }

    if (!reviewResult.priority) {
      reviewResult.priority = 'medium';
    }

    if (!reviewResult.verdict) {
      reviewResult.verdict = 'comment';
    }

    if (!reviewResult.confidence) {
      reviewResult.confidence = 'medium';
    }

    if (typeof reviewResult.blockingIssues !== 'number') {
      reviewResult.blockingIssues = 0;
    }

    if (typeof reviewResult.nonBlockingIssues !== 'number') {
      reviewResult.nonBlockingIssues = 0;
    }

    console.log('Final review result:', JSON.stringify(reviewResult, null, 2));

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