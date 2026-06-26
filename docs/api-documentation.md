# Enhanced Review System API Documentation

## Overview

This document provides detailed API documentation for the Enhanced Review System, including agent interfaces, utility functions, and configuration options.

## Core Classes

### SubagentReviewHarness

The main orchestrator class that manages all agents and coordinates the review process.

#### Constructor

```javascript
new SubagentReviewHarness(apiKey)
```

**Parameters:**
- `apiKey` (string): Gemini AI API key

#### Methods

##### run(prInfo)

Executes the enhanced review process.

```javascript
async run(prInfo) => {
  return {
    reviewComment: string,
    performanceMetrics: {
      duration: number,
      agentsSpawned: number,
      issuesFound: number,
      apiCalls: number,
      errors: number,
      averageAgentTime: number,
      peakMemory: object,
      efficiency: number
    }
  }
}
```

**Parameters:**
- `prInfo` (object):
  - `prNumber` (number): Pull request number
  - `prTitle` (string): Pull request title
  - `prSha` (string): Pull request SHA
  - `diffFile` (string): Path to diff file

**Returns:** Object with review comment and performance metrics

### Agent Base Class

All agents inherit from this base class.

#### Constructor

```javascript
new AgentBase()
```

#### Methods

##### run(diff, geminiContext)

Runs the agent's analysis.

```javascript
async run(diff, geminiContext) => {
  return {
    issues: [
      {
        id: string,
        title: string,
        description: string,
        confidence: number,
        category: string,
        recommendations: string[],
        location?: {
          file: string,
          line: number
        }
      }
    ]
  }
}
```

**Parameters:**
- `diff` (string): The pull request diff
- `geminiContext` (object): GEMINI.md context

**Returns:** Object containing array of issues

### PerformanceMonitor

Tracks and reports performance metrics.

#### Constructor

```javascript
new PerformanceMonitor()
```

#### Methods

##### start()

Starts performance monitoring.

```javascript
start()
```

##### recordAgentSpawn(agentName)

Records when an agent starts execution.

```javascript
recordAgentSpawn(agentName)
```

**Parameters:**
- `agentName` (string): Name of the agent

##### recordAgentCompletion(agentName)

Records when an agent finishes execution.

```javascript
recordAgentCompletion(agentName)
```

**Parameters:**
- `agentName` (string): Name of the agent

##### recordIssuesFound(count)

Records number of issues found.

```javascript
recordIssuesFound(count)
```

**Parameters:**
- `count` (number): Number of issues found

##### stop()

Stops monitoring and generates report.

```javascript
async stop() => {
  return {
    duration: number,
    agentsSpawned: number,
    issuesFound: number,
    apiCalls: number,
    errors: number,
    averageAgentTime: number,
    peakMemory: object,
    efficiency: number
  }
}
```

### EnhancedRateLimiter

Manages GitHub API rate limits.

#### Constructor

```javascript
new EnhancedRateLimiter(config)
```

**Parameters:**
- `config` (object): Rate limit configuration

#### Methods

##### checkRateLimit()

Checks current rate limit status.

```javascript
async checkRateLimit() => {
  return {
    remaining: number,
    shouldWait: boolean,
    resetTime: Date,
    usagePercentage: number
  }
}
```

##### waitForRateLimit()

Waits for rate limit if needed.

```javascript
async waitForRateLimit()
```

##### waitForSafeExecution(agentsCount, additionalRequests)

Ensures sufficient rate limit for execution.

```javascript
async waitForSafeExecution(agentsCount, additionalRequests = 0)
```

**Parameters:**
- `agentsCount` (number): Number of agents to spawn
- `additionalRequests` (number): Additional API calls needed

## Agent Specializations

### RequirementsAgent

Analyzes requirements compliance.

```javascript
const agent = new RequirementsAgent();
const result = await agent.run(diff, geminiContext);
```

**Focus:**
- Requirements matching
- Feature completeness
- Missing functionality
- Acceptance criteria validation

### BugHunterAgent

Finds bugs and logical errors.

```javascript
const agent = new BugHunterAgent();
const result = await agent.run(diff, geminiContext);
```

**Focus:**
- Logical errors
- Edge cases
- Null/undefined handling
- Crash prevention

### SecurityAgent

Detects security issues.

```javascript
const agent = new SecurityAgent();
const result = await agent.run(diff, geminiContext);
```

**Focus:**
- Vulnerabilities
- Input validation
- Hardcoded credentials
- Security best practices

### TypeScriptAgent

Checks TypeScript-specific issues.

```javascript
const agent = new TypeScriptAgent();
const result = await agent.run(diff, geminiContext);
```

**Focus:**
- Type annotations
- Interface usage
- Type safety
- TypeScript patterns

### ArchitectureAgent

Reviews architecture and design.

```javascript
const agent = new ArchitectureAgent();
const result = await agent.run(diff, geminiContext);
```

**Focus:**
- Design patterns
- Architectural consistency
- Coupling issues
- Scalability

### TestingAgent

Identifies testing issues.

```javascript
const agent = new TestingAgent();
const result = await agent.run(diff, geminiContext);
```

**Focus:**
- Missing tests
- Test quality
- Coverage gaps
- Test organization

