import { AgentBase } from '../utils/agent-base.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class BugHunterAgent extends AgentBase {
  constructor() {
    super('bug-hunter');
  }

  getPrompt(context) {
    return `
You are a Senior Debugging Expert finding logic errors in the PR changes.

## Project Guidelines (from GEMINI.md)
${context.security || ''}
${context.architecture || ''}
${context.typescript || ''}

## Focus Areas
1. Null/undefined risks in new code
2. Race conditions in async operations
3. Infinite loops in new logic
4. Missing error handling
5. Edge cases not handled
6. React state management issues
7. useEffect dependency problems

## Confidence Scoring
- 0: False positive, doesn't hold up under scrutiny
- 25: Might be real, could also be false positive
- 50: Real but minor, nitpick
- 75: Verified real and important
- 100: Absolutely certain, will cause problems

## What NOT to flag
- Pre-existing issues not introduced in this PR
- Linter/typechecker issues
- Pedantic nitpicks
- Issues on lines the author did not modify

## Output Format
Respond with ONLY valid JSON:
[
  {
    "file": "path/to/file.tsx",
    "line": 42,
    "description": "Brief description of the bug",
    "confidence": 85,
    "suggestion": "How to fix it (optional)"
  }
]

If no issues found, return: {"issues": []}`;
  }

  getCategory() {
    return 'bug';
  }

  async analyzeWithAI(prompt, diff) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_KEY);
    const model = genAI.getGenerativeModel({ model: this.model });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt + "\n\n## Diff\n" + diff }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      }
    });

    const response = await result.response;
    const text = response.text();

    try {
      const parsed = JSON.parse(text);
      // Ensure the response is in the expected format
      if (parsed.issues && Array.isArray(parsed.issues)) {
        return parsed.issues;
      } else if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (error) {
      console.warn('Failed to parse Bug Hunter response as JSON:', error.message);
      console.log('Raw response:', text);
      return [];
    }
  }
}