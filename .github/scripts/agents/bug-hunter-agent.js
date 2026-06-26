import { AgentBase } from '../utils/agent-base.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class BugHunterAgent extends AgentBase {
  constructor() {
    super('bug-hunter');
  }

  getPrompt() {
    return `
You are a Senior Debugging Expert finding logic errors in the PR changes.

## Focus Areas
1. Null/undefined risks in new code
2. Race conditions in async operations
3. Infinite loops in new logic
4. Missing error handling
5. Edge cases not handled

## What NOT to flag
- Pre-existing issues
- Linter/typechecker issues
- Pedantic nitpicks

## Output Format
Return JSON array of bug issues found in the diff.
`;
  }

  getCategory() {
    return 'bug';
  }

  async analyzeWithAI(prompt, diff) {
    if (!process.env.GEMINI_AI_KEY) {
      throw new Error('GEMINI_AI_KEY environment variable is required');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_KEY);
    const model = genAI.getGenerativeModel({ model: this.model });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt + "\n\n## Diff\n" + diff }] }],
      generationConfig: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      }
    });

    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn('Failed to parse AI response as JSON:', error.message);
      return [];
    }
  }
}