# Task 6: Create Subagent Review Harness

**Files:**
- Create: `.github/scripts/subagent-review-harness.js`
- Test: Integration tests for full harness

**Interfaces:**
- Consumes: PR metadata, GEMINI_AI_KEY
- Produces: GitHub review submission

- [ ] **Step 1: Write failing test**

Create `tests/harness.test.js`:
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubagentReviewHarness } from '../../.github/scripts/subagent-review-harness.js';

// Mock dependencies
vi.mock('@google/generative-ai');
vi.mock('../../.github/scripts/utils/gemini-context-reader.js');
vi.mock('fs');

describe('Subagent Review Harness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run full review process with mocked dependencies', async () => {
    // Mock Gemini AI
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: { text: () => '[]' }
    });
    
    // Mock context reader
    vi.mocked(require('../../.github/scripts/utils/gemini-context-reader.js')).readGeminiContext.mockResolvedValue({
      security: 'test security',
      architecture: 'test architecture'
    });
    
    // Mock file system
    vi.mocked(require('fs').readFileSync).mockReturnValue('test diff content');
    
    const harness = new SubagentReviewHarness('test-api-key');
    const result = await harness.run({
      prNumber: 123,
      prTitle: 'Test PR',
      prSha: 'abc123',
      diffFile: '/tmp/test.diff'
    });
    
    expect(result).toHaveProperty('reviewComment');
    expect(result).toHaveProperty('performanceMetrics');
    expect(result.performanceMetrics.duration).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/harness.test.js`
Expected: FAIL

- [ ] **Step 3: Create harness implementation**

Write `.github/scripts/subagent-review-harness.js`:
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readGeminiContext } from './utils/gemini-context-reader.js';
import { RequirementsAgent } from './agents/requirements-agent.js';
import { BugHunterAgent } from './agents/bug-hunter-agent.js';
import { SecurityAgent } from './agents/security-agent.js';
import { TypeScriptAgent } from './agents/typescript-agent.js';
import { ArchitectureAgent } from './agents/architecture-agent.js';
import { TestingAgent } from './agents/testing-agent.js';
import { ReactAgent } from './agents/react-agent.js';
import { scoreIssues } from './utils/confidence-scorer.js';
import { generateReviewComment } from './utils/github-reviewer.js';
import { RateLimiter } from './utils/rate-limiter.js';
import { readFileSync } from 'fs';

export class SubagentReviewHarness {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.rateLimiter = new RateLimiter();
    this.agents = [
      new RequirementsAgent(),
      new BugHunterAgent(),
      new SecurityAgent(),
      new TypeScriptAgent(),
      new ArchitectureAgent(),
      new TestingAgent(),
      new ReactAgent()
    ];
  }

  async run(prInfo) {
    const startTime = Date.now();
    
    try {
      // Step 1: Check rate limit
      await this.rateLimiter.waitForRateLimit();
      
      // Step 2: Read GEMINI.md context
      const geminiContext = await readGeminiContext();
      
      // Step 3: Read diff from file
      const diff = readFileSync(prInfo.diffFile, 'utf8');
      
      // Step 4: Spawn all agents in parallel with rate limiting
      const agentPromises = this.agents.map(async (agent) => {
        await this.rateLimiter.waitForRateLimit();
        return agent.run(diff, geminiContext);
      });
      
      const agentResults = await Promise.all(agentPromises);
      
      // Step 5: Flatten and score all issues
      const allIssues = agentResults.flatMap(result => result.issues);
      const scoredIssues = scoreIssues(allIssues);
      
      // Step 6: Generate review comment
      const reviewComment = generateReviewComment(
        scoredIssues,
        prInfo.prTitle,
        prInfo.prSha
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      return {
        reviewComment,
        performanceMetrics: {
          duration,
          agentsSpawned: this.agents.length,
          issuesFound: allIssues.length,
          reviewGenerated: scoredIssues.highConfidence.length > 0 || scoredIssues.mediumConfidence.length > 0
        }
      };
    } catch (error) {
      throw new Error(`Harness failed: ${error.message}`);
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/harness.test.js`
Expected: PASS

- [ ] **Step 5: Add CLI interface to harness**

Update the end of `.github/scripts/subagent-review-harness.js`:
```javascript
#!/usr/bin/env node

import { SubagentReviewHarness } from './subagent-review-harness.js';
import { argv } from 'node:process';

// Parse command line arguments
const args = argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg.startsWith('--')) {
    const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    options[key] = args[++i];
  }
}

// Validate required arguments
if (!options.prNumber || !options.prTitle || !options.prSha || !options.diffFile) {
  console.error('Missing required arguments:');
  console.error('--pr-number PR_NUMBER');
  console.error('--pr-title "PR Title"');
  console.error('--pr-sha abc123');
  console.error('--diff-file /path/to/diff');
  process.exit(1);
}

// Run harness
async function main() {
  try {
    const harness = new SubagentReviewHarness(process.env.GEMINI_AI_KEY);
    const result = await harness.run({
      prNumber: parseInt(options.prNumber),
      prTitle: options.prTitle,
      prSha: options.prSha,
      diffFile: options.diffFile
    });
    
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
```

- [ ] **Step 6: Create CLI interface test**

Create `tests/test-cli-interface.js`:
```javascript
import { spawn } from 'child_process';
import { describe, it, expect } from 'vitest';

describe('CLI Interface', () => {
  it('should parse command line arguments correctly', async () => {
    const child = spawn('node', [
      '.github/scripts/subagent-review-harness.js',
      '--pr-number', '123',
      '--pr-title', 'Test PR',
      '--pr-sha', 'abc123',
      '--diff-file', '/tmp/test.diff'
    ]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => stdout += data);
    child.stderr.on('data', (data) => stderr += data);

    await new Promise((resolve) => {
      child.on('close', resolve);
    });

    // Should fail due to missing API key, but not due to argument parsing
    expect(stderr).toContain('GEMINI_AI_KEY');
    expect(stderr).not.toContain('Missing required arguments');
  });
});
```

Run: `npm test -- tests/test-cli-interface.js`
Expected: Argument parsing works

- [ ] **Step 7: Commit**

```bash
git add .github/scripts/subagent-review-harness.js tests/harness.test.js tests/test-cli-interface.js
git commit -m "feat: add subagent review harness with CLI interface"
```