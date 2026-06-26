# Task 3: Create Agent Base Class and Individual Agents

**Files:**
- Create: `.github/scripts/utils/agent-base.js`
- Create: `.github/scripts/agents/requirements-agent.js`
- Create: `.github/scripts/agents/bug-hunter-agent.js`
- Create: `.github/scripts/agents/security-agent.js`
- Create: `.github/scripts/agents/typescript-agent.js`
- Create: `.github/scripts/agents/architecture-agent.js`
- Create: `.github/scripts/agents/testing-agent.js`
- Create: `.github/scripts/agents/react-agent.js`

**Interfaces:**
- Consumes: Agent-specific prompt, PR diff, Gemini context
- Produces: Array of issues with confidence scores

- [ ] **Step 1: Write the failing test for base class**

Create `tests/utils/agent-base.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { AgentBase } from '../../../.github/scripts/utils/agent-base.js';

class TestAgent extends AgentBase {
  getPrompt() {
    return 'Review for test issues';
  }
  
  analyze(content) {
    return [
      { file: 'test.js', line: 1, description: 'Test issue', confidence: 85 }
    ];
  }
}

describe('Agent Base', () => {
  it('should create agent with proper structure', async () => {
    const agent = new TestAgent();
    const result = await agent.run('test diff', { test: 'context' });
    
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('summary');
    expect(result.issues).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/utils/agent-base.test.js`
Expected: FAIL with module not found

- [ ] **Step 3: Create agent base implementation**

Write `.github/scripts/utils/agent-base.js`:
```javascript
export class AgentBase {
  constructor(name, model = 'gemini-3.1-flash-lite') {
    this.name = name;
    this.model = model;
  }

  async run(diff, context) {
    const prompt = this.getPrompt(context);
    const issues = await this.analyzeWithAI(prompt, diff);
    
    return {
      agent: this.name,
      summary: this.generateSummary(issues),
      issues: issues.map(issue => ({
        ...issue,
        category: this.getCategory()
      }))
    };
  }

  async analyzeWithAI(prompt, diff) {
    // Implementation must be provided by subclass
    throw new Error(`analyzeWithAI must be implemented by ${this.name} agent`);
  }

  getPrompt(context) {
    throw new Error(`getPrompt must be implemented by ${this.name} agent`);
  }

  generateSummary(issues) {
    const total = issues.length;
    const critical = issues.filter(i => i.confidence >= 80).length;
    return `Found ${total} issues (${critical} critical)`;
  }

  getCategory() {
    throw new Error(`getCategory must be implemented by ${this.name} agent`);
  }
}
```

- [ ] **Step 4: Create Requirements Agent implementation**

Write `.github/scripts/agents/requirements-agent.js`:
```javascript
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
```

- [ ] **Step 5: Create Bug Hunter Agent implementation**

Write `.github/scripts/agents/bug-hunter-agent.js`:
```javascript
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
```

- [ ] **Step 6: Create Security Agent implementation**

Write `.github/scripts/agents/security-agent.js`:
```javascript
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
```

- [ ] **Step 7: Create TypeScript Agent implementation**

Write `.github/scripts/agents/typescript-agent.js`:
```javascript
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
```

- [ ] **Step 8: Create Architecture Agent implementation**

Write `.github/scripts/agents/architecture-agent.js`:
```javascript
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
```

- [ ] **Step 9: Create Testing Agent implementation**

Write `.github/scripts/agents/testing-agent.js`:
```javascript
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
```

- [ ] **Step 10: Create React Agent implementation**

Write `.github/scripts/agents/react-agent.js`:
```javascript
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
```

- [ ] **Step 11: Run tests to verify all agents work**

Run: `npm test -- tests/agents/`
Expected: All agent tests PASS

- [ ] **Step 12: Commit**

```bash
git add .github/scripts/utils/agent-base.js .github/scripts/agents/
git commit -m "feat: add all 7 specialized agents"
```