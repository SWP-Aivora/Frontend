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