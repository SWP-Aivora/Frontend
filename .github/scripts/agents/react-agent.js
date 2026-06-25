import { AgentBase } from '../utils/agent-base.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class ReactAgent extends AgentBase {
  constructor() {
    super('react-practices');
  }

  getPrompt() {
    return `
You are a React Expert checking React best practices.

## Focus Areas
1. Hooks rules compliance
2. useEffect dependencies
3. Performance optimizations
4. Component patterns
5. Props validation

## Output Format
Return JSON array of React pattern issues.
`;
  }

  getCategory() {
    return 'react';
  }

  async analyzeWithAI(prompt, diff) {
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