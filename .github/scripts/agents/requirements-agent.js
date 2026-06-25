import { AgentBase } from '../utils/agent-base.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class RequirementsAgent extends AgentBase {
  constructor() {
    super('requirements-compliance');
  }

  getPrompt(context) {
    return `
You are a Senior Requirements Analyst validating PR changes against GEMINI.md guidelines.

## Project Guidelines
${context.security}
${context.architecture}
${context.typescript}

## Your Task
Review the PR diff and check for compliance with GEMINI.md requirements.

## Check Areas
1. Security & System Integrity
2. Architecture compliance (FSD layers)
3. TypeScript strictness rules
4. Data validation patterns

## Output Format
Return JSON array:
[
  {
    "file": "path/to/file",
    "line": 42,
    "description": "Issue description",
    "confidence": 85
  }
]`;
  }

  getCategory() {
    return 'requirements';
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