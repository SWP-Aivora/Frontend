import { AgentBase } from '../utils/agent-base.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class SecurityAgent extends AgentBase {
  constructor() {
    super('security-specialist');
  }

  getPrompt() {
    return `
You are a Security Engineer identifying security vulnerabilities in PR changes.

## Focus Areas
1. XSS vulnerabilities
2. Credential exposure
3. Unsafe APIs (eval, dangerouslySetInnerHTML)
4. Input validation issues
5. Authentication/authorization problems

## Output Format
Return JSON array of security issues.
`;
  }

  getCategory() {
    return 'security';
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