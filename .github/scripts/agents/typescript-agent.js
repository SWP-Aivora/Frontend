import { AgentBase } from '../utils/agent-base.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class TypeScriptAgent extends AgentBase {
  constructor() {
    super('typescript-expert');
  }

  getPrompt() {
    return `
You are a TypeScript Specialist checking TypeScript compliance.

## Focus Areas
1. Missing import type usage
2. Enum usage (should use const instead)
3. Unnecessary any types
4. Generic usage correctness
5. Type safety in new code

## Output Format
Return JSON array of TypeScript issues.
`;
  }

  getCategory() {
    return 'typescript';
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