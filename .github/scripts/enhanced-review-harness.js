#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import { readGeminiContext } from './utils/gemini-context-reader.js';
import { BugHunterAgent } from './agents/bug-hunter-agent.js';
import { TypeScriptAgent } from './agents/typescript-agent.js';
import { scoreIssues } from './utils/confidence-scorer.js';
import { generateReviewComment } from './utils/github-reviewer.js';
import { readFileSync } from 'fs';

export class EnhancedReviewHarness {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.agents = [
      new BugHunterAgent(),
      new TypeScriptAgent()
    ];
  }

  async run(prInfo) {
    const startTime = Date.now();

    try {
      // Step 1: Read GEMINI.md context
      const geminiContext = await readGeminiContext();

      // Step 2: Read diff from file
      const diff = readFileSync(prInfo.diffFile, 'utf8');

      // Step 3: Run both agents in parallel
      console.log(`🚀 Starting review with ${this.agents.length} agents...`);

      const agentPromises = this.agents.map(async (agent) => {
        console.log(`🤖 Running ${agent.name} agent...`);
        return agent.run(diff, geminiContext);
      });

      const agentResults = await Promise.all(agentPromises);

      // Step 4: Flatten all issues
      const allIssues = agentResults.flatMap(result => result.issues);

      // Step 5: Score issues by confidence
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
          criticalIssues: scoredIssues.highConfidence.length,
          importantIssues: scoredIssues.mediumConfidence.length
        },
        issues: allIssues
      };
    } catch (error) {
      console.error('❌ Harness failed:', error);
      throw new Error(`Harness failed: ${error.message}`);
    }
  }
}

// CLI interface

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
    const harness = new EnhancedReviewHarness(process.env.GEMINI_AI_KEY);
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