### ReactAgent

Analyzes React-specific code.

```javascript
const agent = new ReactAgent();
const result = await agent.run(diff, geminiContext);
```

**Focus:**
- React patterns
- Performance issues
- Component structure
- Hooks usage

## Utility Functions

### Confidence Scorer

Scores issues based on confidence level.

```javascript
import { scoreIssues } from './utils/confidence-scorer.js';

const scoredIssues = scoreIssues(allIssues);
```

**Returns:**
```javascript
{
  highConfidence: [...],
  mediumConfidence: [...],
  lowConfidence: [...]
}
```

### GitHub Review Generator

Generates GitHub review comments.

```javascript
import { generateReviewComment } from './utils/github-reviewer.js';

const comment = generateReviewComment(scoredIssues, prTitle, prSha);
```

**Parameters:**
- `scoredIssues`: Object with high, medium, and low confidence issues
- `prTitle`: Pull request title
- `prSha`: Pull request SHA

### Gemini Context Reader

Reads and parses GEMINI.md context.

```javascript
import { readGeminiContext } from './utils/gemini-context-reader.js';

const context = await readGeminiContext();
```

**Returns:**
```javascript
{
  title: string,
  description: string,
  techStack: string[],
  codingStandards: object,
  patterns: object
}
```

## Configuration

### PerformanceConfig

Central configuration object.

```javascript
export const PerformanceConfig = {
  rateLimit: {
    minRemainingThreshold: 3,
    fallbackRemaining: 15,
    fallbackResetInterval: 60000,
    maxWaitTime: 300000
  },
  agents: {
    agentTimeout: 120000,
    maxConcurrentAgents: 7,
    retryAttempts: 2
  },
  monitoring: {
    memorySamplingInterval: 30000,
    progressLogInterval: 60000,
    detailedLogging: false
  }
};
```

### Individual Configuration Functions

```javascript
import { 
  getRateLimitConfig, 
  getAgentConfig, 
  getMonitoringConfig 
} from './config/performance-config.js';

const rateLimitConfig = getRateLimitConfig();
const agentConfig = getAgentConfig();
const monitoringConfig = getMonitoringConfig();
```

## CLI Usage

### Command Line Interface

```bash
node .github/scripts/subagent-review-harness.js \
  --pr-number 123 \
  --pr-title "Feature: Add user authentication" \
  --pr-sha abc123def456 \
  --diff-file /tmp/pr.diff \
  --verbose
```

### CLI Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--pr-number` | Yes | Pull request number |
| `--pr-title` | Yes | Pull request title |
| `--pr-sha` | Yes | Pull request SHA |
| `--diff-file` | Yes | Path to diff file |
| `--verbose` | No | Enable verbose logging |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_AI_KEY` | Gemini AI API key |
| `GITHUB_TOKEN` | GitHub token for API access |

## Error Handling

### Error Types

1. **RateLimitError**: Rate limit exceeded
2. **AgentError**: Agent execution failed
3. **APIError**: API call failed
4. **ConfigurationError**: Invalid configuration

### Error Handling Pattern

```javascript
try {
  const result = await harness.run(prInfo);
  console.log('Review completed:', result);
} catch (error) {
  console.error('Review failed:', error.message);
  
  if (error instanceof RateLimitError) {
    // Handle rate limit
  } else if (error instanceof AgentError) {
    // Handle agent failure
  }
}
```

## Performance Metrics

### Metric Types

- **Duration**: Total execution time in milliseconds
- **Agents Spawned**: Number of agents created
- **Issues Found**: Total issues detected
- **API Calls**: Number of API calls made
- **Errors**: Number of errors encountered
- **Average Agent Time**: Average time per agent
- **Peak Memory**: Peak memory usage
- **Efficiency**: Issues per minute

### Example Metrics

```json
{
  "duration": 15432,
  "agentsSpawned": 7,
  "issuesFound": 12,
  "apiCalls": 8,
  "errors": 0,
  "averageAgentTime": 1876,
  "peakMemory": {
    "heapUsed": 45,
    "heapTotal": 128,
    "rss": 512
  },
  "efficiency": 46.7
}
```

## Testing

### Unit Tests

```javascript
import { SubagentReviewHarness } from '../subagent-review-harness.js';

describe('SubagentReviewHarness', () => {
  it('should initialize with correct configuration', () => {
    const harness = new SubagentReviewHarness('test-key');
    expect(harness.agents).toHaveLength(7);
  });
});
```

### Integration Tests

```javascript
import { exec } from 'child_process';

describe('CLI Integration', () => {
  it('should validate CLI arguments', () => {
    // Test argument parsing and validation
  });
});
```

## Best Practices

### 1. Agent Development
- Extend AgentBase class
- Implement proper error handling
- Return consistent issue format
- Use appropriate confidence scores

### 2. Performance Optimization
- Monitor memory usage
- Implement proper timeout handling
- Use rate limiting effectively
- Cache when possible

### 3. Error Handling
- Handle failures gracefully
- Provide meaningful error messages
- Implement retry logic
- Log failures for debugging

### 4. Configuration Management
- Use the central config system
- Validate configuration
- Provide sensible defaults
- Document configuration options