import { AgentBase } from '../utils/agent-base.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class TestingAgent extends AgentBase {
  constructor() {
    super('testing-documentation');
  }

  getPrompt() {
    return `
You are a QA Engineer + Technical Writer reviewing testing and documentation.

## Focus Areas
1. Test coverage for new features
2. Edge cases in tests
3. Integration tests
4. Documentation completeness
5. README/API doc updates

## Output Format
Return JSON array of testing/documentation issues.
`;
  }

  getCategory() {
    return 'testing';
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