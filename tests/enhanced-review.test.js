import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SubagentReviewHarness } from '../.github/scripts/subagent-review-harness.js';
import { PerformanceMonitor } from '../.github/scripts/utils/performance-monitor.js';
import { EnhancedRateLimiter } from '../.github/scripts/utils/enhanced-rate-limiter.js';
import { PerformanceConfig } from '../.github/scripts/config/performance-config.js';

// Mock dependencies
vi.mock('../.github/scripts/utils/gemini-context-reader.js');
vi.mock('../.github/scripts/utils/confidence-scorer.js');
vi.mock('../.github/scripts/utils/github-reviewer.js');
vi.mock('fs', () => ({
  readFileSync: vi.fn()
}));

const { readGeminiContext } = await import('../.github/scripts/utils/gemini-context-reader.js');
const { scoreIssues } = await import('../.github/scripts/utils/confidence-scorer.js');
const { generateReviewComment } = await import('../.github/scripts/utils/github-reviewer.js');
const { readFileSync } = await import('fs');

describe('Enhanced Review System', () => {
  const mockApiKey = 'test-api-key';
  let harness;
  let mockRateLimiter;

  beforeEach(() => {
    // Mock rate limiter
    mockRateLimiter = {
      waitForSafeExecution: vi.fn().mockResolvedValue({
        remaining: 10,
        shouldWait: false
      })
    };

    harness = new SubagentReviewHarness(mockApiKey);
    harness.rateLimiter = mockRateLimiter;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(harness.genAI).toBeDefined();
      expect(harness.rateLimiter).toBeDefined();
      expect(harness.performanceMonitor).toBeInstanceOf(PerformanceMonitor);
      expect(harness.agents).toHaveLength(7);
    });

    it('should have all required agent types', () => {
      const agentNames = harness.agents.map(agent => agent.constructor.name);
      const expectedAgents = [
        'RequirementsAgent',
        'BugHunterAgent',
        'SecurityAgent',
        'TypeScriptAgent',
        'ArchitectureAgent',
        'TestingAgent',
        'ReactAgent'
      ];

      expectedAgents.forEach(name => {
        expect(agentNames).toContain(name);
      });
    });
  });

  describe('Rate Limit Management', () => {
    it('should check rate limit before spawning agents', async () => {
      mockRateLimiter.waitForSafeExecution = vi.fn().mockResolvedValue({
        remaining: 10,
        shouldWait: false
      });

      vi.mocked(readGeminiContext).mockResolvedValue({
        title: 'Test Project',
        description: 'Test Description'
      });

      vi.mocked(readFileSync).mockReturnValue('test diff content');

      vi.mocked(scoreIssues).mockReturnValue({
        highConfidence: [],
        mediumConfidence: [],
        lowConfidence: []
      });

      vi.mocked(generateReviewComment).mockReturnValue('Test review comment');

      await harness.run({
        prNumber: 123,
        prTitle: 'Test PR',
        prSha: 'abc123',
        diffFile: '/tmp/test.diff'
      });

      expect(mockRateLimiter.waitForSafeExecution).toHaveBeenCalledWith(7);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track agent spawn times', async () => {
      mockRateLimiter.waitForSafeExecution = vi.fn().mockResolvedValue({
        remaining: 10,
        shouldWait: false
      });

      vi.mocked(readGeminiContext).mockResolvedValue({
        title: 'Test Project',
        description: 'Test Description'
      });

      vi.mocked(readFileSync).mockReturnValue('test diff content');

      vi.mocked(scoreIssues).mockReturnValue({
        highConfidence: [],
        mediumConfidence: [],
        lowConfidence: []
      });

      vi.mocked(generateReviewComment).mockReturnValue('Test review comment');

      await harness.run({
        prNumber: 123,
        prTitle: 'Test PR',
        prSha: 'abc123',
        diffFile: '/tmp/test.diff'
      });

      // Check that performance monitor recorded agent times
      expect(harness.performanceMonitor.metrics.agentsSpawned).toBe(7);
      expect(harness.performanceMonitor.metrics.agentTimes).toHaveLength(7);
    });

    it('should track issues found by agents', async () => {
      mockRateLimiter.waitForSafeExecution = vi.fn().mockResolvedValue({
        remaining: 10,
        shouldWait: false
      });

      vi.mocked(readGeminiContext).mockResolvedValue({
        title: 'Test Project',
        description: 'Test Description'
      });

      vi.mocked(readFileSync).mockReturnValue('test diff content');

      vi.mocked(scoreIssues).mockReturnValue({
        highConfidence: [],
        mediumConfidence: [],
        lowConfidence: []
      });

      vi.mocked(generateReviewComment).mockReturnValue('Test review comment');

      await harness.run({
        prNumber: 123,
        prTitle: 'Test PR',
        prSha: 'abc123',
        diffFile: '/tmp/test.diff'
      });

      expect(harness.performanceMonitor.metrics.issuesFound).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limit errors gracefully', async () => {
      mockRateLimiter.waitForSafeExecution = vi.fn().mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(harness.run({
        prNumber: 123,
        prTitle: 'Test PR',
        prSha: 'abc123',
        diffFile: '/tmp/test.diff'
      })).rejects.toThrow('Harness failed: Rate limit exceeded');
    });

    it('should handle API errors', async () => {
      mockRateLimiter.waitForSafeExecution = vi.fn().mockResolvedValue({
        remaining: 10,
        shouldWait: false
      });

      vi.mocked(readGeminiContext).mockRejectedValue(new Error('API error'));

      await expect(harness.run({
        prNumber: 123,
        prTitle: 'Test PR',
        prSha: 'abc123',
        diffFile: '/tmp/test.diff'
      })).rejects.toThrow('Harness failed: API error');
    });
  });

  describe('Configuration', () => {
    it('should use performance configuration', () => {
      const config = PerformanceConfig;
      expect(config.rateLimit.minRemainingThreshold).toBe(3);
      expect(config.agents.agentTimeout).toBe(120000);
      expect(config.monitoring.memorySamplingInterval).toBe(30000);
    });

    it('should provide utility functions for config', () => {
      const rateLimitConfig = getRateLimitConfig();
      expect(rateLimitConfig).toBeDefined();
      expect(rateLimitConfig.minRemainingThreshold).toBe(3);
    });
  });
});

