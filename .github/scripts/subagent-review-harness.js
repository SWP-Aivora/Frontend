import { GoogleGenerativeAI } from '@google/generative-ai';
import { readGeminiContext, getGeminiContextCache } from './utils/gemini-context-cache.js';
import { agentRegistry } from './utils/agent-registry.js';
import { scoreIssues } from './utils/confidence-scorer.js';
import { generateReviewComment } from './utils/github-reviewer.js';
import { RateLimiter } from './utils/rate-limiter.js';
import { PerformanceMonitor } from './utils/performance-monitor.js';
import { readFileSync } from 'fs';

export class SubagentReviewHarness {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.rateLimiter = new RateLimiter();
    this.performanceMonitor = new PerformanceMonitor();
    this.cache = getGeminiContextCache();
    this.agents = agentRegistry.getAll();
  }

  async run(prInfo) {
    try {
      // Start performance monitoring
      this.performanceMonitor.start();

      // Step 1: Check rate limit before spawning agents
      await this.rateLimiter.waitForSafeExecution(this.agents.length);

      // Step 2: Read GEMINI.md context with caching
      const geminiContext = await this.cache.getContextWithCache('./GEMINI.md');
      this.performanceMonitor.recordApiCall();

      // Step 3: Read diff from file
      const diff = readFileSync(prInfo.diffFile, 'utf8');

      // Step 4: Spawn all agents in parallel with rate limiting
      const agentPromises = this.agents.map(async (agent) => {
        const agentName = agent.constructor.name;
        this.performanceMonitor.recordAgentSpawn(agentName);
        this.performanceMonitor.recordRateLimitCheck();

        await this.rateLimiter.waitForRateLimit();

        const result = await agent.run(diff, geminiContext);
        this.performanceMonitor.recordAgentCompletion(agentName);

        // Record issues found by this agent
        if (result.issues && result.issues.length > 0) {
          this.performanceMonitor.recordIssuesFound(result.issues.length);
        }

        return result;
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

      // Stop performance monitoring and generate report
      const performanceReport = await this.performanceMonitor.stop();

      // Log performance summary
      console.log('\n📊 Performance Summary:');
      console.log(`   - Total duration: ${performanceReport.duration}ms`);
      console.log(`   - Agents spawned: ${performanceReport.agentsSpawned}`);
      console.log(`   - Issues found: ${performanceReport.issuesFound}`);
      console.log(`   - API calls: ${performanceReport.apiCalls}`);
      console.log(`   - Errors: ${performanceReport.errors}`);
      console.log(`   - Efficiency: ${performanceReport.efficiency} issues/min`);
      console.log(`   - Peak memory: ${performanceReport.peakMemory.heapUsed}MB used`);
      console.log(`   - Avg agent time: ${performanceReport.averageAgentTime}ms`);

      return {
        reviewComment,
        performanceMetrics: performanceReport
      };
    } catch (error) {
      this.performanceMonitor.recordError(error);
      throw new Error(`Harness failed: ${error.message}`);
    }
  }
}


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

// Parse additional options
const optionsWithDefaults = {
  ...options,
  verbose: options.verbose || false
};

// Run harness
async function main() {
  try {
    if (optionsWithDefaults.verbose) {
      console.log('🚀 Starting Enhanced Code Review...');
      console.log(`📄 PR #${options.prNumber}: ${options.prTitle}`);
      console.log(`🔍 Analyzing diff from: ${options.diffFile}`);
      console.log('');
    }

    const prNumber = parseInt(options.prNumber);
    if (isNaN(prNumber)) {
      throw new Error('prNumber must be a valid number');
    }

    const harness = new SubagentReviewHarness(process.env.GEMINI_AI_KEY);
    const result = await harness.run({
      prNumber: prNumber,
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