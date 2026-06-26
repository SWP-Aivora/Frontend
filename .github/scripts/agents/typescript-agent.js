import { AgentBase } from '../utils/agent-base.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class TypeScriptAgent extends AgentBase {
  constructor() {
    super('typescript-expert');
  }

  getPrompt(context) {
    return `
You are a TypeScript Specialist checking TypeScript strict compliance.

## Project Guidelines (from GEMINI.md)
${context.typescript || ''}
${context.security || ''}

## TypeScript Rules to Check (strict mode)
1. MUST use \`import type\` for type-only imports
2. MUST NOT use standard enum - use \`const X = {...} as const\` instead
3. Unnecessary any types (where avoidable)
4. Generic type usage correctness
5. Missing return type annotations
6. Proper typing for React props and state
7. Type safety in new code

## Confidence Scoring
- 0: False positive, doesn't hold up under scrutiny
- 25: Might be real, could also be false positive
- 50: Real but minor, nitpick
- 75: Verified real and important
- 100: Absolutely certain, violates GEMINI.md

## What NOT to flag
- Pre-existing issues not introduced in this PR
- Linter will catch imports/formatting issues
- Stylistic preferences not in GEMINI.md
- Issues on lines the author did not modify

## Output Format
Respond with ONLY valid JSON:
[
  {
    "file": "path/to/file.tsx",
    "line": 42,
    "description": "TypeScript compliance issue",
    "confidence": 85,
    "suggestion": "How to fix it"
  }
]

If no issues found, return: {"issues": []}`;
  }

  getCategory() {
    return 'typescript';
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
      console.warn('Failed to parse TypeScript response as JSON:', error.message);
      console.log('Raw response:', text);
      return [];
    }
  }
}