describe('Performance Monitor', () => {
  let monitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should start with empty metrics', () => {
    monitor.start();
    expect(monitor.metrics.agentsSpawned).toBe(0);
    expect(monitor.metrics.issuesFound).toBe(0);
    expect(monitor.metrics.startTime).not.toBeNull();
  });

  it('should record agent spawn', () => {
    monitor.start();
    monitor.recordAgentSpawn('TestAgent');
    expect(monitor.metrics.agentsSpawned).toBe(1);
    expect(monitor.metrics.agentTimes[0].agent).toBe('TestAgent');
  });

  it('should record agent completion', () => {
    monitor.start();
    monitor.recordAgentSpawn('TestAgent');
    monitor.recordAgentCompletion('TestAgent');
    const agent = monitor.metrics.agentTimes.find(a => a.agent === 'TestAgent');
    expect(agent.endTime).not.toBeNull();
  });

  it('should generate performance report', async () => {
    monitor.start();
    monitor.recordAgentSpawn('TestAgent');
    monitor.recordAgentCompletion('TestAgent');
    monitor.recordIssuesFound(5);

    const report = await monitor.stop();
    expect(report.duration).toBeGreaterThan(0);
    expect(report.agentsSpawned).toBe(1);
    expect(report.issuesFound).toBe(5);
    expect(report.averageAgentTime).toBeGreaterThan(0);
  });
});

describe('Enhanced Rate Limiter', () => {
  let limiter;

  beforeEach(() => {
    limiter = new EnhancedRateLimiter();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default config', () => {
    expect(limiter.config.minRemainingThreshold).toBe(3);
    expect(limiter.config.fallbackRemaining).toBe(15);
  });

  it('should check rate limit status', async () => {
    const status = await limiter.checkRateLimit();
    expect(status).toHaveProperty('remaining');
    expect(status).toHaveProperty('shouldWait');
    expect(status).toHaveProperty('resetTime');
  });

  it('should wait for safe execution', async () => {
    limiter.checkRateLimit = vi.fn().mockResolvedValue({
      remaining: 10,
      shouldWait: false
    });

    const status = await limiter.waitForSafeExecution(5);
    expect(status.remaining).toBe(10);
    expect(status.shouldWait).toBe(false);
  });

  it('should handle insufficient rate limit', async () => {
    limiter.checkRateLimit = vi.fn().mockResolvedValue({
      remaining: 2,
      shouldWait: true
    });

    limiter.waitForRateLimit = vi.fn();

    await limiter.waitForSafeExecution(5);
    expect(limiter.waitForRateLimit).toHaveBeenCalled();
  });
});