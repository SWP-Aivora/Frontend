import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Mock child_process
vi.mock('child_process');
const { exec: mockExec } = await import('child_process');

describe('GitHub Workflow Integration Tests', () => {
  const workflowPath = resolve(__dirname, '../../.github/workflows/enhanced-review.yml');
  let workflowContent;
  let mockEnv;

  beforeEach(() => {
    mockEnv = {
      GEMINI_AI_KEY: 'test-api-key',
      GITHUB_TOKEN: 'test-github-token',
      BOT_GITHUB_TOKEN: 'test-bot-token'
    };

    // Mock successful exec calls
    mockExec.mockImplementation((command, options, callback) => {
      // Simulate successful execution
      setImmediate(() => {
        callback(null, { stdout: '', stderr: '' });
      });
    });

    // Read actual workflow content for testing
    if (existsSync(workflowPath)) {
      workflowContent = readFileSync(workflowPath, 'utf8');
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Workflow File Validation', () => {
    it('should have valid YAML structure', () => {
      expect(workflowContent).toBeDefined();
      expect(workflowContent).toContain('name: Gemini AI Enhanced Code Review');
      expect(workflowContent).toContain('on:');
      expect(workflowContent).toContain('jobs:');
      expect(workflowContent).toContain('enhanced-review:');
    });

    it('should have correct trigger configuration', () => {
      expect(workflowContent).toContain('pull_request:');
      expect(workflowContent).toContain('pull_request_target:');
    });

    it('should have proper concurrency settings', () => {
      expect(workflowContent).toContain('concurrency:');
      expect(workflowContent).toContain('group: ${{ github.workflow }}-${{ github.ref }}');
    });

    it('should have correct permissions', () => {
      expect(workflowContent).toContain('permissions:');
      expect(workflowContent).toContain('pull-request: write');
      expect(workflowContent).toContain('contents: read');
    });
  });

  describe('Workflow Steps', () => {
    it('should have automated checks job', () => {
      expect(workflowContent).toContain('name: Automated Checks');
      expect(workflowContent).toContain('uses: actions/checkout@v4');
      expect(workflowContent).toContain('uses: actions/setup-node@v4');
      expect(workflowContent).toContain('npm ci');
    });

    it('should have enhanced review job', () => {
      expect(workflowContent).toContain('name: Enhanced Review');
      expect(workflowContent).toContain('needs: automated-checks');
      expect(workflowContent).toContain('uses: ./.github/scripts/subagent-review-harness.js');
    });

    it('should have proper diff processing', () => {
      expect(workflowContent).toContain('pull-request.diff');
      expect(workflowContent).toContain('with:');
      expect(workflowContent).toContain('files:');
    });

    it('should have skip logic for no reviewable changes', () => {
      expect(workflowContent).toContain('if: github.event.pull_request.draft == false');
      expect(workflowContent).toContain('github.event.pull_request.added_files');
      expect(workflowContent).toContain('github.event.pull_request.modified_files');
    });

    it('should have review submission step', () => {
      expect(workflowContent).toContain('name: Submit Review');
      expect(workflowContent).toContain('uses: actions/github-script@v7');
    });
  });

  describe('Environment Variables', () => {
    it('should use correct environment variables', () => {
      expect(workflowContent).toContain('env:');
      expect(workflowContent).toContain('GEMINI_AI_KEY: ${{ secrets.GEMINI_AI_KEY }}');
      expect(workflowContent).toContain('GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}');
      expect(workflowContent).toContain('BOT_GITHUB_TOKEN: ${{ secrets.BOT_GITHUB_TOKEN }}');
    });
  });

  describe('Error Handling', () => {
    it('should handle review dismissal', () => {
      expect(workflowContent).toContain('github.event.review.state');
      expect(workflowContent).toContain('dismissed');
    });

    it('should handle review event determination', () => {
      expect(workflowContent).toContain('github.event.action');
      expect(workflowContent).toContain('submitted');
      expect(workflowContent).toContain('edited');
    });
  });
});

describe('Workflow Performance', () => {
  const workflowPath = resolve(__dirname, '../../.github/workflows/enhanced-review.yml');

  it('should have efficient timeout settings', () => {
    const workflowContent = readFileSync(workflowPath, 'utf8');
    expect(workflowContent).toBeDefined();
    expect(workflowContent).toContain('timeout-minutes: 30');
  });

  it('should handle large diffs', () => {
    const workflowContent = readFileSync(workflowPath, 'utf8');
    expect(workflowContent).toContain('MAX_CHARS: 100_000');
    expect(workflowContent).toContain('diff truncated due to size');
  });

  it('should have proper resource limits', () => {
    const workflowContent = readFileSync(workflowPath, 'utf8');
    expect(workflowContent).toContain('timeout-minutes: 30');
    expect(workflowContent).toContain('resources:');
  });
});

describe('Script File Validation', () => {
  it('should have all required agent files', () => {
    const agentPath = resolve(__dirname, '../../.github/scripts/agents');
    const agents = [
      'requirements-agent.js',
      'bug-hunter-agent.js',
      'security-agent.js',
      'typescript-agent.js',
      'architecture-agent.js',
      'testing-agent.js',
      'react-agent.js'
    ];

    agents.forEach(agent => {
      const agentFile = resolve(agentPath, agent);
      expect(existsSync(agentFile)).toBe(true);
    });
  });

  it('should have subagent review harness', () => {
    const harnessPath = resolve(__dirname, '../../.github/scripts/subagent-review-harness.js');
    expect(existsSync(harnessPath)).toBe(true);
  });

  it('should have utility files', () => {
    const utilsPath = resolve(__dirname, '../../.github/scripts/utils');
    const utils = [
      'agent-registry.js',
      'gemini-context-reader.js',
      'github-reviewer.js',
      'confidence-scorer.js'
    ];

    utils.forEach(util => {
      const utilFile = resolve(utilsPath, util);
      expect(existsSync(utilFile)).toBe(true);
    });
  });
});