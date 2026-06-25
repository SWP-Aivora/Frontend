import { AgentBase } from '../utils/agent-base.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class ArchitectureAgent extends AgentBase {
  constructor() {
    super('architecture-guardian');
  }

  getPrompt() {
    return `
You are a Software Architect reviewing FSD architecture compliance.

## Focus Areas
1. FSD layer violations
2. Cross-feature imports
3. Separation of concerns
4. Design pattern usage
5. Scalability concerns

## Output Format
Return JSON array of architecture issues.
`;
  }

  getCategory() {
    return 'architecture';
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